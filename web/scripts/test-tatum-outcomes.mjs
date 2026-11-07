import assert from "node:assert/strict";
import { isTatumNotFound } from "../src/lib/tatum-error.ts";

assert.equal(isTatumNotFound({ code: "NOT_FOUND", message: "Transaction X not found" }), true);
assert.equal(isTatumNotFound({ code: "UNKNOWN", message: "Transaction X not found" }), true);
assert.equal(isTatumNotFound({ code: "UNAVAILABLE", message: "upstream connection reset" }), false);
assert.equal(isTatumNotFound(new Error("timeout")), false);

console.log("PASS: Tatum NOT_FOUND is distinct from transient gateway failures.");
