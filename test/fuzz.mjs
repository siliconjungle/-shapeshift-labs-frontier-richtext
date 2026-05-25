import assert from 'node:assert';
import {
  applyRichTextDelta,
  createRichTextDocument,
  richTextToPlainText,
  transformRichTextCursor
} from '../dist/index.js';

const args = parseArgs(process.argv.slice(2));
const cases = readPositiveInt(args.cases, 1000);
let seed = readPositiveInt(args.seed, 0x51f15e);

for (let caseIndex = 0; caseIndex < cases; caseIndex++) {
  const text = randomText(nextInt(32));
  const doc = createRichTextDocument(text);
  const delta = randomDelta(text.length);
  const actual = richTextToPlainText(applyRichTextDelta(doc, delta));
  const expected = applyPlainDelta(text, delta);
  assert.strictEqual(actual, expected, 'plain text mismatch at case ' + caseIndex);

  const cursor = nextInt(text.length + 1);
  const transformed = transformRichTextCursor(cursor, delta);
  assert.ok(transformed >= 0 && transformed <= actual.length, 'cursor out of bounds at case ' + caseIndex);
}

console.log(`frontier-richtext fuzz passed cases=${cases} seed=${seed >>> 0}`);

function randomDelta(length) {
  const delta = [];
  let index = 0;
  while (index < length) {
    const choice = nextInt(5);
    const remaining = length - index;
    if (choice === 0) {
      delta.push({ insert: randomText(1 + nextInt(4)), attributes: randomAttributes() });
    } else if (choice === 1) {
      const count = 1 + nextInt(remaining);
      delta.push({ delete: count });
      index += count;
    } else {
      const count = 1 + nextInt(remaining);
      const attrs = choice === 2 ? randomAttributes() : undefined;
      delta.push(attrs === undefined ? { retain: count } : { retain: count, attributes: attrs });
      index += count;
    }
  }
  if (nextInt(3) === 0) delta.push({ insert: randomText(1 + nextInt(4)), attributes: randomAttributes() });
  return delta;
}

function applyPlainDelta(text, delta) {
  let index = 0;
  let out = '';
  for (const op of delta) {
    if (Object.hasOwn(op, 'insert')) {
      out += typeof op.insert === 'string' ? op.insert : '\uFFFC';
    } else if (Object.hasOwn(op, 'retain')) {
      out += text.slice(index, index + op.retain);
      index += op.retain;
    } else {
      index += op.delete;
    }
  }
  out += text.slice(index);
  return out;
}

function randomAttributes() {
  const attrs = {};
  if (nextInt(2) === 0) attrs.bold = true;
  if (nextInt(3) === 0) attrs.color = ['red', 'blue', 'green'][nextInt(3)];
  if (nextInt(5) === 0) attrs.bold = null;
  return Object.keys(attrs).length === 0 ? undefined : attrs;
}

function randomText(length) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz ';
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[nextInt(alphabet.length)];
  return out;
}

function nextInt(max) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return max <= 0 ? 0 : seed % max;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cases') out.cases = argv[++i];
    else if (arg === '--seed') out.seed = argv[++i];
    else throw new Error('unknown argument: ' + arg);
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
