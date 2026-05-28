# Frontier Rich Text

Rich text Delta, marks, embeds, ranges, and cursor helpers for Frontier local editor integrations.

This package is the local rich text utility layer in the Frontier package family. It does not implement editor bindings, presence, network sync, or CRDT merge; use it with `@shapeshift-labs/frontier-crdt`, `@shapeshift-labs/frontier-crdt-sync`, `@shapeshift-labs/frontier-react`, or application editor code when collaborative transport or UI bindings are needed.

- npm: [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext)
- source: [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- core: [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- CRDT: [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt)
- license: MIT

## Related Packages

The published Frontier package family is generated from one shared package catalog so READMEs stay in sync across packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): Core JSON diff/apply, compact patch tuples, JSON Pointer, equality, clone, validation, Unicode helpers.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): Shared query-key, selector path, condition, entity identity, and table-shape primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): Patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): Stateful planned diff engine, adaptive profiles, schema plans, and engine-level history helpers.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): Patch-routed app-state subscriptions, owned commits, maintained views, and path mapping.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): Normalized query-result cache with entity/query watchers, persistence, change logs, optimistic layers, and mutation bridge.
- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): JSON Schema validation, Frontier profile generation, CloudEvent envelopes, and query/table schema helpers.
- [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log): Bounded event logs, replay cursors, consumer acknowledgements, keyed compaction, checkpoints, and Frontier patch event records.
- [`@shapeshift-labs/frontier-scheduler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scheduler): Deterministic work scheduling, lanes, cancellation, backpressure, frame policies, replay snapshots, and work graphs.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): Opt-in structured logging, browser telemetry, file sinks, exporters, benchmark traces, and Frontier patch/update summaries.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): Explicit mutation and selector plans compiled to Frontier patches or CRDT operations.
- [`@shapeshift-labs/frontier-virtual`](https://www.npmjs.com/package/@shapeshift-labs/frontier-virtual): DOM-neutral virtualization, layout providers, range materialization, grids, spatial culling, frustum culling, and serializable layout state.
- [`@shapeshift-labs/frontier-dom`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dom): Patch-native DOM and host renderer bindings, manifest hydration, JSX runtime/compiler helpers, SSR, devtools, and logging bridges.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): Native CRDT documents, update tooling, awareness, branches, conflict introspection, version frames, and undo.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): CRDT sync endpoints, repo/storage/provider contracts, document URLs, local networks, model checking, forensics, and text binding contracts.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket client/server transports for Frontier CRDT sync providers.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store hooks and adapters for Frontier state, cache, and CRDT surfaces.
- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): Shared realtime command, tick, snapshot, prediction, reconciliation, interpolation, rollback, message, and delta primitives.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): Authoritative realtime room, tick, command validation, rate-limit, session, and snapshot-history runtime.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket client, wire, and Node room-server transport for Frontier realtime.
- [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game): Game-facing entity, component, player, room, ownership, spatial interest, rollback, physics, and replication helpers above realtime.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- [`siliconjungle/-shapeshift-labs-frontier-scheduler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scheduler)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-virtual`](https://github.com/siliconjungle/-shapeshift-labs-frontier-virtual)
- [`siliconjungle/-shapeshift-labs-frontier-dom`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dom)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- [`siliconjungle/-shapeshift-labs-frontier-realtime`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-server)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)

## Install

```sh
npm install @shapeshift-labs/frontier-richtext
```

## Usage

```js
import {
  applyRichTextDelta,
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

console.log(projectStableRichTextDelta(next));
```

## Composition With CRDT

Rich text is split deliberately across three layers:

| Layer | Owns | Does not own |
| --- | --- | --- |
| `@shapeshift-labs/frontier-richtext` | Local Delta normalization/application, range formatting, embed slicing, cursor/selection mapping, annotation policy, and stable Delta projection. | CRDT operation merge, network transport, durable storage, React rendering, editor-specific DOM decorations, presence, awareness, or editor binding lifecycle. |
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

Applies Delta-style `insert`, `retain`, and `delete` operations to a document. Retain attributes apply marks; `null` attribute values remove marks.

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
- deterministic comment/link annotation policy;
- stable Delta projection for rendering, logging, and cache keys.

It intentionally does not own:

- CRDT operation merge;
- network sync or awareness transport;
- presence envelopes or remote selection causality;
- storage providers;
- editor-specific bindings, DOM decorations, or framework plugins;
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
| annotation conflict policy | 0.47 us | 0.65 us |

These are Frontier-only package measurements, not competitor comparisons.

## License

MIT. See [LICENSE](./LICENSE).
