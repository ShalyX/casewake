// Diagnostic: exactly one authenticated Walrus recall, no writes and no secrets printed.
import fs from "node:fs";
import path from "node:path";
import { MemWal } from "@mysten-incubation/memwal";
import { makeTatumSealSession } from "./seal-session-tatum.mjs";

const root = path.resolve(import.meta.dirname, "..");
const cfg = Object.fromEntries(fs.readFileSync(path.join(root, ".env.local"), "utf8")
 .split(/\r?\n/).filter(v => /^[A-Z_]+=.*/.test(v))
 .map(s => { const i = s.indexOf("="); return [s.slice(0, i), s.slice(i + 1).trim().replace(/^['"]|['"]$/g,"")]; }));
const client = MemWal.create({
 key:cfg.MEMWAL_PRIVATE_KEY,accountId:cfg.MEMWAL_ACCOUNT_ID,
 serverUrl:cfg.MEMWAL_SERVER_URL,namespace:cfg.MEMWAL_NAMESPACE,
});
const session = await makeTatumSealSession(cfg);
client.sessionCache = {bytes:session.bytes,expiresAt:Date.now()+4*60_000};
const query = [
 "Sui Mainnet onchain execution failure",
 "InsufficientCoinBalance in command 16",
 "splitCoins",
 "known prior failure, verified case, troubleshooting runbook,",
 "InsufficientCoinBalance splitCoins correction simulation tested",
].join(" ");
const now=Date.now();
try {
 const out=await client.recall({query,limit:25});
 const hits=Array.isArray(out.results) ? out.results : [];
 console.log("WALRUS_DIRECT_SINGLE_RECALL=OK");
 console.log("WALRUS_DIRECT_ELAPSED_MS="+(Date.now()-now));
 console.log("WALRUS_DIRECT_HITS="+hits.length);
 const classified=hits.map(h => {
  const text=typeof h.text==="string" ? h.text : "";
  return text.startsWith("SUI_SIMULATION_RUNBOOK_V1") ? "RUNBOOK" :
   text.startsWith("SUI_INCIDENT_OBSERVATION_V1") ? "OBSERVATION" :
   text.startsWith("SUI_INCIDENT_MEMORY_V1") ? "VERIFIED" : "OTHER";
 });
 console.log("WALRUS_DIRECT_TYPES="+classified.join(","));
 console.log("WALRUS_DIRECT_RUNBOOK_PRESENT="+classified.includes("RUNBOOK"));
} catch(error) {
 console.log("WALRUS_DIRECT_SINGLE_RECALL=FAILED");
 console.log("ERROR_CLASS="+String(error?.name||"UnknownError"));
 console.log("HTTP_STATUS="+String(error?.status||error?.response?.status||"unknown"));
 process.exitCode=1;
}
