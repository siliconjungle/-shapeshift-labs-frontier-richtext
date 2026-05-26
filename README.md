# Frontier Rich Text

Rich text Delta, marks, embeds, ranges, and cursor helpers for Frontier editor integrations.

This package is the editor-facing rich text utility layer in the Frontier package family. It does not implement network sync or CRDT merge by itself; use it with `@shapeshift-labs/frontier-crdt`, `@shapeshift-labs/frontier-crdt-sync`, or an editor binding when collaborative transport is needed.

- npm: [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext)
- source: [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- core: [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- CRDT: [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt)
- license: MIT

## Related Packages

- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): core JSON diff/apply primitives.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): native CRDT document and text layer that can carry rich text documents above plain text.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): sync/repo/provider layer for collaborative Frontier documents.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket transport for synced CRDT documents.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store adapters for Frontier state/cache/CRDT surfaces.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)

## Install

```sh
npm install @shapeshift-labs/frontier-richtext
```

## Usage

```js
import {
  applyRichTextDelta,
  createQuillRichTextBinding,
  createRichTextDocument,
  projectStableRichTextDelta,
  formatRichTextRange,
  richTextToPlainText,
  transformRichTextSelection
} from '@shapeshift-labs/frontier-richtext';

const doc = createRichTextDocument('hello world');
const formatted = formatRichTextRange(doc, { index: 0, length: 5 }, { bold: true });

const next = applyRichTextDelta(formatted, [
  { retain: 6 },
  { delete: 5 },
  { insert: 'Frontier', attributes: { italic: true } }
]);

console.log(richTextToPlainText(next)); // "hello Frontier"

const selection = transformRichTextSelection(
  { anchor: 0, head: 5 },
  [{ insert: 'Local-first ' }]
);

const binding = createQuillRichTextBinding(quill, {
  document: next,
  onDelta(change) {
    console.log(projectStableRichTextDelta(change.document));
  }
});
```

## Composition With CRDT

Rich text is split deliberately across three layers:

| Layer | Owns | Does not own |
| --- | --- | --- |
| `@shapeshift-labs/frontier-richtext` | Local Delta normalization/application, range formatting, embed slicing, cursor/selection mapping, structural Quill/ProseMirror bindings, causal selection envelopes, presence state helpers, annotation policy, and stable Delta projection. | CRDT operation merge, network transport, durable storage, React rendering, or editor-specific DOM decorations. |
| `@shapeshift-labs/frontier-crdt` | Collaborative storage for rich text: CRDT text, stable mark anchors, replicated mark/embed/block sidecars, update merge, and `toDelta()`/`fromDelta()` at the document boundary. | Local editor UI policy, framework hooks, DOM decorations, network providers, or transport lifecycle. |
| `@shapeshift-labs/frontier-react` or an application adapter | React subscriptions and concrete editor plugins that connect framework lifecycle, decorations, and transport providers to Frontier documents. | Core rich-text transforms or CRDT merge semantics. |

Typical collaborative editor flow:

```ts
import {
  applyRichTextDelta,
  createRichTextDocument,
  richTextToDelta
} from '@shapeshift-labs/frontier-richtext';
import { createCrdtDocument } from '@shapeshift-labs/frontier-crdt';

const local = createRichTextDocument('hello');
const nextLocal = applyRichTextDelta(local, [{ retain: 5 }, { insert: ' world' }]);

const doc = createCrdtDocument({ actorId: 'editor-a' });
doc.richText('/body').fromDelta(richTextToDelta(nextLocal));

const update = doc.exportUpdate();
```

Use this package for fast local intent shaping before committing to a CRDT document, and for local cursor/selection transforms while an editor is applying a Delta. Use `frontier-crdt` for durable collaborative state and stable range anchors after remote edits arrive.

## API

### Documents And Delta

`createRichTextDocument(input?)`

Creates a normalized rich text document from a string, insert-only Delta, or existing document.

`richTextToDelta(document)`

Returns a normalized insert-only Delta for storage or editor adapters.

`richTextToPlainText(document, options?)`

Flattens text content. Embeds become `\uFFFC` by default.

`applyRichTextDelta(document, delta)`

Applies Quill-style `insert`, `retain`, and `delete` operations to a document. Retain attributes apply marks; `null` attribute values remove marks.

### Editing Helpers

`insertRichText(document, index, insert, attributes?)`

Inserts text or an embed at an offset.

`deleteRichTextRange(document, { index, length })`

Deletes a range.

`formatRichTextRange(document, { index, length }, attributes)`

Applies or removes attributes over a range.

`sliceRichText(document, { index, length })`

Returns a normalized document slice.

### Cursors And Selections

`transformRichTextCursor(cursor, delta, options?)`

Maps a cursor through a Delta. `association: 'before' | 'after'` controls how a cursor at an insertion point behaves.

`transformRichTextSelection(selection, delta, options?)`

Maps `{ anchor, head }` through the same cursor transform.

### Editor Bindings

`createQuillRichTextBinding(quillLike, options?)`

Creates a dependency-free binding around a Quill-shaped editor object. It listens for `text-change` and `selection-change`, maintains a local Frontier rich-text document, and applies remote Deltas back through `updateContents()` or `setContents()`.

`createProseMirrorRichTextBinding(adapter, options?)`

Creates a structural ProseMirror binding around an adapter with `getJSON()`, `setJSON()`, and optional `onChange()`. This package does not import ProseMirror; applications provide the small adapter that knows their schema and transaction lifecycle.

`richTextDeltaToProseMirrorJSON(document, options?)`

Projects a Frontier Delta to a stable ProseMirror-style JSON document.

`proseMirrorJSONToRichTextDelta(json, options?)`

Imports ProseMirror-style JSON back to a normalized Frontier Delta.

### Presence And Causality

`createRichTextCausalSelection(actorId, selection, options?)`

Wraps a selection with actor, clock, optional version, timestamp, and metadata fields.

`mergeRichTextCausalSelections(states)`

Keeps the newest selection per actor using clock, timestamp, and actor-id tie-breaking.

`transformRichTextCausalSelection(state, delta, options?)`

Maps a causal selection through a local Delta while preserving its causal envelope.

`createRichTextPresenceStore(options)`

Maintains ephemeral remote presence states with monotonic actor clocks. Stores can encode/decode presence updates as deterministic JSON bytes for transport by `frontier-crdt-sync` or an application channel.

### Comments, Links, And Projection

`mergeRichTextAnnotations(left, right, options?)`

Merges comment/link/custom annotations by id. Comments are additive; overlapping active links use deterministic last-writer policy.

`applyRichTextAnnotationPolicy(annotations, options?)`

Applies the editor conflict policy to a single annotation set.

`transformRichTextAnnotations(annotations, delta, options?)`

Maps annotation ranges through a local Delta.

`projectStableRichTextDelta(document, options?)`

Returns a deterministic Delta projection with stable attribute/embed key ordering. Optional annotations can project links and comment ids into Delta attributes for editor rendering.

`stringifyStableRichTextDelta(document, options?)`

Returns deterministic JSON for stable logging, cache keys, tests, or transport snapshots.

## Subpath Imports

This package currently exposes a single root entry point:

```ts
import { applyRichTextDelta } from '@shapeshift-labs/frontier-richtext';
```

## Package Scope

This package owns local rich text data transforms:

- Delta normalization and application;
- marks and attribute composition;
- embeds as single logical units;
- range formatting and slicing;
- stable cursor/selection mapping through local Deltas;
- structural Quill and ProseMirror adapter contracts;
- causal selection and presence envelopes;
- deterministic comment/link annotation policy;
- stable Delta projection for rendering, logging, and cache keys.

It intentionally does not own:

- CRDT operation merge;
- network sync or awareness transport;
- storage providers;
- editor-specific DOM decorations or framework plugins;
- server-side authorization or persistence for comments and presence.

Those belong in `frontier-crdt`, `frontier-crdt-sync`, `frontier-react`, transport packages, and application-specific editor plugins.

## TypeScript

The package ships ESM JavaScript plus `.d.ts` declarations. The source lives in `src/` and compiles directly to `dist/`.

## Validation

```sh
npm test
npm run fuzz
npm run bench
npm run pack:dry
```

The test suite covers Delta application, mark insertion/removal, embeds, slicing, cursor/selection mapping, TypeScript declarations, and randomized plain-text equivalence.

## Benchmarks

Run the package-local benchmark:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 7 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| create document, 4k text | 0.10 us | 0.43 us |
| apply mixed Delta | 1.05 us | 1.69 us |
| format range, 512 chars | 0.82 us | 1.27 us |
| insert marked text | 0.69 us | 1.03 us |
| export Delta | 0.13 us | 0.33 us |
| plain text flatten | 0.08 us | 0.14 us |
| transform selection | 0.58 us | 0.73 us |
| stable Delta projection | 1.94 us | 2.27 us |
| stable Delta stringify | 3.97 us | 4.42 us |
| ProseMirror JSON projection | 0.48 us | 0.71 us |
| ProseMirror JSON import | 0.32 us | 0.54 us |
| annotation conflict policy | 0.47 us | 0.65 us |
| presence update apply | 0.89 us | 1.41 us |

These are Frontier-only package measurements, not competitor comparisons.

## License

MIT. See [LICENSE](./LICENSE).
