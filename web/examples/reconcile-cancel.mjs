/**
 * Reference integration correction for duplicate DeepBook cancellation.
 * Reconciles authenticated chain reads; never sends a transaction.
 * A successful cancellation of a DIFFERENT order is not a repair.
 */
function cancelIdentity(executed) {
  const tx = executed?.transaction;
  const ptb = tx?.kind?.data?.programmableTransaction;
  const commands = (ptb?.commands || []).map(value => value.command);
  if (commands.length !== 2 || commands[0]?.oneofKind !== 'moveCall' ||
      commands[1]?.oneofKind !== 'moveCall') return null;
  const proof = commands[0].moveCall;
  const cancel = commands[1].moveCall;
  if (proof.module !== 'balance_manager' || proof.function !== 'generate_proof_as_owner' ||
      cancel.module !== 'pool' || cancel.function !== 'cancel_order' ||
      proof.package !== cancel.package) return null;
  const objectArg = argument => argument?.kind === 2 ? ptb.inputs[argument.input]?.objectId : null;
  const pool = objectArg(cancel.arguments[0]);
  const manager = objectArg(cancel.arguments[1]);
  if (!pool || !manager || manager !== objectArg(proof.arguments[0])) return null;
  const orderArg = cancel.arguments[3];
  const order = orderArg?.kind === 2 ? ptb.inputs[orderArg.input]?.pure : null;
  const bytes = order?.data || (order?.base64 ? Buffer.from(order.base64, 'base64') : null);
  if (!bytes || bytes.length !== 16) return null;
  return {sender:tx.sender,package:cancel.package,pool,manager,
    types:cancel.typeArguments,orderBytes:Buffer.from(bytes).toString('hex')};
}
function hasCancellationEvent(executed, identity) {
  const orderId = BigInt('0x' + Buffer.from(identity.orderBytes, 'hex').reverse().toString('hex')).toString();
  return (executed.events?.events || []).some(event => {
    const fields = event.json?.kind?.structValue?.fields;
    const string = name => fields?.[name]?.kind?.stringValue;
    return event.packageId === identity.package && event.module === 'pool' &&
      event.eventType?.endsWith('::order::OrderCanceled') &&
      string('order_id') === orderId && string('pool_id') === identity.pool &&
      string('balance_manager_id') === identity.manager && string('trader') === identity.sender;
  });
}
export function reconcileDuplicateCancel(failed, authenticatedHistory) {
  const unresolved = {outcome:'investigate',reason:'No independently confirmed earlier cancellation of this exact order.'};
  if (failed?.effects?.status?.success !== false ||
      failed.effects.status.error?.errorDetails?.abort?.abortCode !== '5' ||
      failed.effects.status.error.errorDetails.abort.location?.module !== 'big_vector' ||
      failed.effects.status.error.errorDetails.abort.location?.functionName !== 'leaf_remove') return unresolved;
  const identity = cancelIdentity(failed);
  if (!identity || !/^\d+$/.test(String(failed.checkpoint)) || !identity.sender ||
      failed.effects.status.error.errorDetails.abort.location.package !== identity.package) return unresolved;
  const prior = authenticatedHistory.find(value => {
    if (value.digest === failed.digest || value.effects?.status?.success !== true || !/^\d+$/.test(String(value.checkpoint))) return false;
    if (BigInt(value.checkpoint) >= BigInt(failed.checkpoint)) return false;
    const candidate = cancelIdentity(value);
    return candidate && JSON.stringify(candidate) === JSON.stringify(identity) && hasCancellationEvent(value, candidate);
  });
  return prior ? {outcome:'already-completed',reason:'The identical order was cancelled successfully before the failed retry.',
    originalSuccessDigest:prior.digest,failedRetryDigest:failed.digest,identity,
    nextAction:'Reconcile the local order as cancelled. Do not submit another cancellation for this order ID.',
    historicalOperatorCodeChange:'unknown',onchainRepairClaimed:false} : unresolved;
}
