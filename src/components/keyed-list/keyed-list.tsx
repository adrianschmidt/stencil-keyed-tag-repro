import { Component, Prop, h } from '@stencil/core';

export interface Item {
  id: number;
  kind: 'text' | 'box';
  label: string;
}

/**
 * Renders a keyed list where each item is either a <p> or a <div>,
 * keyed by `item.id` only. The same id can therefore be a <p> in one
 * render and a <div> in the next.
 */
@Component({
  tag: 'keyed-list',
  shadow: true,
})
export class KeyedList {
  @Prop() items: Item[] = [];

  render() {
    return (
      <ul>
        {this.items.map((item) =>
          item.kind === 'text' ? (
            <p key={item.id} id={`item-${item.id}`}>
              {item.label}
            </p>
          ) : (
            <div key={item.id} id={`item-${item.id}`}>
              {item.label}
            </div>
          ),
        )}
      </ul>
    );
  }
}
