import assert from 'node:assert';
import {
  applyRichTextDelta,
  createRichTextDocument,
  deleteRichTextRange,
  formatRichTextRange,
  getRichTextLength,
  insertRichText,
  richTextToDelta,
  richTextToPlainText,
  sliceRichText,
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

console.log('frontier-richtext smoke passed');
