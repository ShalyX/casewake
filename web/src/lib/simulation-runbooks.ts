import "server-only";
import { memwalClient } from "./observations";
import type { ObservedTransaction } from "./incidents";

/** Controlled Mainnet simulation proof, NOT an onchain repair or human-reviewed case. */
export type SimulationRunbook = {
  schema: "simulation-runbook/v1";
  id: string;
  network: "sui-mainnet";
  errorKind: "InsufficientCoinBalance";
  commandKind: "splitCoins";
  status: "simulation-tested-not-human-verified";
  diagnosis: string;
  safeProcedure: string;
  caveat: string;
  failure: {
    firstSplitMist: string;
    secondSplitMist: string;
    result: "FailedTransaction";
    errorText: string;
  };
  corrected: {
    firstSplitMist: string;
    secondSplitMist: string;
    result: "Transaction";
    statusSuccess: true;
  };
  provider: "Tatum Sui Mainnet gRPC";
  gasPaymentMocked: true;
  onchainExecuted: false;
  testSourcePath: string;
  proofPath: string;
  evidenceDigest: string;
  testedAt: string;
};
export type SimulationCandidate = {
  record: SimulationRunbook;
  distance: number;
  verdict: "simulation-tested-review-only";
  matchReason: string;
};
const PREFIX="SUI_SIMULATION_RUNBOOK_V1\n";
export function encodeRunbook(record: SimulationRunbook): string {
  return PREFIX +
    "Sui InsufficientCoinBalance splitCoins failed: ask for more coin than exists. " +
    "Tatum Mainnet simulation-tested reproduction and corrected splitCoins amount. " +
    "Exact failure class: InsufficientCoinBalance; failing command kind: splitCoins. " +
    "After changing the split to a value below the coin balance, the controlled simulation succeeded. " +
    "This is a simulation-tested procedure only, NOT a human-verified fix for an executed transaction.\n" +
    JSON.stringify(record);
}
export function decodeRunbook(text: string): SimulationRunbook | null {
  if(!text.startsWith(PREFIX)) return null;
  const i=text.indexOf("\n{");
  if(i<0) return null;
  try {
    const r=JSON.parse(text.slice(i+1)) as Partial<SimulationRunbook>;
    if(r.schema!=="simulation-runbook/v1" || r.status!=="simulation-tested-not-human-verified" ||
       r.network!=="sui-mainnet" || r.commandKind!=="splitCoins" ||
       r.errorKind!=="InsufficientCoinBalance" || r.gasPaymentMocked!==true ||
       r.onchainExecuted!==false || r.failure?.result!=="FailedTransaction" ||
       r.corrected?.result!=="Transaction" || r.corrected.statusSuccess!==true ||
       r.failure.firstSplitMist!=="10000000" || r.failure.secondSplitMist!=="20000000" ||
       r.corrected.firstSplitMist!=="10000000" || r.corrected.secondSplitMist!=="5000000" ||
       typeof r.evidenceDigest!=="string" || !/^[a-f0-9]{64}$/.test(r.evidenceDigest) ||
       !r.diagnosis || !r.safeProcedure || !r.caveat) return null;
    return r as SimulationRunbook;
  } catch { return null; }
}
export function assessSimulationRunbook(tx: ObservedTransaction, record: SimulationRunbook, distance: number): SimulationCandidate | null {
  if(tx.outcome!=="failed" || !tx.errorText?.startsWith("InsufficientCoinBalance in command ") ||
     tx.failedCommandKind!=="splitCoins") return null;
  if(record.network!==tx.network || record.errorKind!=="InsufficientCoinBalance" ||
     record.commandKind!==tx.failedCommandKind || record.status!=="simulation-tested-not-human-verified" ||
     record.onchainExecuted!==false || record.gasPaymentMocked!==true) return null;
  return {record,distance,verdict:"simulation-tested-review-only",
    matchReason:"Exact error class and failing splitCoins command match. The procedure passed a controlled Mainnet simulation, but this historical transaction has no verified repair."};
}
export async function recallSimulationRunbooks(tx: ObservedTransaction): Promise<SimulationCandidate[]> {
  if(tx.outcome!=="failed" || !tx.errorText?.startsWith("InsufficientCoinBalance") ||
     tx.failedCommandKind!=="splitCoins") return [];
  const memwal=await memwalClient();
  const out=await memwal.recall({
    query:"Sui InsufficientCoinBalance splitCoins Mainnet controlled simulation tested correction. " +
    "Simulation-runbook of a splitCoins overdraw and successful smaller split; not a human-reviewed historical fix.",
    limit:75
  });
  const candidates: SimulationCandidate[]=[];
  for(const hit of out.results) {
    const record=decodeRunbook(hit.text);
    if(record){
      const evaluated=assessSimulationRunbook(tx,record,hit.distance);
      if(evaluated)candidates.push(evaluated);
    }
  }
  return candidates.sort((a,b)=>a.distance-b.distance).slice(0,3);
}
