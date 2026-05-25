import { performance } from 'node:perf_hooks';
import {
  applyRichTextDelta,
  createRichTextDocument,
  formatRichTextRange,
  insertRichText,
  richTextToDelta,
  richTextToPlainText,
  transformRichTextSelection
} from '../dist/index.js';

const args = parseArgs(process.argv.slice(2));
const rounds = readPositiveInt(args.rounds, 9);
const iterations = readPositiveInt(args.iterations, 2000);
const base = createRichTextDocument(makeText(4096));
const delta = [
  { retain: 64 },
  { insert: 'Frontier ', attributes: { bold: true } },
  { retain: 256, attributes: { color: 'blue' } },
  { delete: 16 }
];

const rows = [
  measure('create document, 4k text', rounds, iterations, () => {
    createRichTextDocument(base.ops);
  }),
  measure('apply mixed Delta', rounds, iterations, () => {
    applyRichTextDelta(base, delta);
  }),
  measure('format range, 512 chars', rounds, iterations, () => {
    formatRichTextRange(base, { index: 128, length: 512 }, { italic: true });
  }),
  measure('insert marked text', rounds, iterations, () => {
    insertRichText(base, 512, 'local-first', { code: true });
  }),
  measure('export Delta', rounds, iterations, () => {
    richTextToDelta(base);
  }),
  measure('plain text flatten', rounds, iterations, () => {
    richTextToPlainText(base);
  }),
  measure('transform selection', rounds, iterations, () => {
    transformRichTextSelection({ anchor: 100, head: 900 }, delta);
  })
];

console.log('@shapeshift-labs/frontier-richtext package benchmark');
console.log(`Node ${process.version} on ${process.platform} ${process.arch}, rounds=${rounds}`);
console.log('These are Frontier-only package measurements, not competitor comparisons.');
console.log('');
console.log(padRight('Fixture', 38) + padLeft('Median', 12) + padLeft('p95', 10));
for (const row of rows) {
  console.log(padRight(row.fixture, 38) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 10));
}

function measure(fixture, runs, count, fn) {
  const samples = [];
  for (let round = 0; round < runs; round++) {
    const start = performance.now();
    for (let i = 0; i < count; i++) fn();
    samples.push(((performance.now() - start) * 1000) / count);
  }
  samples.sort((left, right) => left - right);
  return { fixture, medianUs: percentile(samples, 0.5), p95Us: percentile(samples, 0.95) };
}

function makeText(length) {
  const chunk = 'Frontier rich text keeps marks and embeds local. ';
  let out = '';
  while (out.length < length) out += chunk;
  return out.slice(0, length);
}

function percentile(samples, point) {
  return samples[Math.min(samples.length - 1, Math.max(0, Math.ceil(samples.length * point) - 1))];
}

function formatUs(value) {
  return value >= 1000 ? (value / 1000).toFixed(2) + ' ms' : value.toFixed(2) + ' us';
}

function padRight(value, width) {
  return String(value).padEnd(width, ' ');
}

function padLeft(value, width) {
  return String(value).padStart(width, ' ');
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--rounds') out.rounds = argv[++i];
    else if (arg === '--iterations') out.iterations = argv[++i];
    else throw new Error('unknown argument: ' + arg);
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
