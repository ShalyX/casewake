import assert from "node:assert/strict";
import { isTransientReadError, retryReadOnly } from "../src/lib/retry-reads.ts";

assert.equal(isTransientReadError({code:"EAI_AGAIN"}), true);
assert.equal(isTransientReadError({cause:{code:"ECONNRESET"}}), true);
assert.equal(isTransientReadError({code:14}), true);
assert.equal(isTransientReadError({status:504}), true);
assert.equal(isTransientReadError({status:401}), false);
assert.equal(isTransientReadError({code:"INVALID_ARGUMENT"}), false);
let attempts=0;
const result=await retryReadOnly(async () => {
 attempts++;
 if (attempts===1) throw Object.assign(new Error("transient DNS"), {code:"EAI_AGAIN"});
 return "recovered";
},{attempts:2,delayMs:1});
assert.equal(result,"recovered");
assert.equal(attempts,2);
let permanentAttempts=0;
await assert.rejects(() => retryReadOnly(async () => {
 permanentAttempts++;
 throw Object.assign(new Error("unauthorized"), {status:401});
},{attempts:3,delayMs:1}));
assert.equal(permanentAttempts,1);
let exhaustedAttempts=0;
await assert.rejects(() => retryReadOnly(async () => {
 exhaustedAttempts++;
 throw Object.assign(new Error("unavailable"), {code:"UNAVAILABLE"});
},{attempts:2,delayMs:1}));
assert.equal(exhaustedAttempts,2);
console.log("RETRY_SAFETY_TESTS=PASS transient retries, permanent failure handling, and bounded attempts");
