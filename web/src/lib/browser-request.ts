export class RequestError extends Error {
  status:number;
  constructor(message:string,status:number) {super(message);this.status=status;}
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
    const value=await response.json() as Record<string,unknown>;
    if(!response.ok)throw new RequestError(String(value.error||"Request failed"),response.status);
    return value;
  } catch(error) {
    if(controller.signal.aborted)throw new RequestError("The request timed out. Your existing evidence and storage receipts are preserved.",0);
    throw error;
  } finally {clearTimeout(timer);}
}
