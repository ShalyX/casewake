"""Import up to ten distinct factual Sui execution failure observations into Mainnet MemWal via the app API.
Only chain facts, NOT human-verified diagnoses or resolutions. Idempotent against saved receipts.
Never prints or stores credentials.
"""
import json, os, re, tempfile
from collections import OrderedDict
from pathlib import Path
import requests
ROOT=Path(__file__).resolve().parents[2]
WEB=ROOT/"web"
DATA=ROOT/"evidence"/"failed-sui-transaction-candidates.json"
OUT=ROOT/"evidence"/"observation-write-receipts.json"
ROOT_URL="http://127.0.0.1:4217"
def cfg():
    result={}
    for line in (WEB/".env.local").read_text(encoding="utf8").splitlines():
        if not line or line.startswith("#") or "=" not in line:continue
        key,val=line.split("=",1)
        result[key]=val.strip().strip('"').strip("'")
    return result
def fp(s):
    return re.sub(r"\s+"," ",re.sub(r"0x[a-f0-9]{32,}","0x<address>",s.strip().lower()))[:480]
def save(value):
    OUT.parent.mkdir(exist_ok=True,parents=True)
    fd,name=tempfile.mkstemp(prefix="observations-",suffix=".tmp",dir=OUT.parent)
    with os.fdopen(fd,"w",encoding="utf8") as f:json.dump(value,f,indent=2);f.write("\n")
    os.replace(name,OUT)
def main():
    c=cfg()
    token=c.get("WORKSPACE_WRITE_KEY","")
    assert token and c.get("TATUM_API_KEY") and c.get("MEMWAL_PRIVATE_KEY"),"Missing local config"
    failures=json.loads(DATA.read_text(encoding="utf8"))["failures"]
    unique=OrderedDict()
    for item in failures:
        if item.get("status")=="onchain-failed" and item.get("digest") and item.get("error"):
            unique.setdefault(fp(item["error"]),[]).append(item)
    pool=[items[0] for items in unique.values()]
    assert len(pool)>=10, f"Need ten different real error signatures, got {len(pool)}"
    chosen=pool[:10]
    evidence=json.loads(OUT.read_text(encoding="utf8")) if OUT.exists() else {
      "source":"Tatum Sui Mainnet gRPC; verified by app on each write",
      "kind":"onchain-observed-not-human-verified",
      "records":[],
    }
    written={x["digest"] for x in evidence["records"]}
    print("SELECTION_UNIQUE_REAL_ERRORS",len(chosen),flush=True)
    for n,entry in enumerate(chosen,1):
        digest=entry["digest"]
        if digest in written:
            print("ALREADY_STORED",n,digest,flush=True);continue
        try:
            resp=requests.post(ROOT_URL+"/api/observations",json={"digest":digest},
                headers={"x-workspace-key":token},timeout=140)
        except requests.RequestException as e:
            print("REQUEST_ERROR",n,digest,type(e).__name__,flush=True)
            break
        if resp.status_code!=201:
            print("STORE_FAILED",n,digest,"HTTP",resp.status_code,flush=True)
            break
        try:
            body=resp.json()
            stored=body["case"]
            proof=body["proof"]
            assert stored["digest"]==digest
            assert stored["resolutionVerified"] is False and stored["kind"]=="onchain-observed-not-human-verified"
            assert len(proof["blobId"])>15 and proof["jobId"]
        except (KeyError,ValueError,AssertionError) as e:
            print("INVALID_RECEIPT",n,digest,type(e).__name__,flush=True);break
        evidence["records"].append({
            "digest":digest,"errorText":stored["errorText"],"fingerprint":stored["fingerprint"],
            "kind":stored["kind"],"resolutionVerified":False,
            "sourceUrl":stored["sourceUrl"],"observedAt":stored["observedAt"],
            "jobId":proof["jobId"],"blobId":proof["blobId"],"namespace":proof["namespace"],
        })
        written.add(digest)
        save(evidence)
        print("MAINNET_OBSERVATION_STORED",n,digest,"BLOB",proof["blobId"],flush=True)
    count=len(evidence["records"])
    print("MAINNET_OBSERVATION_RECEIPTS_TOTAL",count,flush=True)
    try:
        inventory=requests.get(ROOT_URL+"/api/memories",timeout=25)
        if inventory.ok:
            result=inventory.json()
            print("WALRUS_LIST_MEMORIES_COUNT",result["allStoredMemories"],flush=True)
            print("WALRUS_LIST_COMPLETE",result["complete"],flush=True)
    except requests.RequestException:
        print("INVENTORY_UNAVAILABLE",flush=True)
if __name__=="__main__":main()
