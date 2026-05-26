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

export interface RichTextQuillRange {
  index: number;
  length: number;
}

export interface RichTextQuillDeltaLike {
  ops: RichTextDelta;
}

export interface RichTextQuillLike {
  getContents?(): RichTextDelta | RichTextQuillDeltaLike;
  setContents?(delta: RichTextDelta | RichTextQuillDeltaLike, source?: string): unknown;
  updateContents?(delta: RichTextDelta | RichTextQuillDeltaLike, source?: string): unknown;
  getSelection?(): RichTextQuillRange | null;
  setSelection?(index: number, length?: number, source?: string): unknown;
  on?(event: 'text-change' | 'selection-change', callback: (...args: unknown[]) => void): unknown;
  off?(event: 'text-change' | 'selection-change', callback: (...args: unknown[]) => void): unknown;
}

export interface RichTextBindingChange {
  delta: RichTextDelta;
  document: RichTextDocument;
  source: string;
}

export interface RichTextSelectionChange {
  selection: RichTextSelection | null;
  source: string;
}

export interface RichTextBinding {
  getDocument(): RichTextDocument;
  setDocument(input: RichTextDocumentInput, source?: string): void;
  applyRemoteDelta(delta: readonly RichTextDeltaOp[], source?: string): RichTextDocument;
  getSelection(): RichTextSelection | null;
  setSelection(selection: RichTextSelection | null, source?: string): void;
  destroy(): void;
}

export interface RichTextQuillBindingOptions {
  document?: RichTextDocumentInput;
  remoteSource?: string;
  onDelta?(change: RichTextBindingChange): void;
  onSelection?(change: RichTextSelectionChange): void;
}

export interface RichTextProseMirrorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextProseMirrorNode {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichTextProseMirrorMark[];
  content?: RichTextProseMirrorNode[];
}

export interface RichTextProseMirrorProjectionOptions {
  docType?: string;
  paragraphType?: string;
  blockSeparator?: string;
  preserveTrailingBlockSeparator?: boolean;
}

export interface RichTextProseMirrorAdapter {
  getJSON?(): RichTextProseMirrorNode;
  setJSON?(doc: RichTextProseMirrorNode, meta?: Record<string, unknown>): unknown;
  onChange?(callback: (doc: RichTextProseMirrorNode, meta?: Record<string, unknown>) => void): (() => void) | void;
  getSelection?(): RichTextSelection | null;
  setSelection?(selection: RichTextSelection | null, meta?: Record<string, unknown>): unknown;
}

export interface RichTextProseMirrorBindingOptions extends RichTextProseMirrorProjectionOptions {
  document?: RichTextDocumentInput;
  onDelta?(change: RichTextBindingChange): void;
  onSelection?(change: RichTextSelectionChange): void;
}

export interface RichTextCausalSelection {
  actorId: string;
  clock: number;
  selection: RichTextSelection | null;
  version?: string;
  updatedAt?: number;
  data?: Record<string, unknown>;
}

export interface RichTextCausalSelectionOptions {
  clock?: number;
  version?: string;
  updatedAt?: number;
  data?: Record<string, unknown>;
}

export interface RichTextPresenceState extends RichTextCausalSelection {
  name?: string;
  color?: string;
}

export interface RichTextPresenceUpdate extends RichTextPresenceState {
  expired?: boolean;
}

export interface RichTextPresenceStoreOptions {
  actorId: string;
  now?: () => number;
}

export interface RichTextPresenceInput {
  selection?: RichTextSelection | null;
  name?: string;
  color?: string;
  data?: Record<string, unknown>;
  version?: string;
}

export interface RichTextPresenceStore {
  setLocalPresence(input: RichTextPresenceInput): RichTextPresenceUpdate;
  clearLocalPresence(): RichTextPresenceUpdate;
  applyUpdate(update: RichTextPresenceUpdate | Uint8Array | string): RichTextPresenceState | null;
  applyUpdates(updates: readonly (RichTextPresenceUpdate | Uint8Array | string)[]): Array<RichTextPresenceState | null>;
  get(actorId: string): RichTextPresenceState | null;
  getStates(): RichTextPresenceState[];
  encodeUpdate(update: RichTextPresenceUpdate): Uint8Array;
}

export type RichTextAnnotationType = 'comment' | 'link' | 'custom';
export type RichTextAnnotationStatus = 'active' | 'resolved' | 'deleted';
export type RichTextAnnotationPolicy = 'editor' | 'last-writer-wins' | 'append-only';

export interface RichTextAnnotation {
  id: string;
  type: RichTextAnnotationType | string;
  range: RichTextRange;
  actorId: string;
  clock: number;
  status?: RichTextAnnotationStatus;
  href?: string;
  value?: unknown;
  data?: Record<string, unknown>;
}

export interface RichTextAnnotationPolicyOptions {
  policy?: RichTextAnnotationPolicy;
}

export interface RichTextDeltaProjectionOptions {
  annotations?: readonly RichTextAnnotation[];
  annotateComments?: boolean;
  annotateLinks?: boolean;
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

export function createQuillRichTextBinding(
  editor: RichTextQuillLike,
  options: RichTextQuillBindingOptions = {}
): RichTextBinding {
  let document = createRichTextDocument(options.document ?? readQuillContents(editor) ?? '');
  let suppress = false;
  const remoteSource = options.remoteSource || 'api';
  const textHandler = (delta: unknown, _old: unknown, source: unknown): void => {
    if (suppress) return;
    const normalized = readDeltaLike(delta);
    document = applyRichTextDelta(document, normalized);
    options.onDelta?.({ delta: normalized, document: cloneRichTextDocument(document), source: String(source || 'user') });
  };
  const selectionHandler = (range: unknown, _old: unknown, source: unknown): void => {
    if (suppress) return;
    options.onSelection?.({
      selection: quillRangeToRichTextSelection(range),
      source: String(source || 'user')
    });
  };
  editor.on?.('text-change', textHandler);
  editor.on?.('selection-change', selectionHandler);
  writeQuillContents(editor, document, 'silent');
  return {
    getDocument() {
      return cloneRichTextDocument(document);
    },
    setDocument(input: RichTextDocumentInput, source = 'api') {
      document = createRichTextDocument(input);
      suppress = true;
      try {
        writeQuillContents(editor, document, source);
      } finally {
        suppress = false;
      }
    },
    applyRemoteDelta(delta: readonly RichTextDeltaOp[], source = remoteSource) {
      const normalized = normalizeRichTextDelta(delta);
      document = applyRichTextDelta(document, normalized);
      suppress = true;
      try {
        if (editor.updateContents) editor.updateContents({ ops: normalized }, source);
        else writeQuillContents(editor, document, source);
      } finally {
        suppress = false;
      }
      return cloneRichTextDocument(document);
    },
    getSelection() {
      return quillRangeToRichTextSelection(editor.getSelection?.() ?? null);
    },
    setSelection(selection: RichTextSelection | null, source = 'api') {
      const range = richTextSelectionToQuillRange(selection);
      suppress = true;
      try {
        if (range === null) editor.setSelection?.(0, 0, source);
        else editor.setSelection?.(range.index, range.length, source);
      } finally {
        suppress = false;
      }
    },
    destroy() {
      editor.off?.('text-change', textHandler);
      editor.off?.('selection-change', selectionHandler);
    }
  };
}

export function createProseMirrorRichTextBinding(
  adapter: RichTextProseMirrorAdapter,
  options: RichTextProseMirrorBindingOptions = {}
): RichTextBinding {
  let document = createRichTextDocument(
    options.document ??
      (adapter.getJSON ? proseMirrorJSONToRichTextDelta(adapter.getJSON(), options) : '')
  );
  let suppress = false;
  const unsubscribe = adapter.onChange?.((json, meta) => {
    if (suppress) return;
    const nextDelta = proseMirrorJSONToRichTextDelta(json, options);
    document = createRichTextDocument(nextDelta);
    options.onDelta?.({
      delta: projectStableRichTextDelta(document),
      document: cloneRichTextDocument(document),
      source: String(meta?.source || 'user')
    });
  });
  writeProseMirrorJSON(adapter, document, options, 'silent');
  return {
    getDocument() {
      return cloneRichTextDocument(document);
    },
    setDocument(input: RichTextDocumentInput, source = 'api') {
      document = createRichTextDocument(input);
      suppress = true;
      try {
        writeProseMirrorJSON(adapter, document, options, source);
      } finally {
        suppress = false;
      }
    },
    applyRemoteDelta(delta: readonly RichTextDeltaOp[], source = 'remote') {
      const normalized = normalizeRichTextDelta(delta);
      document = applyRichTextDelta(document, normalized);
      suppress = true;
      try {
        writeProseMirrorJSON(adapter, document, options, source);
      } finally {
        suppress = false;
      }
      return cloneRichTextDocument(document);
    },
    getSelection() {
      return adapter.getSelection?.() ?? null;
    },
    setSelection(selection: RichTextSelection | null, source = 'api') {
      adapter.setSelection?.(selection, { source });
      options.onSelection?.({ selection, source });
    },
    destroy() {
      if (typeof unsubscribe === 'function') unsubscribe();
    }
  };
}

export function quillRangeToRichTextSelection(range: unknown): RichTextSelection | null {
  if (range === null || range === undefined || typeof range !== 'object') return null;
  const input = range as Partial<RichTextQuillRange>;
  const index = normalizePositiveInteger(input.index || 0);
  const length = normalizePositiveInteger(input.length || 0);
  return { anchor: index, head: index + length };
}

export function richTextSelectionToQuillRange(selection: RichTextSelection | null): RichTextQuillRange | null {
  if (selection === null) return null;
  const anchor = normalizePositiveInteger(selection.anchor);
  const head = normalizePositiveInteger(selection.head);
  const start = Math.min(anchor, head);
  return { index: start, length: Math.max(anchor, head) - start };
}

export function richTextDeltaToProseMirrorJSON(
  input: RichTextDocumentInput,
  options: RichTextProseMirrorProjectionOptions = {}
): RichTextProseMirrorNode {
  const docType = options.docType || 'doc';
  const paragraphType = options.paragraphType || 'paragraph';
  const doc: RichTextProseMirrorNode = { type: docType, content: [] };
  let paragraph: RichTextProseMirrorNode = { type: paragraphType, content: [] };
  const appendParagraph = (): void => {
    doc.content!.push(paragraph);
    paragraph = { type: paragraphType, content: [] };
  };
  const delta = projectStableRichTextDelta(input);
  for (let i = 0; i < delta.length; i++) {
    const op = delta[i];
    if (!isInsertOp(op)) continue;
    const marks = attributesToProseMirrorMarks(op.attributes);
    if (typeof op.insert !== 'string') {
      paragraph.content!.push({
        type: op.insert.type,
        attrs: stableRecord({ frontierEmbed: true, value: op.insert.value })
      });
      continue;
    }
    const parts = op.insert.split('\n');
    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const text = parts[partIndex];
      if (text.length !== 0) {
        paragraph.content!.push(marks.length === 0 ? { type: 'text', text } : { type: 'text', text, marks });
      }
      if (partIndex < parts.length - 1) appendParagraph();
    }
  }
  appendParagraph();
  return doc;
}

export function proseMirrorJSONToRichTextDelta(
  input: RichTextProseMirrorNode,
  options: RichTextProseMirrorProjectionOptions = {}
): RichTextDelta {
  const paragraphType = options.paragraphType || 'paragraph';
  const blockSeparator = options.blockSeparator === undefined ? '\n' : options.blockSeparator;
  const out: RichTextDelta = [];
  const content = input.content || [];
  for (let i = 0; i < content.length; i++) {
    appendProseMirrorNodeDelta(out, content[i]);
    if (content[i].type === paragraphType && (options.preserveTrailingBlockSeparator || i < content.length - 1)) {
      appendInsert(out, blockSeparator);
    }
  }
  return projectStableRichTextDelta(out);
}

export function createRichTextCausalSelection(
  actorId: string,
  selection: RichTextSelection | null,
  options: RichTextCausalSelectionOptions = {}
): RichTextCausalSelection {
  const out: RichTextCausalSelection = {
    actorId: String(actorId),
    clock: normalizePositiveInteger(options.clock || 0),
    selection: selection === null ? null : normalizeSelection(selection)
  };
  if (options.version !== undefined) out.version = String(options.version);
  if (options.updatedAt !== undefined) out.updatedAt = normalizePositiveInteger(options.updatedAt);
  if (options.data !== undefined) out.data = cloneRecord(options.data);
  return out;
}

export function compareRichTextCausalSelection(
  left: RichTextCausalSelection,
  right: RichTextCausalSelection
): number {
  if (left.clock !== right.clock) return left.clock - right.clock;
  if ((left.updatedAt || 0) !== (right.updatedAt || 0)) return (left.updatedAt || 0) - (right.updatedAt || 0);
  return left.actorId < right.actorId ? -1 : left.actorId > right.actorId ? 1 : 0;
}

export function mergeRichTextCausalSelections(
  states: readonly RichTextCausalSelection[]
): RichTextCausalSelection[] {
  const byActor = new Map<string, RichTextCausalSelection>();
  for (let i = 0; i < states.length; i++) {
    const next = cloneCausalSelection(states[i]);
    const previous = byActor.get(next.actorId);
    if (previous === undefined || compareRichTextCausalSelection(previous, next) <= 0) byActor.set(next.actorId, next);
  }
  return Array.from(byActor.values()).sort(compareActorId);
}

export function transformRichTextCausalSelection(
  state: RichTextCausalSelection,
  delta: readonly RichTextDeltaOp[],
  options: RichTextCursorTransformOptions = {}
): RichTextCausalSelection {
  return {
    ...cloneCausalSelection(state),
    selection: state.selection === null ? null : transformRichTextSelection(state.selection, delta, options)
  };
}

export function createRichTextPresenceStore(options: RichTextPresenceStoreOptions): RichTextPresenceStore {
  const actorId = String(options.actorId);
  const now = options.now || Date.now;
  let clock = 0;
  const states = new Map<string, RichTextPresenceState>();
  const apply = (input: RichTextPresenceUpdate | Uint8Array | string): RichTextPresenceState | null => {
    const update = typeof input === 'string' || input instanceof Uint8Array
      ? decodeRichTextPresenceUpdate(input)
      : clonePresenceUpdate(input);
    const previous = states.get(update.actorId);
    if (previous !== undefined && compareRichTextCausalSelection(previous, update) > 0) {
      return clonePresenceState(previous);
    }
    if (update.expired) {
      states.delete(update.actorId);
      return null;
    }
    const state = presenceUpdateToState(update);
    states.set(state.actorId, state);
    return clonePresenceState(state);
  };
  return {
    setLocalPresence(input: RichTextPresenceInput) {
      clock++;
      const update: RichTextPresenceUpdate = {
        actorId,
        clock,
        selection: input.selection === undefined ? null : input.selection === null ? null : normalizeSelection(input.selection),
        updatedAt: now()
      };
      if (input.name !== undefined) update.name = String(input.name);
      if (input.color !== undefined) update.color = String(input.color);
      if (input.version !== undefined) update.version = String(input.version);
      if (input.data !== undefined) update.data = cloneRecord(input.data);
      apply(update);
      return clonePresenceUpdate(update);
    },
    clearLocalPresence() {
      clock++;
      const update: RichTextPresenceUpdate = { actorId, clock, selection: null, updatedAt: now(), expired: true };
      apply(update);
      return clonePresenceUpdate(update);
    },
    applyUpdate: apply,
    applyUpdates(updates) {
      const out = new Array<RichTextPresenceState | null>(updates.length);
      for (let i = 0; i < updates.length; i++) out[i] = apply(updates[i]);
      return out;
    },
    get(targetActorId: string) {
      const state = states.get(String(targetActorId));
      return state === undefined ? null : clonePresenceState(state);
    },
    getStates() {
      return Array.from(states.values()).map(clonePresenceState).sort(compareActorId);
    },
    encodeUpdate(update: RichTextPresenceUpdate) {
      return encodeRichTextPresenceUpdate(update);
    }
  };
}

export function encodeRichTextPresenceUpdate(update: RichTextPresenceUpdate): Uint8Array {
  return new TextEncoder().encode(stableStringify(clonePresenceUpdate(update)));
}

export function decodeRichTextPresenceUpdate(input: Uint8Array | string): RichTextPresenceUpdate {
  const text = typeof input === 'string' ? input : new TextDecoder().decode(input);
  return clonePresenceUpdate(JSON.parse(text) as RichTextPresenceUpdate);
}

export function mergeRichTextAnnotations(
  left: readonly RichTextAnnotation[],
  right: readonly RichTextAnnotation[],
  options: RichTextAnnotationPolicyOptions = {}
): RichTextAnnotation[] {
  const byId = new Map<string, RichTextAnnotation>();
  const visit = (annotation: RichTextAnnotation): void => {
    const next = normalizeAnnotation(annotation);
    const previous = byId.get(next.id);
    if (previous === undefined || compareAnnotationVersion(previous, next) <= 0) byId.set(next.id, next);
  };
  for (let i = 0; i < left.length; i++) visit(left[i]);
  for (let i = 0; i < right.length; i++) visit(right[i]);
  return applyRichTextAnnotationPolicy(Array.from(byId.values()), options);
}

export function applyRichTextAnnotationPolicy(
  annotations: readonly RichTextAnnotation[],
  options: RichTextAnnotationPolicyOptions = {}
): RichTextAnnotation[] {
  const policy = options.policy || 'editor';
  const active = annotations
    .map(normalizeAnnotation)
    .filter((annotation) => annotation.status !== 'deleted')
    .sort(compareAnnotationOrder);
  if (policy === 'append-only') return active;
  const out: RichTextAnnotation[] = [];
  const links: RichTextAnnotation[] = [];
  for (let i = 0; i < active.length; i++) {
    const annotation = active[i];
    if (annotation.type === 'link' && annotation.status !== 'resolved') links[links.length] = annotation;
    else out[out.length] = annotation;
  }
  links.sort((left, right) => compareAnnotationVersion(right, left) || compareAnnotationOrder(left, right));
  const keptLinks: RichTextAnnotation[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    let overlaps = false;
    for (let j = 0; j < keptLinks.length; j++) {
      if (rangesOverlap(link.range, keptLinks[j].range)) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) keptLinks[keptLinks.length] = link;
  }
  return out.concat(keptLinks).sort(compareAnnotationOrder);
}

export function transformRichTextAnnotations(
  annotations: readonly RichTextAnnotation[],
  delta: readonly RichTextDeltaOp[],
  options: RichTextCursorTransformOptions = {}
): RichTextAnnotation[] {
  const out: RichTextAnnotation[] = [];
  for (let i = 0; i < annotations.length; i++) {
    const annotation = normalizeAnnotation(annotations[i]);
    const start = transformRichTextCursor(annotation.range.index, delta, { association: options.association || 'before' });
    const end = transformRichTextCursor(annotation.range.index + annotation.range.length, delta, { association: 'after' });
    annotation.range = { index: Math.min(start, end), length: Math.max(0, Math.abs(end - start)) };
    if (annotation.range.length !== 0 || annotation.type === 'comment') out[out.length] = annotation;
  }
  return out.sort(compareAnnotationOrder);
}

export function projectStableRichTextDelta(
  input: RichTextDocumentInput,
  options: RichTextDeltaProjectionOptions = {}
): RichTextDelta {
  let document = createRichTextDocument(input);
  const annotations = options.annotations === undefined ? [] : applyRichTextAnnotationPolicy(options.annotations);
  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    if (annotation.status === 'resolved' || annotation.status === 'deleted') continue;
    if (annotation.type === 'link' && options.annotateLinks !== false && annotation.href !== undefined) {
      document = formatRichTextRange(document, annotation.range, { link: annotation.href });
    } else if (annotation.type === 'comment' && options.annotateComments) {
      document = formatRichTextRange(document, annotation.range, { comment: annotation.id });
    }
  }
  const delta = richTextToDelta(document);
  const out: RichTextDelta = [];
  for (let i = 0; i < delta.length; i++) {
    const op = delta[i];
    if (isInsertOp(op)) appendInsert(out, stableInsert(op.insert), op.attributes);
    else if (isRetainOp(op)) appendRetain(out, op.retain, op.attributes);
    else appendDelete(out, op.delete);
  }
  return out;
}

export function stringifyStableRichTextDelta(input: RichTextDocumentInput, options: RichTextDeltaProjectionOptions = {}): string {
  return stableStringify(projectStableRichTextDelta(input, options));
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

function cloneRichTextDocument(document: RichTextDocument): RichTextDocument {
  return { ops: normalizeInsertOps(document.ops) };
}

function readQuillContents(editor: RichTextQuillLike): RichTextDelta | undefined {
  return editor.getContents === undefined ? undefined : readDeltaLike(editor.getContents());
}

function readDeltaLike(input: unknown): RichTextDelta {
  if (Array.isArray(input)) return normalizeRichTextDelta(input as RichTextDeltaOp[]);
  if (input !== null && typeof input === 'object' && Array.isArray((input as RichTextQuillDeltaLike).ops)) {
    return normalizeRichTextDelta((input as RichTextQuillDeltaLike).ops);
  }
  throw new TypeError('expected a rich text Delta or Delta-like object');
}

function writeQuillContents(editor: RichTextQuillLike, document: RichTextDocument, source: string): void {
  editor.setContents?.({ ops: projectStableRichTextDelta(document) }, source);
}

function writeProseMirrorJSON(
  adapter: RichTextProseMirrorAdapter,
  document: RichTextDocument,
  options: RichTextProseMirrorProjectionOptions,
  source: string
): void {
  adapter.setJSON?.(richTextDeltaToProseMirrorJSON(document, options), { source });
}

function attributesToProseMirrorMarks(attributes: RichTextAttributes | undefined): RichTextProseMirrorMark[] {
  if (attributes === undefined) return [];
  const keys = Object.keys(attributes).sort();
  const marks: RichTextProseMirrorMark[] = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = attributes[key];
    if (value === null) continue;
    if (key === 'link' && typeof value === 'string') {
      marks[marks.length] = { type: 'link', attrs: { href: value } };
    } else {
      marks[marks.length] = value === true ? { type: key } : { type: key, attrs: { value } };
    }
  }
  return marks;
}

function proseMirrorMarksToAttributes(marks: readonly RichTextProseMirrorMark[] | undefined): RichTextAttributes | undefined {
  if (marks === undefined || marks.length === 0) return undefined;
  const attrs: RichTextAttributes = {};
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    if (mark.type === 'link' && typeof mark.attrs?.href === 'string') attrs.link = mark.attrs.href;
    else attrs[mark.type] = readMarkValue(mark.attrs);
  }
  return normalizeAttributes(attrs);
}

function readMarkValue(attrs: Record<string, unknown> | undefined): RichTextAttributeValue {
  if (attrs === undefined || !Object.hasOwn(attrs, 'value')) return true;
  const value = attrs.value;
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null
    ? value
    : true;
}

function appendProseMirrorNodeDelta(out: RichTextDelta, node: RichTextProseMirrorNode): void {
  if (node.text !== undefined) {
    appendInsert(out, node.text, proseMirrorMarksToAttributes(node.marks));
    return;
  }
  if (node.content !== undefined && node.content.length !== 0) {
    for (let i = 0; i < node.content.length; i++) appendProseMirrorNodeDelta(out, node.content[i]);
    return;
  }
  if (node.type !== 'doc' && node.type !== 'paragraph' && node.type !== 'text') {
    const value = node.attrs && Object.hasOwn(node.attrs, 'value') ? node.attrs.value : cloneUnknown(node.attrs);
    appendInsert(out, { type: node.type, value });
  }
}

function normalizeSelection(selection: RichTextSelection): RichTextSelection {
  return {
    anchor: normalizePositiveInteger(selection.anchor),
    head: normalizePositiveInteger(selection.head)
  };
}

function cloneCausalSelection(state: RichTextCausalSelection): RichTextCausalSelection {
  const out = createRichTextCausalSelection(state.actorId, state.selection, {
    clock: state.clock,
    version: state.version,
    updatedAt: state.updatedAt,
    data: state.data
  });
  return out;
}

function clonePresenceState(state: RichTextPresenceState): RichTextPresenceState {
  const out: RichTextPresenceState = cloneCausalSelection(state);
  if (state.name !== undefined) out.name = state.name;
  if (state.color !== undefined) out.color = state.color;
  return out;
}

function clonePresenceUpdate(update: RichTextPresenceUpdate): RichTextPresenceUpdate {
  const out: RichTextPresenceUpdate = clonePresenceState(update);
  if (update.expired !== undefined) out.expired = !!update.expired;
  return out;
}

function presenceUpdateToState(update: RichTextPresenceUpdate): RichTextPresenceState {
  return clonePresenceState(update);
}

function compareActorId<T extends { actorId: string }>(left: T, right: T): number {
  return left.actorId < right.actorId ? -1 : left.actorId > right.actorId ? 1 : 0;
}

function normalizeAnnotation(annotation: RichTextAnnotation): RichTextAnnotation {
  const out: RichTextAnnotation = {
    id: String(annotation.id),
    type: String(annotation.type || 'custom'),
    range: normalizeRange(annotation.range),
    actorId: String(annotation.actorId),
    clock: normalizePositiveInteger(annotation.clock),
    status: annotation.status || 'active'
  };
  if (annotation.href !== undefined) out.href = String(annotation.href);
  if (annotation.value !== undefined) out.value = stableCloneUnknown(annotation.value);
  if (annotation.data !== undefined) out.data = cloneRecord(annotation.data);
  return out;
}

function normalizeRange(range: RichTextRange): RichTextRange {
  return {
    index: normalizePositiveInteger(range.index),
    length: normalizePositiveInteger(range.length)
  };
}

function compareAnnotationVersion(left: RichTextAnnotation, right: RichTextAnnotation): number {
  if (left.clock !== right.clock) return left.clock - right.clock;
  return left.actorId < right.actorId ? -1 : left.actorId > right.actorId ? 1 : 0;
}

function compareAnnotationOrder(left: RichTextAnnotation, right: RichTextAnnotation): number {
  if (left.range.index !== right.range.index) return left.range.index - right.range.index;
  if (left.range.length !== right.range.length) return left.range.length - right.range.length;
  if (left.type !== right.type) return left.type < right.type ? -1 : 1;
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function rangesOverlap(left: RichTextRange, right: RichTextRange): boolean {
  const leftEnd = left.index + left.length;
  const rightEnd = right.index + right.length;
  return left.index < rightEnd && right.index < leftEnd;
}

function stableInsert(insert: string | RichTextEmbed): string | RichTextEmbed {
  return typeof insert === 'string' ? insert : cloneStableEmbed(insert);
}

function cloneStableEmbed(embed: RichTextEmbed): RichTextEmbed {
  const out: RichTextEmbed = { type: String(embed.type) };
  if ('value' in embed) out.value = stableCloneUnknown(embed.value);
  return out;
}

function cloneRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = Object.keys(record).sort();
  for (let i = 0; i < keys.length; i++) out[keys[i]] = cloneUnknown(record[keys[i]]);
  return out;
}

function stableRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const keys = Object.keys(record).sort();
  for (let i = 0; i < keys.length; i++) out[keys[i]] = stableCloneUnknown(record[keys[i]]);
  return out;
}

function stableCloneUnknown(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableCloneUnknown);
  const out: Record<string, unknown> = {};
  const keys = Object.keys(value).sort();
  for (let i = 0; i < keys.length; i++) out[keys[i]] = stableCloneUnknown((value as Record<string, unknown>)[keys[i]]);
  return out;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableCloneUnknown(value));
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
