// Read-only Mainnet simulation variants. Only the borrowed/repayment amount input changes.
// Each variant is a fresh PTB simulation; nothing is signed or submitted.
import fs from 'node:fs';
import path from 'node:path';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Transaction } from '@mysten/sui/transactions';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';

const webRoot = path.resolve(import.meta.dirname, '..');
const projectRoot = path.resolve(webRoot, '..');
const cfg = Object.fromEntries(fs.readFileSync(path.join(webRoot, '.env.local'), 'utf8')
  .split(/\r?\n/).filter(x => /^[A-Z_]+=.*/.test(x))
  .map(x => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
if (!cfg.TATUM_API_KEY) throw new Error('Tatum key missing');

const native = new GrpcTransport({ host: 'sui-mainnet-grpc.gateway.tatum.io:443', channelCredentials: ChannelCredentials.createSsl() });
const withAuth = opts => ({ ...opts, meta: { ...opts?.meta, 'x-api-key': cfg.TATUM_API_KEY }, timeout: 45000 });
const transport = {
  mergeOptions: options => withAuth(native.mergeOptions(options)),
  unary: (method, input, options) => native.unary(method, input, withAuth(options)),
  serverStreaming: (method, input, options) => native.serverStreaming(method, input, withAuth(options)),
  clientStreaming: (method, options) => native.clientStreaming(method, withAuth(options)),
  duplex: (method, options) => native.duplex(method, withAuth(options)),
};
const client = new SuiGrpcClient({ network: 'mainnet', transport });
const saved = JSON.parse(fs.readFileSync(path.join(projectRoot, 'evidence', 'context-BbRZD7YfTiiN.json'), 'utf8'));
const originalBytes = saved.transactionData?.bcs?.value?.data;
if (!Array.isArray(originalBytes)) throw new Error('Missing BCS evidence');
const original = Transaction.from(Uint8Array.from(originalBytes));
const originalData = original.getData();
const originalAmountBytes = Buffer.from(originalData.inputs[1].Pure.bytes, 'base64');
const originalAmount = Number(originalAmountBytes.readBigUInt64LE(0));
console.log('ORIGINAL_INPUT_1', JSON.stringify(originalData.inputs[1]), 'AMOUNT_MIST', originalAmount);
const factors = [1, 0.75, 0.5, 0.25, 0.1];
const results = [];
for (const factor of factors) {
  const amount = BigInt(Math.floor(originalAmount * factor));
  const data = JSON.parse(JSON.stringify(originalData));
  const amountBytes = Buffer.alloc(8);
  amountBytes.writeBigUInt64LE(amount);
  data.inputs[1].Pure.bytes = amountBytes.toString('base64');
  data.expiration = null;
  const tx = Transaction.from(JSON.stringify(data));
  try {
    const result = await client.simulateTransaction({
      transaction: tx,
      include: { effects: true, balanceChanges: true, commandResults: true, transaction: true },
      doGasSelection: false,
    });
    const body = result.Transaction || result.FailedTransaction || {};
    const commandResults = result.commandResults || [];
    const describe = (index) => {
      const cmd = commandResults[index];
      if (!cmd) return null;
      return {
        returnValues: (cmd.returnValues || []).map(v => {
          const b = Buffer.from(v.bcs || []);
          return { length: b.length, hex: b.toString('hex'), lastU64LE: b.length >= 8 ? b.readBigUInt64LE(b.length - 8).toString() : null };
        }),
        mutatedReferences: (cmd.mutatedReferences || []).length,
      };
    };
    const entry = {
      digest: saved.digest,
      amountMist: amount.toString(),
      factor,
      outcome: result.$kind,
      statusSuccess: body.status?.success ?? null,
      error: body.status?.error?.message ?? body.status?.error ?? null,
      gasPaymentMocked: result.gasPaymentMocked ?? null,
      commandResultCount: commandResults.length,
      command3: describe(3),
      command12: describe(12),
      command16: describe(16),
      checkedAt: new Date().toISOString(),
      signed: false,
      onchainExecuted: false,
    };
    results.push(entry);
    console.log('VARIANT', JSON.stringify(entry));
  } catch (error) {
    const entry = {
      digest: saved.digest,
      amountMist: amount.toString(),
      factor,
      outcome: 'transport-or-validation-error',
      errorName: error?.name || 'Error',
      errorCode: error?.code || null,
      error: String(error?.message || error).slice(0, 400),
      checkedAt: new Date().toISOString(),
      signed: false,
      onchainExecuted: false,
    };
    results.push(entry);
    console.log('VARIANT', JSON.stringify(entry));
  }
}
const dest = path.join(projectRoot, 'evidence', 'flashloan-guard-variant-simulations.json');
fs.writeFileSync(dest, JSON.stringify(results, null, 2) + '\n');
console.log('RESULTS_SAVED', dest);
