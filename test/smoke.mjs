import assert from 'node:assert';
import {
  applyRichTextDelta,
  applyRichTextAnnotationPolicy,
  createProseMirrorRichTextBinding,
  createQuillRichTextBinding,
  createRichTextCausalSelection,
  createRichTextDocument,
  createRichTextPresenceStore,
  deleteRichTextRange,
  decodeRichTextPresenceUpdate,
  encodeRichTextPresenceUpdate,
  formatRichTextRange,
  getRichTextLength,
  insertRichText,
  mergeRichTextAnnotations,
  mergeRichTextCausalSelections,
  projectStableRichTextDelta,
  proseMirrorJSONToRichTextDelta,
  quillRangeToRichTextSelection,
  richTextToDelta,
  richTextDeltaToProseMirrorJSON,
  richTextSelectionToQuillRange,
  richTextToPlainText,
  sliceRichText,
  stringifyStableRichTextDelta,
  transformRichTextAnnotations,
  transformRichTextCausalSelection,
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

assert.deepStrictEqual(quillRangeToRichTextSelection({ index: 2, length: 3 }), { anchor: 2, head: 5 });
assert.deepStrictEqual(richTextSelectionToQuillRange({ anchor: 8, head: 3 }), { index: 3, length: 5 });

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

const pmDoc = richTextDeltaToProseMirrorJSON([
  { insert: 'hello', attributes: { bold: true } },
  { insert: '\nworld', attributes: { link: 'https://frontier.local' } }
]);
assert.deepStrictEqual(pmDoc, {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'hello', marks: [{ type: 'bold' }] }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'world', marks: [{ type: 'link', attrs: { href: 'https://frontier.local' } }] }] }
  ]
});
assert.deepStrictEqual(proseMirrorJSONToRichTextDelta(pmDoc), [
  { insert: 'hello', attributes: { bold: true } },
  { insert: '\n' },
  { insert: 'world', attributes: { link: 'https://frontier.local' } }
]);

class FakeQuill {
  constructor() {
    this.contents = { ops: [] };
    this.selection = null;
    this.handlers = new Map();
  }
  getContents() {
    return this.contents;
  }
  setContents(delta) {
    this.contents = delta;
  }
  updateContents(delta, source) {
    this.contents = { ops: richTextToDelta(applyRichTextDelta(this.contents.ops, delta.ops)) };
    this.lastSource = source;
  }
  getSelection() {
    return this.selection;
  }
  setSelection(index, length, source) {
    this.selection = { index, length };
    this.lastSelectionSource = source;
  }
  on(event, callback) {
    this.handlers.set(event, callback);
  }
  off(event, callback) {
    if (this.handlers.get(event) === callback) this.handlers.delete(event);
  }
  emit(event, ...args) {
    this.handlers.get(event)?.(...args);
  }
}
const quill = new FakeQuill();
const quillChanges = [];
const quillBinding = createQuillRichTextBinding(quill, {
  document: 'abc',
  onDelta: (change) => quillChanges.push(change)
});
quill.emit('text-change', { ops: [{ retain: 1 }, { insert: 'X' }] }, null, 'user');
assert.strictEqual(richTextToPlainText(quillBinding.getDocument()), 'aXbc');
assert.strictEqual(quillChanges.length, 1);
quillBinding.applyRemoteDelta([{ retain: 4 }, { insert: '!' }]);
assert.strictEqual(richTextToPlainText(quillBinding.getDocument()), 'aXbc!');
quillBinding.setSelection({ anchor: 1, head: 3 });
assert.deepStrictEqual(quill.getSelection(), { index: 1, length: 2 });
quillBinding.destroy();
assert.strictEqual(quill.handlers.size, 0);

const pmChanges = [];
const pmAdapter = {
  json: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }] },
  selection: null,
  getJSON() {
    return this.json;
  },
  setJSON(json, meta) {
    this.json = json;
    this.meta = meta;
  },
  onChange(callback) {
    this.callback = callback;
    return () => {
      this.callback = undefined;
    };
  },
  getSelection() {
    return this.selection;
  },
  setSelection(selection) {
    this.selection = selection;
  }
};
const pmBinding = createProseMirrorRichTextBinding(pmAdapter, {
  onDelta: (change) => pmChanges.push(change)
});
pmAdapter.callback({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'two' }] }] }, { source: 'user' });
assert.strictEqual(richTextToPlainText(pmBinding.getDocument()), 'two');
assert.strictEqual(pmChanges[0].source, 'user');
pmBinding.applyRemoteDelta([{ retain: 3 }, { insert: '!' }]);
assert.deepStrictEqual(proseMirrorJSONToRichTextDelta(pmAdapter.json), [{ insert: 'two!' }]);
pmBinding.destroy();
assert.strictEqual(pmAdapter.callback, undefined);

const causalA = createRichTextCausalSelection('a', { anchor: 1, head: 4 }, { clock: 1 });
const causalB = createRichTextCausalSelection('a', { anchor: 2, head: 2 }, { clock: 2 });
assert.deepStrictEqual(mergeRichTextCausalSelections([causalA, causalB]), [causalB]);
assert.deepStrictEqual(
  transformRichTextCausalSelection(causalA, [{ retain: 1 }, { insert: 'zz' }]).selection,
  { anchor: 1, head: 6 }
);

const presenceA = createRichTextPresenceStore({ actorId: 'presence-a', now: () => 10 });
const presenceB = createRichTextPresenceStore({ actorId: 'presence-b', now: () => 20 });
const presenceUpdate = presenceA.setLocalPresence({
  selection: { anchor: 0, head: 2 },
  name: 'Ada',
  color: 'red',
  data: { role: 'editor' }
});
assert.deepStrictEqual(decodeRichTextPresenceUpdate(encodeRichTextPresenceUpdate(presenceUpdate)), presenceUpdate);
assert.deepStrictEqual(presenceB.applyUpdate(presenceB.encodeUpdate(presenceUpdate))?.selection, { anchor: 0, head: 2 });
presenceB.applyUpdate({ ...presenceUpdate, clock: 0, selection: { anchor: 9, head: 9 } });
assert.deepStrictEqual(presenceB.get('presence-a')?.selection, { anchor: 0, head: 2 });
presenceB.applyUpdate(presenceA.clearLocalPresence());
assert.strictEqual(presenceB.get('presence-a'), null);

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
