import 'server-only';
/** Validate shape before reading fields or calling external services. */
export async function readJsonObject(request:Request):Promise<Record<string,unknown>|null>{
  try{const value:unknown=await request.json();return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;}catch{return null;}
}
