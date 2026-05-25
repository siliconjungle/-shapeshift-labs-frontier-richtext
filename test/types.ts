import {
  applyRichTextDelta,
  createRichTextDocument,
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

void next;
void selection;
