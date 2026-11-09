export class RequestError extends Error {
  status:number;
  code?:string;
  constructor(message:string,status:number,code?:string) {super(message);this.status=status;this.code=code;}
}
export async function requestJson(path:string, body:unknown|undefined, key?:string, timeoutMs=45000) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetch(path,{
      method:body===undefined?"GET":"POST",signal:controller.signal,
      headers:{"content-type":"application/json",...(key?{"x-workspace-key":key}:{})},
      body:body===undefined?undefined:JSON.stringify(body),
    });
    let parsed:unknown;
    try{parsed=await response.json();}catch{throw new RequestError("The service returned an unreadable response. Existing storage attempts are preserved; retry reads only.",0);}
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new RequestError("The service returned an invalid response. Existing storage attempts are preserved; retry reads only.",0);
    const value=parsed as Record<string,unknown>;
    if(!response.ok)throw new RequestError(typeof value.error==="string"?value.error:"Request failed.",response.status,typeof value.code==="string"?value.code:undefined);
    return value;
  } catch(error) {
    if(controller.signal.aborted)throw new RequestError("The request timed out. Your existing evidence and storage receipts are preserved.",0);
    throw error;
  } finally {clearTimeout(timer);}
}
