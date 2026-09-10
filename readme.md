# Stencil keyed-list tag-change reproduction

Minimal reproduction for a bug in Stencil's keyed child diff: when a keyed
child keeps its `key` but changes tag between renders, the list renders the
wrong children, and every render after that throws.

`src/components/keyed-list/keyed-list.tsx` renders `items` as a list where each
item is either a `<p>` or a `<div>`, keyed by `item.id`.

```
first:  [text 1, text 2, text 3, text 4, text 5]   (all <p>)
second: [text 1, text 3, box 4, text 5]            (4 is now a <div>)
```

Switching from `first` to `second` renders:

```
p#item-1  text 1
p#item-3  text 3
p#item-5  text 5   <- created in place of box 4
p#item-5  text 5
```

`box 4` never gets an element. The next render of the list throws
`Cannot read properties of null (reading 'parentNode')` and the DOM stops
updating.

## Run

```bash
npm install
npm test        # two failing browser tests (Chromium via Playwright)
npm start       # demo page: click "First", then "Second"
```

## Cause

In `updateChildren` (`src/runtime/vdom/vdom-render.ts`), the branch that handles
a key match with a different tag passes the index into the *old* children to
`createElm`, whose third argument is an index into the *new* children:

```ts
if (elmToMove.$tag$ !== newStartVnode.$tag$) {
  // the tag doesn't match so we'll need a new DOM element
  node = createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld);
```

So the element is built for `newCh[idxInOld]` (here `text 5`, which already has
an element) instead of `newCh[newStartIdx]` (`box 4`), which is left with no
`$elm$`. Changing `idxInOld` to `newStartIdx` in that call makes both tests pass.
