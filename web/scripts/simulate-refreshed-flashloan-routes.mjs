// Read-only historical DeepBook PTB replay after removing only its expired epoch constraint.
// Original commands, inputs, package IDs and object refs remain unchanged. No signing or execution.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const webRoot = path.resolve(import.meta.dirname, '..');
const projectRoot = path.resolve(webRoot, '..');
const cfg = Object.fromEntries(fs.readFileSync(path.join(webRoot, '.env.local'), 'utf8')
  .split(/\r?\n/).filter(x => /^[A-Z_]+=.*/.test(x))
  .map(x => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
if (!cfg.TATUM_API_KEY) throw new Error('Tatum key missing');

const native = new GrpcTransport({
  host: 'sui-mainnet-grpc.gateway.tatum.io:443',
  channelCredentials: ChannelCredentials.createSsl(),
});
function withAuth(opts) {
  return { ...opts, meta: { ...opts?.meta, 'x-api-key': cfg.TATUM_API_KEY }, timeout: 45000 };
}
const transport = {
  mergeOptions: options => withAuth(native.mergeOptions(options)),
  unary: (method, input, options) => native.unary(method, input, withAuth(options)),
  serverStreaming: (method, input, options) => native.serverStreaming(method, input, withAuth(options)),
  clientStreaming: (method, options) => native.clientStreaming(method, withAuth(options)),
  duplex: (method, options) => native.duplex(method, withAuth(options)),
};
const client = new SuiGrpcClient({ network: 'mainnet', transport });
const candidates = ['context-XkAz3VrtFLpv.json', 'context-BbRZD7YfTiiN.json'];
const results = [];
for (const file of candidates) {
  const saved = JSON.parse(fs.readFileSync(path.join(projectRoot, 'evidence', file), 'utf8'));
  const bytes = saved.transactionData?.bcs?.value?.data;
  if (!Array.isArray(bytes) || bytes.length < 100) throw new Error('Missing raw transaction BCS in ' + file);
  const tx = Transaction.from(Uint8Array.from(bytes));
  const before = tx.getData();
  tx.setExpiration(null);
  const after = tx.getData();
  try {
    const result = await client.simulateTransaction({
      transaction: tx,
      include: { effects: true, balanceChanges: true, commandResults: true, transaction: true },
      doGasSelection: false,
    });
    const body = result.Transaction || result.FailedTransaction || {};
    const entry = {
      digest: saved.digest,
      replay: 'original-bcs-with-expiration-cleared',
      originalExpiration: before.expiration ?? null,
      submittedExpiration: after.expiration ?? null,
      originalCommandCount: before.commands?.length ?? null,
      provider: 'Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction',
      outcome: result.$kind,
      statusSuccess: body.status?.success ?? null,
      error: body.status?.error?.message ?? body.status?.error ?? null,
      gasPaymentMocked: result.gasPaymentMocked ?? null,
      commandResultCount: result.commandResults?.length ?? null,
      checkedAt: new Date().toISOString(),
      signed: false,
      onchainExecuted: false,
    };
    results.push(entry);
    console.log('REFRESHED_REPLAY', JSON.stringify(entry));
  } catch (error) {
    const entry = {
      digest: saved.digest,
      replay: 'original-bcs-with-expiration-cleared',
      originalExpiration: before.expiration ?? null,
      submittedExpiration: after.expiration ?? null,
      provider: 'Tatum Sui Mainnet gRPC TransactionExecutionService.SimulateTransaction',
      outcome: 'transport-or-validation-error',
      errorName: error?.name || 'Error',
      errorCode: error?.code || null,
      error: String(error?.message || error).slice(0, 500),
      checkedAt: new Date().toISOString(),
      signed: false,
      onchainExecuted: false,
    };
    results.push(entry);
    console.log('REFRESHED_REPLAY', JSON.stringify(entry));
  }
}
const dest = path.join(projectRoot, 'evidence', 'refreshed-flashloan-simulation-attempts.json');
fs.writeFileSync(dest, JSON.stringify(results, null, 2) + '\n');
console.log('RESULTS_SAVED', dest);
