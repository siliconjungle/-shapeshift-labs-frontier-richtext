import {
  applyRichTextDelta,
  createRichTextDocument,
  mergeRichTextAnnotations,
  projectStableRichTextDelta,
  type RichTextDelta,
  type RichTextDocument,
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
const stable: RichTextDelta = projectStableRichTextDelta(next);
const annotations = mergeRichTextAnnotations([], [
  { id: 'comment-a', type: 'comment', range: { index: 0, length: 1 }, actorId: 'types-a', clock: 1 }
]);

void next;
void selection;
void stable;
void annotations;
