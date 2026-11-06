/**
 * Strict quote + atomic simulation preflight for the Casewake incident route.
 * This function does not sign, broadcast or verify any historical repair.
 */
export function assessRepaymentCandidate({
  principalMist,
  quotedOutputMist,
  slippageBps = 50,
  minimumProfitMist = 0n,
  atomicSimulation = null,
  walletCoinFunding = false,
}) {
  const principal = BigInt(principalMist);
  const quoted = BigInt(quotedOutputMist);
  const floorProfit = BigInt(minimumProfitMist);
  if (principal <= 0n || quoted < 0n || !Number.isInteger(slippageBps)
      || slippageBps < 0 || slippageBps > 10000 || floorProfit < 0n) {
    throw new Error('Invalid repayment guard input');
  }
  const conservativeOutput = quoted * BigInt(10000 - slippageBps) / 10000n;
  const required = principal + floorProfit;
  const quotePass = conservativeOutput >= required;
  const simulationPass = atomicSimulation?.outcome === 'Transaction'
      && atomicSimulation?.success === true
      && atomicSimulation?.error == null;
  const reasons = [];
  if (walletCoinFunding) reasons.push('Wallet funding must never substitute for flashloan repayment');
  if (!quotePass) reasons.push('Slippage-protected quote cannot repay flashloan principal and profit floor');
  if (!simulationPass) reasons.push('Atomic Mainnet simulation is not confirmed successful');
  return {
    verdict: reasons.length ? 'BLOCK' : 'ELIGIBLE_FOR_MANUAL_REVIEW',
    principalMist: principal.toString(),
    quotedOutputMist: quoted.toString(),
    conservativeOutputMist: conservativeOutput.toString(),
    minimumRequiredMist: required.toString(),
    slippageBps,
    quotePass,
    simulationPass,
    walletCoinFunding,
    reasons,
  };
}
