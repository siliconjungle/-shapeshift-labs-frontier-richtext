import assert from 'node:assert';
import {
  applyRichTextDelta,
  applyRichTextAnnotationPolicy,
  createRichTextDocument,
  deleteRichTextRange,
  formatRichTextRange,
  getRichTextLength,
  insertRichText,
  mergeRichTextAnnotations,
  projectStableRichTextDelta,
  richTextToDelta,
  richTextToPlainText,
  sliceRichText,
  stringifyStableRichTextDelta,
  transformRichTextAnnotations,
  transformRichTextCursor,
  transformRichTextSelection
} from '../dist/index.js';

const doc = createRichTextDocument('hello world');
assert.deepStrictEqual(richTextToDelta(doc), [{ insert: 'hello world' }]);
assert.strictEqual(richTextToPlainText(doc), 'hello world');

const formatted = formatRichTextRange(doc, { index: 0, length: 5 }, { bold: true });
assert.deepStrictEqual(formatted.ops, [
  { insert: 'hello', attributes: { bold: true } },
  { insert: ' world' }
]);

const edited = applyRichTextDelta(formatted, [
  { retain: 6 },
  { delete: 5 },
  { insert: 'Frontier', attributes: { italic: true } }
]);
assert.strictEqual(richTextToPlainText(edited), 'hello Frontier');
assert.deepStrictEqual(edited.ops[1], { insert: ' ' });
assert.deepStrictEqual(edited.ops[2], { insert: 'Frontier', attributes: { italic: true } });

const embedded = insertRichText(edited, 5, { type: 'image', value: { src: 'frontier.png' } }, { alt: true });
assert.strictEqual(getRichTextLength(embedded), 'hello Frontier'.length + 1);
assert.strictEqual(richTextToPlainText(embedded), 'hello\uFFFC Frontier');

const deleted = deleteRichTextRange(embedded, { index: 5, length: 1 });
assert.strictEqual(richTextToPlainText(deleted), 'hello Frontier');

const removedFormat = applyRichTextDelta(formatted, [
  { retain: 2 },
  { retain: 3, attributes: { bold: null } }
]);
assert.deepStrictEqual(removedFormat.ops, [
  { insert: 'he', attributes: { bold: true } },
  { insert: 'llo world' }
]);

const slice = sliceRichText(formatted, { index: 1, length: 4 });
assert.deepStrictEqual(slice.ops, [{ insert: 'ello', attributes: { bold: true } }]);

assert.strictEqual(transformRichTextCursor(5, [{ retain: 2 }, { insert: 'xx' }]), 7);
assert.strictEqual(transformRichTextCursor(2, [{ retain: 2 }, { insert: 'xx' }], { association: 'before' }), 2);
assert.strictEqual(transformRichTextCursor(4, [{ retain: 2 }, { delete: 4 }]), 2);
assert.deepStrictEqual(
  transformRichTextSelection({ anchor: 1, head: 5 }, [{ retain: 2 }, { insert: 'xx' }]),
  { anchor: 1, head: 7 }
);

const stableProjection = projectStableRichTextDelta([
  { insert: { type: 'card', value: { z: 1, a: { b: 2 } } }, attributes: { color: 'red', bold: true } },
  { insert: 'x', attributes: { italic: true, bold: true } }
]);
assert.deepStrictEqual(stableProjection, [
  { insert: { type: 'card', value: { a: { b: 2 }, z: 1 } }, attributes: { bold: true, color: 'red' } },
  { insert: 'x', attributes: { bold: true, italic: true } }
]);
assert.strictEqual(
  stringifyStableRichTextDelta(stableProjection),
  '[{"attributes":{"bold":true,"color":"red"},"insert":{"type":"card","value":{"a":{"b":2},"z":1}}},{"attributes":{"bold":true,"italic":true},"insert":"x"}]'
);

const annotations = mergeRichTextAnnotations(
  [
    { id: 'c1', type: 'comment', range: { index: 0, length: 2 }, actorId: 'a', clock: 1, value: 'first' },
    { id: 'l1', type: 'link', range: { index: 0, length: 5 }, actorId: 'a', clock: 1, href: 'https://old.example' }
  ],
  [
    { id: 'c2', type: 'comment', range: { index: 1, length: 2 }, actorId: 'b', clock: 1, value: 'second' },
    { id: 'l2', type: 'link', range: { index: 1, length: 3 }, actorId: 'b', clock: 2, href: 'https://new.example' }
  ]
);
assert.deepStrictEqual(annotations.map((annotation) => annotation.id), ['c1', 'c2', 'l2']);
assert.deepStrictEqual(
  applyRichTextAnnotationPolicy([
    { id: 'l1', type: 'link', range: { index: 0, length: 5 }, actorId: 'a', clock: 1, href: 'a' },
    { id: 'l2', type: 'link', range: { index: 1, length: 3 }, actorId: 'b', clock: 2, href: 'b' }
  ]).map((annotation) => annotation.id),
  ['l2']
);
assert.deepStrictEqual(
  transformRichTextAnnotations(annotations, [{ retain: 1 }, { insert: 'xx' }]).map((annotation) => annotation.range),
  [{ index: 0, length: 4 }, { index: 1, length: 4 }, { index: 1, length: 5 }]
);
assert.deepStrictEqual(projectStableRichTextDelta('hello', { annotations }), [
  { insert: 'h' },
  { insert: 'ell', attributes: { link: 'https://new.example' } },
  { insert: 'o' }
]);

console.log('frontier-richtext smoke passed');
