import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  applyRichTextDelta,
  applyRichTextAnnotationPolicy,
  createRichTextDocument,
  formatRichTextRange,
  insertRichText,
  projectStableRichTextDelta,
  richTextToDelta,
  richTextToPlainText,
  stringifyStableRichTextDelta,
  transformRichTextSelection
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const rounds = readPositiveInt(args.rounds, 9);
const iterations = readPositiveInt(args.iterations, 2000);
const outPath = args.out ? path.resolve(rootDir, args.out) : null;
const base = createRichTextDocument(makeText(4096));
const delta = [
  { retain: 64 },
  { insert: 'Frontier ', attributes: { bold: true } },
  { retain: 256, attributes: { color: 'blue' } },
  { delete: 16 }
];
const annotations = [
  { id: 'comment-a', type: 'comment', range: { index: 32, length: 128 }, actorId: 'bench-a', clock: 1, value: 'check this' },
  { id: 'link-a', type: 'link', range: { index: 64, length: 96 }, actorId: 'bench-b', clock: 2, href: 'https://frontier.local' },
  { id: 'link-b', type: 'link', range: { index: 80, length: 64 }, actorId: 'bench-c', clock: 1, href: 'https://old.frontier.local' }
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
  }),
  measure('stable Delta projection', rounds, iterations, () => {
    projectStableRichTextDelta(base, { annotations });
  }),
  measure('stable Delta stringify', rounds, iterations, () => {
    stringifyStableRichTextDelta(base, { annotations });
  }),
  measure('annotation conflict policy', rounds, iterations, () => {
    applyRichTextAnnotationPolicy(annotations);
  })
];

const report = {
  package: '@shapeshift-labs/frontier-richtext',
  version: readPackageVersion(),
  generatedAt: new Date().toISOString(),
  node: process.version,
  platform: process.platform + ' ' + process.arch,
  rounds,
  iterations,
  rows
};
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
}

console.log('@shapeshift-labs/frontier-richtext package benchmark');
console.log(`Node ${process.version} on ${process.platform} ${process.arch}, rounds=${rounds}`);
console.log('These are Frontier-only package measurements, not competitor comparisons.');
console.log('');
console.log(padRight('Fixture', 38) + padLeft('Median', 12) + padLeft('p95', 10));
for (const row of rows) {
  console.log(padRight(row.fixture, 38) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 10));
}
if (outPath) console.log('\nwrote ' + path.relative(rootDir, outPath));

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

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;
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
    else if (arg === '--out') out.out = argv[++i];
    else throw new Error('unknown argument: ' + arg);
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
