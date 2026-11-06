/**
 * Strict quote + atomic simulation preflight for the Casewake incident route.
 * No signing, broadcasting or proof of historical onchain repair.
 *
 * quotedOutputMist is the TOTAL intended SUI available for repayment:
 *   untouched borrowed SUI + quoted output of the borrowed portion swapped.
 * Slippage affects ONLY the swapped output, never the untouched loan reserve.
 */
export function assessRepaymentCandidate({
  principalMist,
  quotedOutputMist,
  untouchedReserveMist = 0n,
  slippageBps = 50,
  minimumProfitMist = 0n,
  atomicSimulation = null,
  walletCoinFunding = false,
}) {
  const principal = BigInt(principalMist);
  const quoted = BigInt(quotedOutputMist);
  const reserve = BigInt(untouchedReserveMist);
  const floorProfit = BigInt(minimumProfitMist);
  if (principal <= 0n || quoted < 0n || reserve < 0n || reserve > principal
      || reserve > quoted || !Number.isInteger(slippageBps)
      || slippageBps < 0 || slippageBps > 10000 || floorProfit < 0n) {
    throw new Error('Invalid repayment guard input');
  }
  const tradedOutput = quoted - reserve;
  const conservativeTraded = tradedOutput * BigInt(10000 - slippageBps) / 10000n;
  const conservativeOutput = reserve + conservativeTraded;
  const required = principal + floorProfit;
  const quotePass = conservativeOutput >= required;
  const simulationPass = atomicSimulation?.outcome === 'Transaction'
      && atomicSimulation?.success === true
      && atomicSimulation?.error == null;
  const reasons = [];
  if (walletCoinFunding) reasons.push('Wallet funding must never substitute for flashloan repayment');
  if (!quotePass) reasons.push('Slippage-protected traded output plus untouched reserve cannot cover principal and profit floor');
  if (!simulationPass) reasons.push('Atomic Mainnet simulation is not confirmed successful');
  return {
    verdict: reasons.length ? 'BLOCK' : 'ELIGIBLE_FOR_MANUAL_REVIEW',
    principalMist: principal.toString(),
    quotedOutputMist: quoted.toString(),
    untouchedReserveMist: reserve.toString(),
    quotedTradedOutputMist: tradedOutput.toString(),
    conservativeTradedOutputMist: conservativeTraded.toString(),
    conservativeOutputMist: conservativeOutput.toString(),
    minimumRequiredMist: required.toString(),
    slippageBps,
    quotePass,
    simulationPass,
    walletCoinFunding,
    reasons,
  };
}
