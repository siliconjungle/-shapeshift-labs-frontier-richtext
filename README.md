# Frontier Rich Text

Rich text Delta, marks, embeds, ranges, and cursor helpers for Frontier editor integrations.

This package is the editor-facing rich text utility layer in the Frontier package family. It does not implement network sync or CRDT merge by itself; use it with `@shapeshift-labs/frontier-crdt`, `@shapeshift-labs/frontier-crdt-sync`, or an editor binding when collaborative transport is needed.

- npm: [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext)
- source: [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- core: [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- CRDT: [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt)
- license: MIT

## Related Packages

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): core JSON diff/apply primitives.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): native CRDT document and text layer that can carry rich text documents above plain text.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): sync/repo/provider layer for collaborative Frontier documents.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket transport for synced CRDT documents.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store adapters for Frontier state/cache/CRDT surfaces.

Package source repositories:

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
  createRichTextDocument,
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
```

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
- stable cursor/selection mapping through local Deltas.

It intentionally does not own:

- CRDT actor/sequence IDs;
- network sync, presence, or awareness;
- storage providers;
- editor-specific DOM decorations;
- conflict resolution for concurrent rich text marks.

Those belong in `frontier-crdt`, `frontier-crdt-sync`, and editor binding packages.

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

Latest local package benchmark on Node v26.1.0, darwin arm64, 9 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| Create document, 4k text | 0.09 us | 0.25 us |
| Apply mixed Delta | 0.96 us | 1.64 us |
| Format range, 512 chars | 0.88 us | 1.11 us |
| Insert marked text | 0.69 us | 0.78 us |
| Export Delta | 0.13 us | 0.19 us |
| Plain text flatten | 0.09 us | 0.16 us |
| Transform selection | 0.57 us | 0.77 us |

These are Frontier-only package measurements, not competitor comparisons.

## License

MIT. See [LICENSE](./LICENSE).
