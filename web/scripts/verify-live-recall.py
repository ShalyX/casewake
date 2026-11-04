"""Black-box app tests against Tatum + Walrus real Mainnet; only real onchain digests."""
import json, requests
from pathlib import Path
root=Path(__file__).resolve().parents[2]
url="http://127.0.0.1:4217"
pairs=[
 ("5sc7kDbnaEASo8vBZnrM3j2ZauutQ96CXoNicM9E841U","6NJrsdCPfda8FzRaMEDpGpwWyg1xpD5TDZCDXwV47T4v"),
 ("2BB6Xqr7DhsmcK2yUgadP37KSLCtAXhyMff6XdFjiJ6m","rsiVLqZ6qtWw1epmTj4fn3K3bnsmMko5bSpZwEo1vvD"),
 ("BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6","XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue"),
]
results=[]
for digest,expected in pairs:
 response=requests.post(url+"/api/recall",json={"digest":digest},timeout=50)
 assert response.status_code==200, f"HTTP {response.status_code}"
 payload=response.json()
 assert payload["transaction"]["outcome"]=="failed"
 related=[x["case"]["digest"] for x in payload["observedPrecedents"]]
 assert expected in related, (digest,expected,related)
 assert not any(x["verdict"]=="eligible-for-review" for x in payload["candidates"])
 results.append({"queryDigest":digest,"observedPrecedents":related,
      "expectedKnownPrecedent":expected,"verifiedResolutionCount":0,
      "finding":"MATCHED_REAL_ONCHAIN_OBSERVATION_NOT_VERIFIED_REPAIR"})
 print("LIVE_RECALL_PASS",digest, "MATCHED", expected,flush=True)
neg=requests.post(url+"/api/recall",json={"digest":"Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp"},timeout=50)
assert neg.ok
payload=neg.json()
assert not any(x["case"]["digest"]=="Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp" for x in payload["observedPrecedents"]),"Self-match should be excluded"
print("LIVE_RECALL_SELF_MATCH_REJECTED",flush=True)
results.append({"queryDigest":"Bh2xSsApGWjJGUqtMFez19VVFYAzu6CHpw5GMfHC9Byp",
      "selfMatchRejected":True,"finding":"SAME_DIGEST_NOT_MISTAKEN_FOR_REPEATED_INCIDENT"})
out=root/"evidence"/"live-recall-proof.json"
out.write_text(json.dumps({"proofType":"live Tatum Sui Mainnet and Walrus recall, no human-verified resolutions", "results":results},indent=2)+"\n",encoding="utf8")
print("LIVE_PROOF_SAVED",out,flush=True)
