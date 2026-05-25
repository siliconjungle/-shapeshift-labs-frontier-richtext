# Frontier Rich Text

Reserved package name for the future Frontier editor-facing rich text layer.

This package is not ready for production use. It exists so the package and repository names are reserved while the rich text handle, marks, embeds, block model, Delta import/export, cursors, selections, and editor binding boundaries are finalized.

- npm: [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext)
- source: [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- CRDT package: [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt)
- sync package: [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync)
- license: MIT

## Intended Scope

When this package graduates from placeholder status, it is expected to contain:

- rich text handles over Frontier CRDT text;
- formatting marks, embeds, block attributes, and block markers;
- Delta import/export and span traversal helpers;
- stable rich-text cursors and selections;
- editor-facing bindings and adapter contracts.

It should depend on the CRDT layer once that package is ready. It should stay separate from the small JSON diff/apply core, patch codecs, app-state subscriptions, and storage/sync providers unless an editor binding explicitly needs them.

## Current Status

Use [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier) for the stable JSON diff/apply core and [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec) for patch transport codecs.

The rich text package is reserved only. No runtime API is exported yet.

## Package Family

Published or active packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec)
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation)

Reserved future packages:

- `@shapeshift-labs/frontier-engine`
- `@shapeshift-labs/frontier-state`
- `@shapeshift-labs/frontier-crdt`
- `@shapeshift-labs/frontier-crdt-sync`
- `@shapeshift-labs/frontier-logging`
- `@shapeshift-labs/frontier-state-cache`
- `@shapeshift-labs/frontier-event-log`
- `@shapeshift-labs/frontier-schema`

## License

MIT. See [LICENSE](./LICENSE).
