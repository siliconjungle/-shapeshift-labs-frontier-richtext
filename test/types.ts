import {
  applyRichTextDelta,
  createQuillRichTextBinding,
  createRichTextDocument,
  createRichTextPresenceStore,
  mergeRichTextAnnotations,
  projectStableRichTextDelta,
  richTextDeltaToProseMirrorJSON,
  type RichTextDelta,
  type RichTextDocument,
  type RichTextPresenceStore,
  type RichTextProseMirrorNode,
  type RichTextSelection
} from '../dist/index.js';

const delta: RichTextDelta = [
  { insert: 'hello', attributes: { bold: true } },
  { retain: 1 },
  { delete: 1 }
];
const doc: RichTextDocument = createRichTextDocument('hello');
const next: RichTextDocument = applyRichTextDelta(doc, delta);
const selection: RichTextSelection = { anchor: 0, head: 5 };
const pm: RichTextProseMirrorNode = richTextDeltaToProseMirrorJSON(next);
const stable: RichTextDelta = projectStableRichTextDelta(next);
const presence: RichTextPresenceStore = createRichTextPresenceStore({ actorId: 'types-a' });
const annotations = mergeRichTextAnnotations([], [
  { id: 'comment-a', type: 'comment', range: { index: 0, length: 1 }, actorId: 'types-a', clock: 1 }
]);
const binding = createQuillRichTextBinding({});

void next;
void selection;
void pm;
void stable;
void presence;
void annotations;
void binding;
