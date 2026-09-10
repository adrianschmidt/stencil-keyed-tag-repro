import { render, h, describe, it, expect } from '@stencil/vitest';
import type { Item } from './keyed-list';

const text = (id: number): Item => ({ id, kind: 'text', label: `text ${id}` });
const box = (id: number): Item => ({ id, kind: 'box', label: `box ${id}` });

const first: Item[] = [text(1), text(2), text(3), text(4), text(5)];
// Same ids, but 2 is gone and 4 is now a <div> instead of a <p>.
const second: Item[] = [text(1), text(3), box(4), text(5)];

function renderedItems(root: HTMLElement): string[] {
  return Array.from(root.shadowRoot!.querySelectorAll('p, div')).map(
    (el) => `${el.tagName.toLowerCase()}#${el.id}:${el.textContent}`,
  );
}

describe('keyed-list', () => {
  it('renders exactly the new items when a key changes tag', async () => {
    const { root, waitForChanges } = await render(<keyed-list items={first}></keyed-list>);
    const host = root as HTMLElement & { items: Item[] };

    host.items = second;
    await waitForChanges();

    expect(renderedItems(host)).toEqual([
      'p#item-1:text 1',
      'p#item-3:text 3',
      'div#item-4:box 4',
      'p#item-5:text 5',
    ]);
  });

  it('can still render after a key changed tag', async () => {
    const { root, waitForChanges } = await render(<keyed-list items={first}></keyed-list>);
    const host = root as HTMLElement & { items: Item[] };

    host.items = second;
    await waitForChanges();

    host.items = [...second, text(6)];
    await waitForChanges();

    expect(renderedItems(host)).toEqual([
      'p#item-1:text 1',
      'p#item-3:text 3',
      'div#item-4:box 4',
      'p#item-5:text 5',
      'p#item-6:text 6',
    ]);
  });
});
