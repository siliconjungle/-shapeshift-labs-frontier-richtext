export type RichTextAttributeValue = string | number | boolean | null;
export type RichTextAttributes = Record<string, RichTextAttributeValue>;

export interface RichTextEmbed {
  type: string;
  value?: unknown;
}

export interface RichTextInsertOp {
  insert: string | RichTextEmbed;
  attributes?: RichTextAttributes;
}

export interface RichTextRetainOp {
  retain: number;
  attributes?: RichTextAttributes;
}

export interface RichTextDeleteOp {
  delete: number;
}

export type RichTextDeltaOp = RichTextInsertOp | RichTextRetainOp | RichTextDeleteOp;
export type RichTextDelta = RichTextDeltaOp[];
export type RichTextDocumentInput = string | RichTextDelta | RichTextDocument;

export interface RichTextDocument {
  ops: RichTextInsertOp[];
}

export interface RichTextRange {
  index: number;
  length: number;
}

export interface RichTextSelection {
  anchor: number;
  head: number;
}

export interface RichTextCursorTransformOptions {
  association?: 'before' | 'after';
}

export interface RichTextPlainTextOptions {
  embedPlaceholder?: string;
}

export function createRichTextDocument(input: RichTextDocumentInput = ''): RichTextDocument {
  if (typeof input === 'string') return { ops: input.length === 0 ? [] : [{ insert: input }] };
  if (isRichTextDocument(input)) return { ops: normalizeInsertOps(input.ops) };
  return { ops: normalizeInsertOps(input) };
}

export function normalizeRichTextDelta(delta: readonly RichTextDeltaOp[]): RichTextDelta {
  const out: RichTextDelta = [];
  for (let i = 0; i < delta.length; i++) {
    const op = delta[i];
    if (isInsertOp(op)) {
      appendInsert(out, op.insert, op.attributes);
    } else if (isRetainOp(op)) {
      const retain = normalizePositiveInteger(op.retain);
      if (retain !== 0) appendRetain(out, retain, op.attributes);
    } else if (isDeleteOp(op)) {
      const count = normalizePositiveInteger(op.delete);
      if (count !== 0) appendDelete(out, count);
    } else {
      throw new TypeError('invalid rich text delta operation');
    }
  }
  return out;
}

export function richTextToDelta(input: RichTextDocumentInput): RichTextDelta {
  return normalizeInsertOps(createRichTextDocument(input).ops);
}

export function richTextToPlainText(input: RichTextDocumentInput, options: RichTextPlainTextOptions = {}): string {
  const placeholder = options.embedPlaceholder === undefined ? '\uFFFC' : String(options.embedPlaceholder);
  const document = createRichTextDocument(input);
  let out = '';
  for (let i = 0; i < document.ops.length; i++) {
    const insert = document.ops[i].insert;
    out += typeof insert === 'string' ? insert : placeholder;
  }
  return out;
}

export function getRichTextLength(input: RichTextDocumentInput): number {
  const document = createRichTextDocument(input);
  let length = 0;
  for (let i = 0; i < document.ops.length; i++) length += insertLength(document.ops[i].insert);
  return length;
}

export function applyRichTextDelta(input: RichTextDocumentInput, delta: readonly RichTextDeltaOp[]): RichTextDocument {
  const base = createRichTextDocument(input).ops;
  const cursor: SegmentCursor = { ops: base, index: 0, offset: 0 };
  const out: RichTextInsertOp[] = [];
  const normalized = normalizeRichTextDelta(delta);
  for (let i = 0; i < normalized.length; i++) {
    const op = normalized[i];
    if (isInsertOp(op)) {
      appendInsert(out, op.insert, op.attributes);
    } else if (isRetainOp(op)) {
      takeSegments(cursor, op.retain, out, op.attributes);
    } else {
      skipSegments(cursor, op.delete);
    }
  }
  takeSegments(cursor, Number.POSITIVE_INFINITY, out);
  return { ops: normalizeInsertOps(out) };
}

export function insertRichText(
  input: RichTextDocumentInput,
  index: number,
  insert: string | RichTextEmbed,
  attributes?: RichTextAttributes
): RichTextDocument {
  const at = clampIndex(index, getRichTextLength(input));
  return applyRichTextDelta(input, [{ retain: at }, { insert, attributes }]);
}

export function deleteRichTextRange(input: RichTextDocumentInput, range: RichTextRange): RichTextDocument {
  const length = getRichTextLength(input);
  const start = clampIndex(range.index, length);
  const deleteLength = Math.min(length - start, normalizePositiveInteger(range.length));
  return applyRichTextDelta(input, [{ retain: start }, { delete: deleteLength }]);
}

export function formatRichTextRange(
  input: RichTextDocumentInput,
  range: RichTextRange,
  attributes: RichTextAttributes
): RichTextDocument {
  const length = getRichTextLength(input);
  const start = clampIndex(range.index, length);
  const retain = Math.min(length - start, normalizePositiveInteger(range.length));
  return applyRichTextDelta(input, [{ retain: start }, { retain, attributes }]);
}

export function sliceRichText(input: RichTextDocumentInput, range: RichTextRange): RichTextDocument {
  const length = getRichTextLength(input);
  const start = clampIndex(range.index, length);
  const take = Math.min(length - start, normalizePositiveInteger(range.length));
  const cursor: SegmentCursor = { ops: createRichTextDocument(input).ops, index: 0, offset: 0 };
  skipSegments(cursor, start);
  const out: RichTextInsertOp[] = [];
  takeSegments(cursor, take, out);
  return { ops: normalizeInsertOps(out) };
}

export function transformRichTextCursor(
  cursor: number,
  delta: readonly RichTextDeltaOp[],
  options: RichTextCursorTransformOptions = {}
): number {
  const index = Math.max(0, Math.floor(cursor));
  let oldPosition = 0;
  let newPosition = 0;
  const association = options.association || 'after';
  const normalized = normalizeRichTextDelta(delta);
  for (let i = 0; i < normalized.length; i++) {
    const op = normalized[i];
    if (isInsertOp(op)) {
      const length = insertLength(op.insert);
      if (oldPosition < index || (oldPosition === index && association === 'after')) {
        newPosition += length;
      } else if (oldPosition === index) {
        return newPosition;
      }
    } else if (isRetainOp(op)) {
      const end = oldPosition + op.retain;
      if (index <= end) return newPosition + (index - oldPosition);
      oldPosition = end;
      newPosition += op.retain;
    } else {
      const end = oldPosition + op.delete;
      if (index <= end) return newPosition;
      oldPosition = end;
    }
  }
  return newPosition + Math.max(0, index - oldPosition);
}

export function transformRichTextSelection(
  selection: RichTextSelection,
  delta: readonly RichTextDeltaOp[],
  options: RichTextCursorTransformOptions = {}
): RichTextSelection {
  return {
    anchor: transformRichTextCursor(selection.anchor, delta, options),
    head: transformRichTextCursor(selection.head, delta, options)
  };
}

export function attributesEqual(left: RichTextAttributes | undefined, right: RichTextAttributes | undefined): boolean {
  const leftKeys = left === undefined ? [] : Object.keys(left);
  const rightKeys = right === undefined ? [] : Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  leftKeys.sort();
  rightKeys.sort();
  for (let i = 0; i < leftKeys.length; i++) {
    const key = leftKeys[i];
    if (key !== rightKeys[i] || left?.[key] !== right?.[key]) return false;
  }
  return true;
}

type SegmentCursor = {
  ops: RichTextInsertOp[];
  index: number;
  offset: number;
};

function normalizeInsertOps(ops: readonly RichTextDeltaOp[]): RichTextInsertOp[] {
  const out: RichTextInsertOp[] = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (!isInsertOp(op)) throw new TypeError('rich text document can only contain insert operations');
    appendInsert(out, op.insert, op.attributes);
  }
  return out;
}

function takeSegments(
  cursor: SegmentCursor,
  count: number,
  out: RichTextInsertOp[],
  attributes?: RichTextAttributes
): void {
  let remaining = count;
  while (remaining > 0 && cursor.index < cursor.ops.length) {
    const op = cursor.ops[cursor.index];
    const available = insertLength(op.insert) - cursor.offset;
    const take = Math.min(remaining, available);
    const insert = sliceInsert(op.insert, cursor.offset, take);
    appendInsert(out, insert, composeAttributes(op.attributes, attributes));
    remaining -= take;
    cursor.offset += take;
    if (cursor.offset >= insertLength(op.insert)) {
      cursor.index++;
      cursor.offset = 0;
    }
  }
}

function skipSegments(cursor: SegmentCursor, count: number): void {
  let remaining = count;
  while (remaining > 0 && cursor.index < cursor.ops.length) {
    const op = cursor.ops[cursor.index];
    const available = insertLength(op.insert) - cursor.offset;
    const take = Math.min(remaining, available);
    remaining -= take;
    cursor.offset += take;
    if (cursor.offset >= insertLength(op.insert)) {
      cursor.index++;
      cursor.offset = 0;
    }
  }
}

function appendInsert(out: RichTextDelta, insert: string | RichTextEmbed, attributes?: RichTextAttributes): void {
  if (typeof insert === 'string') {
    if (insert.length === 0) return;
    const normalizedAttributes = normalizeAttributes(attributes);
    const previous = out[out.length - 1];
    if (
      previous !== undefined &&
      isInsertOp(previous) &&
      typeof previous.insert === 'string' &&
      attributesEqual(previous.attributes, normalizedAttributes)
    ) {
      previous.insert += insert;
      return;
    }
    out[out.length] = normalizedAttributes === undefined
      ? { insert }
      : { insert, attributes: normalizedAttributes };
    return;
  }
  const normalizedAttributes = normalizeAttributes(attributes);
  out[out.length] = normalizedAttributes === undefined
    ? { insert: cloneEmbed(insert) }
    : { insert: cloneEmbed(insert), attributes: normalizedAttributes };
}

function appendRetain(out: RichTextDelta, retain: number, attributes?: RichTextAttributes): void {
  const normalizedAttributes = normalizeRetainAttributes(attributes);
  const previous = out[out.length - 1];
  if (previous !== undefined && isRetainOp(previous) && attributesEqual(previous.attributes, normalizedAttributes)) {
    previous.retain += retain;
    return;
  }
  out[out.length] = normalizedAttributes === undefined ? { retain } : { retain, attributes: normalizedAttributes };
}

function normalizeRetainAttributes(attributes: RichTextAttributes | undefined): RichTextAttributes | undefined {
  if (attributes === undefined) return undefined;
  const keys = Object.keys(attributes).sort();
  const out: RichTextAttributes = {};
  for (let i = 0; i < keys.length; i++) out[keys[i]] = attributes[keys[i]];
  return keys.length === 0 ? undefined : out;
}

function appendDelete(out: RichTextDelta, count: number): void {
  const previous = out[out.length - 1];
  if (previous !== undefined && isDeleteOp(previous)) {
    previous.delete += count;
    return;
  }
  out[out.length] = { delete: count };
}

function composeAttributes(
  base: RichTextAttributes | undefined,
  change: RichTextAttributes | undefined
): RichTextAttributes | undefined {
  if (change === undefined) return normalizeAttributes(base);
  const out: RichTextAttributes = base === undefined ? {} : { ...base };
  const keys = Object.keys(change);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = change[key];
    if (value === null) delete out[key];
    else out[key] = value;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

function normalizeAttributes(attributes: RichTextAttributes | undefined): RichTextAttributes | undefined {
  if (attributes === undefined) return undefined;
  const keys = Object.keys(attributes).sort();
  const out: RichTextAttributes = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = attributes[key];
    if (value !== null) out[key] = value;
  }
  return Object.keys(out).length === 0 ? undefined : out;
}

function sliceInsert(insert: string | RichTextEmbed, offset: number, length: number): string | RichTextEmbed {
  if (typeof insert === 'string') return insert.slice(offset, offset + length);
  if (offset !== 0 || length !== 1) throw new RangeError('cannot split a rich text embed');
  return cloneEmbed(insert);
}

function insertLength(insert: string | RichTextEmbed): number {
  return typeof insert === 'string' ? insert.length : 1;
}

function normalizePositiveInteger(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function clampIndex(index: number, length: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(length, Math.max(0, Math.floor(index)));
}

function cloneEmbed(embed: RichTextEmbed): RichTextEmbed {
  const out: RichTextEmbed = { type: String(embed.type) };
  if ('value' in embed) out.value = cloneUnknown(embed.value);
  return out;
}

function cloneUnknown(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(cloneUnknown);
  const out: Record<string, unknown> = {};
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) out[keys[i]] = cloneUnknown((value as Record<string, unknown>)[keys[i]]);
  return out;
}

function isRichTextDocument(value: unknown): value is RichTextDocument {
  return value !== null && typeof value === 'object' && Array.isArray((value as RichTextDocument).ops);
}

function isInsertOp(value: RichTextDeltaOp): value is RichTextInsertOp {
  return Object.hasOwn(value, 'insert');
}

function isRetainOp(value: RichTextDeltaOp): value is RichTextRetainOp {
  return Object.hasOwn(value, 'retain');
}

function isDeleteOp(value: RichTextDeltaOp): value is RichTextDeleteOp {
  return Object.hasOwn(value, 'delete');
}
