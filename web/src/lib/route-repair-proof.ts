import "server-only";
import { createHash } from "node:crypto";
import { Transaction } from "@mysten/sui/transactions";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";

export const ROUTE_INCIDENT_DIGEST = "BbRZD7YfTiiNWYd1BuVHxirCJMpSHW3taxgNh1bzqMd6";
export const RECALL_TEST_DIGEST = "XkAz3VrtFLpvZne2ZoYJSzjbyqrqnt7FEYjQviKKoue";
const SENDER = "0x457d5ecda9f125053adf94fe357549e11e6fa688679cf94ababb5793ed3916ce";
const FLASHLOAN_POOL = "0x034f3a42e7348de2084406db7a725f9d9d132a56c68324713e6e623601fb4fd7";
const DEEPBOOK = "0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748";
const SUI = "0x2::sui::SUI";
const SUI_USDE = "0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE";
const PRINCIPAL = BigInt("65265188650");

type Reference = { Input?: number; Result?: number; NestedResult?: [number,number]; GasCoin?: boolean };
type Call = { package: string; module: string; function: string; typeArguments: string[]; arguments: Reference[] };
type Command = { MoveCall?: Call; SplitCoins?: { coin: Reference; amounts: Reference[] } };
type ObjectInput = { Object?: { ImmOrOwnedObject?: unknown; Receiving?: unknown; SharedObject?: { objectId: string } }; Pure?: { bytes: string } };

export type VerifiedRouteSimulation = {
  originalDigest: typeof ROUTE_INCIDENT_DIGEST;
  routeTransactionSha256: string;
  principalMist: "65265188650";
  provider: "Tatum Sui Mainnet gRPC";
  simulationSucceeded: true;
  gasPaymentMocked: boolean;
  signed: false;
  onchainExecuted: false;
  commandCount: number;
  verifiedAt: string;
};

function indexOfRef(ref: Reference): number {
  if(!Number.isInteger(ref?.Input) || ref.Input! < 0) throw new Error("Expected a direct PTB input reference.");
  return ref.Input!;
}

export function validateRouteRepairStructure(base64: string) {
  if(typeof base64!=="string" || base64.length < 200 || base64.length > 350000 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new Error("A complete base64-encoded repaired transaction is required.");
  const bytes=Buffer.from(base64,"base64");
  if(bytes.toString("base64")!==base64) throw new Error("Invalid transaction BCS encoding.");
  let tx: Transaction;
  try { tx=Transaction.from(bytes); } catch {throw new Error("The submitted bytes are not valid Sui transaction BCS.");}
  const data=tx.getData();
  if(data.sender?.toLowerCase()!==SENDER) throw new Error("Repair sender differs from the historical failed route.");
  const inputs=data.inputs as ObjectInput[];
  // Strictly disallow wallet coin objects or other owned objects as swap inputs.
  if(inputs.some(x=>x.Object?.ImmOrOwnedObject || x.Object?.Receiving))
    throw new Error("Repair must use flashloan proceeds only; owned input objects are forbidden.");
  const commands=data.commands as Command[];
  if(commands.length < 5 || commands.length > 180) throw new Error("Unexpected repaired route command count.");
  if(commands.some(c=>JSON.stringify(c).includes('"GasCoin"')))
    throw new Error("Using the wallet gas coin as swap capital is forbidden.");
  const borrowTarget=DEEPBOOK+"::pool::borrow_flashloan_base";
  const returnTarget=DEEPBOOK+"::pool::return_flashloan_base";
  const target=(call: Call)=>call.package+"::"+call.module+"::"+call.function;
  const borrows=commands.map((c,i)=>({c:c.MoveCall,i})).filter(x=>x.c && target(x.c)===borrowTarget);
  const returns=commands.map((c,i)=>({c:c.MoveCall,i})).filter(x=>x.c && target(x.c)===returnTarget);
  if(borrows.length!==1 || returns.length!==1) throw new Error("Exactly one original DeepBook flashloan borrow and repayment must be present.");
  const canonical=(s:string)=>s.replace(/^0x0+([0-9a-f]+)::/i,"0x$1::");
  const validTypeArgs=(args:string[])=>args?.length===2 && canonical(args[0])===SUI && canonical(args[1])===SUI_USDE;
  const borrow=borrows[0].c!, repay=returns[0].c!;
  if(!validTypeArgs(borrow.typeArguments) || !validTypeArgs(repay.typeArguments))
    throw new Error("Flashloan asset types differ from the original incident.");
  const borrowPool=inputs[indexOfRef(borrow.arguments[0])]?.Object?.SharedObject?.objectId;
  const returnPool=inputs[indexOfRef(repay.arguments[0])]?.Object?.SharedObject?.objectId;
  if(borrowPool!==FLASHLOAN_POOL || returnPool!==FLASHLOAN_POOL)
    throw new Error("Repair uses a different flashloan pool.");
  const principalBytes=inputs[indexOfRef(borrow.arguments[1])]?.Pure?.bytes;
  const buf=Buffer.from(principalBytes||"","base64");
  if(buf.length!==8 || buf.readBigUInt64LE(0)!==PRINCIPAL) throw new Error("Original flashloan principal changed.");
  const repaymentArg=repay.arguments[1];
  const splitIndex=repaymentArg?.Result ?? (repaymentArg?.NestedResult?.[1]===0 ? repaymentArg.NestedResult[0] : undefined);
  if(splitIndex===undefined || splitIndex>=returns[0].i) throw new Error("Repayment must use a split coin.");
  const split=commands[splitIndex]?.SplitCoins;
  if(!split || split.amounts.length!==1) throw new Error("Repayment must use a single principal-sized coin split.");
  const splitAmount=inputs[indexOfRef(split.amounts[0])]?.Pure?.bytes;
  const splitBuf=Buffer.from(splitAmount||"","base64");
  if(splitBuf.length!==8 || splitBuf.readBigUInt64LE(0)!==PRINCIPAL) throw new Error("Repayment amount changed.");
  // The flashloan handle must be used by the original pool repayment.
  const handle=repay.arguments[2]?.NestedResult;
  if(!handle || handle[0]!==borrows[0].i || handle[1]!==1)
    throw new Error("Repayment is not tied to the original flashloan receipt.");
  return {tx, bytes, commandCount:commands.length};
}

export async function independentlyVerifyRouteRepair(base64: string): Promise<VerifiedRouteSimulation> {
  const key=process.env.TATUM_API_KEY?.trim();
  if(!key) throw new Error("Independent route verification unavailable: Tatum Mainnet key missing.");
  const {tx,bytes,commandCount}=validateRouteRepairStructure(base64);
  const raw=new GrpcTransport({host:"sui-mainnet-grpc.gateway.tatum.io:443",channelCredentials:ChannelCredentials.createSsl()});
  type GrpcOptions = Parameters<GrpcTransport["mergeOptions"]>[0];
  const auth=(o?:GrpcOptions)=>({...o,meta:{...o?.meta,"x-api-key":key},timeout:35000});
  // Preserve the concrete SDK transport type while attaching authentication to every call.
  const transport=new Proxy(raw,{
    get(target,prop,receiver){
      if(prop==="mergeOptions")return (o:GrpcOptions)=>auth(target.mergeOptions(o));
      if(prop==="unary")return (...a:Parameters<GrpcTransport["unary"]>)=>target.unary(a[0],a[1],auth(a[2]));
      if(prop==="serverStreaming")return (...a:Parameters<GrpcTransport["serverStreaming"]>)=>target.serverStreaming(a[0],a[1],auth(a[2]));
      if(prop==="clientStreaming")return (...a:Parameters<GrpcTransport["clientStreaming"]>)=>target.clientStreaming(a[0],auth(a[1]));
      if(prop==="duplex")return (...a:Parameters<GrpcTransport["duplex"]>)=>target.duplex(a[0],auth(a[1]));
      return Reflect.get(target,prop,receiver);
    }
  });
  const client=new SuiGrpcClient({network:"mainnet",transport});
  const simulation=await client.simulateTransaction({transaction:tx,include:{effects:true,transaction:true},doGasSelection:false});
  const body=simulation.Transaction||simulation.FailedTransaction;
  if(!simulation.Transaction || body?.status?.success!==true || body.status.error)
    throw new Error("Gate 1 blocked: full corrected flashloan simulation did not successfully repay.");
  return {
    originalDigest:ROUTE_INCIDENT_DIGEST,
    routeTransactionSha256:createHash("sha256").update(bytes).digest("hex"),
    principalMist:"65265188650",
    provider:"Tatum Sui Mainnet gRPC",
    simulationSucceeded:true,
    gasPaymentMocked:simulation.gasPaymentMocked===true,
    signed:false,onchainExecuted:false,commandCount,verifiedAt:new Date().toISOString()
  };
}
