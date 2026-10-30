// oxlint-disable-next-line typescript/triple-slash-reference -- ambient *.css module for the side-effect CSS import below.
/// <reference path="./a11y/a11y-env.d.ts" />
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { userEvent } from './support/user-event.js';

// `.l-table` ships no JavaScript: sort, selection and jump-to are platform states
// (`aria-sort`, `:checked`, `:target`). What is under test is what a user sees and
// can reach once the stylesheet is applied — so the real stylesheet is loaded, and
// assertions read the painted result.
import '../../src/css/preset.css';
import '../../src/css/elements/button.css';
import '../../src/css/elements/table/lines.css';
import '../../src/css/elements/table/grid.css';

let host: HTMLElement;

afterEach(() => {
  host?.remove();
  history.replaceState(null, '', location.pathname + location.search);
});

function mount(html: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

const ROWS = `
  <tr id="row-9f1c">
    <td data-select><input type="checkbox" name="product" value="9f1c" aria-label="Select SKU-1042"></td>
    <th scope="row"><a href="#opened-9f1c" data-row-link>SKU-1042</a></th>
    <td class="item">Desk lamp</td>
    <td data-type="number">4 210</td>
    <td data-sticky="end"><button type="button">Actions for SKU-1042</button></td>
  </tr>
  <tr id="row-1a2b">
    <td data-select><input type="checkbox" name="product" value="1a2b" aria-label="Select SKU-2087"></td>
    <th scope="row"><a href="#opened-1a2b" data-row-link>SKU-2087</a></th>
    <td class="item">Office chair</td>
    <td data-type="number">12 004</td>
    <td data-sticky="end"><button type="button">Actions for SKU-2087</button></td>
  </tr>`;

const UNLINKED = ROWS.replace(/ data-row-link/g, '');

const TABLE = (attrs = '', rows = ROWS) => `
  <table class="l-table" ${attrs}>
    <caption>Products</caption>
    <thead>
      <tr>
        <th scope="col" data-select><input type="checkbox" aria-label="Select all rows on this page"></th>
        <th scope="col" aria-sort="ascending"><button type="button">SKU</button></th>
        <th scope="col"><button type="button">Name</button></th>
        <th scope="col" data-type="number"><button type="button">In stock</button></th>
        <th scope="col" data-sticky="end" aria-label="Actions"></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

const SCROLLER = (table: string, size = 'inline-size: 260px; block-size: 90px') =>
  `<div class="scroller" style="overflow: auto; ${size}">${table}</div>`;

const cell = <T extends HTMLElement = HTMLElement>(selector: string) =>
  host.querySelector<T>(selector)!;
const style = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const height = (el: Element) => Math.round(el.getBoundingClientRect().height);
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

function hitAt(el: Element, at: 'center' | 'corner' = 'center') {
  const r = el.getBoundingClientRect();
  return at === 'center'
    ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    : document.elementFromPoint(r.left + 2, r.top + 2);
}

function textRect(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect();
}

describe('A plain table reads as a data table', () => {
  it('keeps its caption, column headers and row headers', async () => {
    mount(TABLE());

    expect(await page.getByRole('table', { name: 'Products' }).query()).toBeTruthy();
    expect(
      await page.getByRole('columnheader', { name: 'Name', exact: true }).query(),
    ).toBeTruthy();
    expect(await page.getByRole('rowheader', { name: 'SKU-1042' }).query()).toBeTruthy();
  });

  it('starts the caption at the inline start, like the cells', () => {
    mount(TABLE());

    expect(style(host.querySelector('caption')!).textAlign).toBe('start');
  });

  it('reads a row header as data, not as a column title', () => {
    mount(TABLE());

    expect(style(cell('tbody th')).fontWeight).toBe(style(cell('tbody .item')).fontWeight);
  });

  it('leaves a table nested in a cell to its own styles', () => {
    mount(`<table class="l-table"><tbody><tr><td>
      <table><tbody><tr><td class="inner">nested</td></tr></tbody></table>
    </td></tr></tbody></table>`);

    expect(style(cell('.inner')).borderBottomWidth).toBe('0px');
  });
});

describe('Rows follow the control size scale', () => {
  const ONE_ROW = (attrs = '', content = 'SKU-1042') =>
    `<table class="l-table" ${attrs}><tbody><tr><td>${content}</td><td>2b</td></tr></tbody></table>`;

  it('gives each size its own minimum row height', () => {
    mount(`${ONE_ROW('data-size="sm"')}${ONE_ROW()}${ONE_ROW('data-size="lg"')}`);

    const [sm, md, lg] = [...host.querySelectorAll('td:first-child')].map(height);
    expect(sm).toBe(40);
    expect(md).toBe(44);
    expect(lg).toBe(48);
  });

  it('holds a button of the same size without growing', () => {
    mount(
      ONE_ROW(
        'data-size="sm"',
        '<button type="button" class="l-button" data-size="sm">Open</button>',
      ),
    );

    expect(height(cell('td'))).toBe(40);
  });

  it('lets content taller than the row grow it', () => {
    mount(ONE_ROW('data-size="sm"', 'SKU-1042<br>second line<br>third line'));

    expect(height(cell('td'))).toBeGreaterThan(40);
  });
});

describe('Numbers line up', () => {
  it('aligns numeric cells to the inline end with tabular figures', () => {
    mount(TABLE());

    const number = cell('tbody [data-type="number"]');
    expect(style(number).textAlign).toBe('end');
    expect(style(number).fontVariantNumeric).toBe('tabular-nums');
  });

  it('puts numbers on the left in a right-to-left table', () => {
    mount(`<div dir="rtl">${TABLE()}</div>`);

    const number = cell('tbody [data-type="number"]');
    const text = textRect(number);
    const box = number.getBoundingClientRect();
    expect(text.left - box.left).toBeLessThan(box.right - text.right);
  });

  it('keeps a numeric header label flush with its numbers, the sort glyph before it', () => {
    mount(TABLE());

    const header = cell('thead [data-type="number"]');
    const label = textRect(header.querySelector('button')!);
    const box = header.getBoundingClientRect();
    const padding = Number.parseFloat(style(header).paddingRight);
    expect(Math.round(box.right - padding - label.right)).toBe(0);
  });
});

describe('Row states come from the platform', () => {
  it('tints a row while its checkbox is checked', async () => {
    mount(TABLE());
    const item = cell('#row-9f1c .item');
    const before = style(item).backgroundImage;

    await userEvent.click(page.getByRole('checkbox', { name: 'Select SKU-1042' }));

    expect(style(item).backgroundImage).not.toBe(before);
    expect(style(cell('#row-1a2b .item')).backgroundImage).toBe(before);
  });

  it('tints a row under the pointer only when the row opens something', async () => {
    mount(`${TABLE()}${TABLE('', UNLINKED.replace(/row-/g, 'static-'))}`);
    const linked = cell('#row-9f1c .item');
    const unlinked = cell('#static-9f1c .item');
    const plain = style(unlinked).backgroundImage;

    await userEvent.hover(unlinked);
    expect(style(unlinked).backgroundImage).toBe(plain);

    // force: the row link's overlay covers the cell, which is what a pointer meets.
    await userEvent.hover(linked, { force: true });
    expect(style(linked).backgroundImage).not.toBe(plain);
  });

  it('keeps the selected tint under the pointer', async () => {
    mount(TABLE());
    const item = cell('#row-9f1c .item');

    await userEvent.click(page.getByRole('checkbox', { name: 'Select SKU-1042' }));
    await userEvent.hover(host.querySelector('caption')!);
    const selected = style(item).backgroundImage;
    await userEvent.hover(item, { force: true });

    expect(style(item).backgroundImage).toBe(selected);
  });

  it('stripes every other row when --stripe-color is set', () => {
    mount(
      `${TABLE()}${TABLE('style="--stripe-color: var(--l-color-bg-state-hover)"').replace(/row-/g, 'striped-')}`,
    );

    expect(style(cell('#row-1a2b .item')).backgroundImage).toBe(
      style(cell('#row-9f1c .item')).backgroundImage,
    );
    expect(style(cell('#striped-1a2b .item')).backgroundImage).not.toBe(
      style(cell('#striped-9f1c .item')).backgroundImage,
    );
  });

  it('marks the row a URL fragment points to', async () => {
    mount(TABLE());
    const first = cell('#row-1a2b > :first-child');
    const before = style(first).backgroundImage;

    location.hash = '#row-1a2b';
    await frame();

    expect(style(first).backgroundImage).not.toBe(before);
  });

  it('keeps that mark on a sticky first cell in a table that scrolls sideways', async () => {
    const rows = UNLINKED.replace(/<td data-select>/g, '<td data-select data-sticky="start">');
    mount(
      SCROLLER(
        TABLE('', rows).replace(
          '<th scope="col" data-select>',
          '<th scope="col" data-select data-sticky="start">',
        ),
      ),
    );
    const first = cell('#row-1a2b > :first-child');
    const sibling = cell('#row-9f1c > :first-child');

    location.hash = '#row-1a2b';
    await frame();
    await frame();

    // Same column, same sticky treatment: only the targeted row may differ.
    const paint = (el: Element) => `${style(el).backgroundImage} | ${style(el).boxShadow}`;
    expect(paint(first)).not.toBe(paint(sibling));
  });

  it('lands the row a fragment points to below the sticky header', async () => {
    const many = Array.from({ length: 12 }, (_, i) => UNLINKED.replace(/row-/g, `r${i}-`)).join('');
    mount(SCROLLER(TABLE('', many), 'inline-size: 600px; block-size: 160px'));
    const scroller = cell('.scroller');

    location.hash = '#r9-1a2b';
    await frame();
    await frame();

    const header = cell('thead th:nth-child(3)').getBoundingClientRect();
    const row = cell('#r9-1a2b').getBoundingClientRect();
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(Math.round(row.top)).toBeGreaterThanOrEqual(Math.round(header.bottom));
  });

  it('centres an empty-state row', () => {
    mount(TABLE('', '<tr><td colspan="5">No product matches these filters.</td></tr>'));

    expect(style(cell('tbody td')).textAlign).toBe('center');
  });
});

describe('Row groups and totals are set apart', () => {
  const GROUPED = `
    <table class="l-table">
      <thead><tr><th scope="col">Warehouse</th><th scope="col" data-type="number">Units</th></tr></thead>
      <tbody class="north"><tr><th scope="row">North</th><td data-type="number">48,200</td></tr></tbody>
      <tbody class="south"><tr><th scope="row">South</th><td data-type="number">21,350</td></tr></tbody>
      <tfoot><tr><th scope="row">Total</th><td data-type="number">69,550</td></tr></tfoot>
    </table>`;

  it('separates one row group from the next', () => {
    mount(GROUPED);

    expect(style(cell('.north th')).borderBottomWidth).toBe('1px');
  });

  it('draws one rule above the totals, not two', () => {
    mount(GROUPED);

    expect(style(cell('.south th')).borderBottomWidth).toBe('0px');
    expect(style(cell('tfoot th')).borderTopWidth).toBe('1px');
    expect(style(cell('tfoot th')).borderBottomWidth).toBe('0px');
  });
});

describe('Sortable headers show their state', () => {
  it('shows the sorted column in full and the others in a quieter glyph', () => {
    mount(TABLE());

    const sorted = style(cell('th[aria-sort] > button'), '::after').backgroundColor;
    const other = style(
      page.getByRole('button', { name: 'Name', exact: true }).element(),
      '::after',
    );
    expect(other.backgroundColor).not.toBe(sorted);
    expect(other.opacity).toBe('1');
  });

  it('styles a header link the same way, for pages that sort on the server', () => {
    mount(TABLE().replace('<button type="button">Name</button>', '<a href="?sort=name">Name</a>'));

    const link = page.getByRole('link', { name: 'Name', exact: true }).element();
    expect(style(link, '::after').content).not.toBe('none');
    expect(style(link).textDecorationLine).toBe('none');
  });

  it('draws the Luxen focus ring on a header button reached by keyboard (WCAG 2.4.7 / RGAA 10.7)', async () => {
    mount(TABLE());

    await userEvent.click(page.getByRole('checkbox', { name: 'Select all rows on this page' }));
    await userEvent.tab();

    const button = page.getByRole('button', { name: 'SKU', exact: true }).element();
    expect(document.activeElement).toBe(button);
    expect(style(button).outlineStyle).toBe('solid');
  });
});

describe('A row link opens the record from anywhere in the row', () => {
  it('covers a plain cell far from the link', () => {
    mount(TABLE());

    expect(hitAt(cell('#row-9f1c .item'))?.closest('a')?.hasAttribute('data-row-link')).toBe(true);
  });

  it('follows the link on a click in a plain cell', async () => {
    mount(TABLE());

    // force: the overlay covering the cell is the point under test.
    await userEvent.click(cell('#row-9f1c .item'), { force: true });

    expect(location.hash).toBe('#opened-9f1c');
  });

  it('keeps the checkbox and the row actions clickable above the link', async () => {
    mount(TABLE());

    await userEvent.click(page.getByRole('checkbox', { name: 'Select SKU-1042' }));
    await userEvent.click(page.getByRole('button', { name: 'Actions for SKU-1042' }));

    expect(location.hash).toBe('');
    expect(cell<HTMLInputElement>('#row-9f1c input').checked).toBe(true);
  });

  it('does not navigate on a click that just misses the checkbox', () => {
    mount(TABLE());

    expect(hitAt(cell('#row-9f1c [data-select]'), 'corner')?.closest('a')).toBeNull();
  });

  it('is a real link for keyboard users, with a visible focus ring (WCAG 2.1.1, 2.4.7 / RGAA 7.3, 10.7)', async () => {
    mount(TABLE());

    await userEvent.click(page.getByRole('checkbox', { name: 'Select SKU-1042' }));
    await userEvent.tab();
    const link = page.getByRole('link', { name: 'SKU-1042' }).element();
    expect(document.activeElement).toBe(link);
    expect(style(link).outlineStyle).toBe('solid');

    await userEvent.keyboard('{Enter}');
    expect(location.hash).toBe('#opened-9f1c');
  });

  it('leaves rows without a row link alone', () => {
    mount(TABLE('', UNLINKED));

    expect(style(cell('#row-9f1c')).position).toBe('static');
  });
});

describe('Sticky parts stay in view', () => {
  it('keeps the header at the top of its scroll container', async () => {
    mount(SCROLLER(TABLE('', ROWS + ROWS.replace(/row-/g, 'more-'))));
    const scroller = cell('.scroller');

    scroller.scrollTop = 40;
    await frame();

    expect(Math.round(cell('thead th:nth-child(3)').getBoundingClientRect().top)).toBe(
      Math.round(scroller.getBoundingClientRect().top),
    );
  });

  it('keeps an end column at the inline end while scrolling sideways', async () => {
    mount(SCROLLER(TABLE()));
    const scroller = cell('.scroller');

    scroller.scrollLeft = 0;
    await frame();

    const end = cell('#row-9f1c [data-sticky="end"]');
    expect(Math.round(end.getBoundingClientRect().right)).toBeLessThanOrEqual(
      Math.round(scroller.getBoundingClientRect().right),
    );
    expect(style(end).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('keeps a start column above the controls scrolling under it', async () => {
    const rows = ROWS.replace(/<td data-select>/g, '<td data-select data-sticky="start">').replace(
      '<td class="item">Desk lamp</td>',
      '<td class="item"><button type="button">Edit Desk lamp</button></td>',
    );
    mount(SCROLLER(TABLE('', rows), 'inline-size: 200px; block-size: 200px'));
    const scroller = cell('.scroller');
    const sticky = cell('#row-9f1c [data-sticky="start"]');

    // Scroll a control of the linked row under the sticky selection column.
    const link = page.getByRole('button', { name: 'Edit Desk lamp' }).element();
    scroller.scrollLeft = link.getBoundingClientRect().left - sticky.getBoundingClientRect().left;
    await frame();

    const s = sticky.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    // The link really is under the sticky column now…
    expect(l.left).toBeLessThan(s.right);
    expect(l.right).toBeGreaterThan(s.left);
    // …and a click there lands on the sticky cell, not on the link.
    const x = Math.max(s.left, l.left) + 1;
    const hit = document.elementFromPoint(x, l.top + l.height / 2);
    expect(hit === sticky || sticky.contains(hit)).toBe(true);
  });

  // Scroll-driven animations are decoration: where they are missing there is no
  // shadow at all, which is the fallback, so there is nothing to assert there.
  it.skipIf(!CSS.supports('animation-timeline: scroll()'))(
    'casts a shadow from a start column once content scrolls under it',
    async () => {
      mount(
        SCROLLER(
          TABLE('', UNLINKED.replace(/<th scope="row">/g, '<th scope="row" data-sticky="start">')),
        ),
      );
      const scroller = cell('.scroller');
      const start = cell('#row-9f1c [data-sticky="start"]');

      scroller.scrollLeft = 0;
      await frame();
      const atRest = style(start).boxShadow;

      scroller.scrollLeft = 60;
      await frame();
      await frame();
      // At rest the animation sits on its `from` keyframe: no shadow, or a fully
      // transparent one, depending on how the engine serialises the interpolation.
      expect(atRest).toMatch(/^none$|\/ 0\)/);
      expect(style(start).boxShadow).not.toBe(atRest);
    },
  );
});

describe('Appearances', () => {
  const PLAIN = (attrs = '') => `
    <table class="l-table" ${attrs}>
      <thead><tr><th scope="col" class="h1">SKU</th><th scope="col" class="h2">Name</th></tr></thead>
      <tbody>
        <tr><th scope="row" class="a1">SKU-1</th><td class="a2">Desk lamp</td></tr>
        <tr><th scope="row" class="b1">SKU-2</th><td class="b2">Office chair</td></tr>
      </tbody>
    </table>`;

  it('draws rules between rows only by default (lines)', () => {
    mount(PLAIN());

    expect(style(cell('.a1')).borderBottomWidth).toBe('1px');
    expect(style(cell('.a1')).borderRightWidth).toBe('0px');
    expect(style(cell('.b1')).borderBottomWidth).toBe('0px');
    expect(style(host.querySelector('table')!).borderTopWidth).toBe('0px');
  });

  it('draws every cell edge and an outer border with data-appearance="grid"', () => {
    mount(PLAIN('data-appearance="grid"'));

    expect(style(cell('.a1')).borderRightWidth).toBe('1px');
    expect(style(cell('.a2')).borderRightWidth).toBe('0px');
    expect(style(cell('.a1')).borderBottomWidth).toBe('1px');
    expect(style(cell('.b2')).borderBottomWidth).toBe('0px');
    expect(style(host.querySelector('table')!).borderTopWidth).toBe('1px');
  });

  it('keeps the grid header opaque and rounds its corner cells', () => {
    mount(PLAIN('data-appearance="grid"'));

    expect(style(cell('.h1')).backgroundColor).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(style(cell('.h1')).borderTopLeftRadius).not.toBe('0px');
    expect(style(cell('.b2')).borderBottomRightRadius).not.toBe('0px');
  });

  it('draws a single rule above the totals in a grid', () => {
    mount(`
      <table class="l-table" data-appearance="grid">
        <thead><tr><th scope="col">SKU</th><th scope="col">Stock</th></tr></thead>
        <tbody><tr><th scope="row" class="last">SKU-1</th><td>3</td></tr></tbody>
        <tfoot><tr><th scope="row" class="total">Total</th><td>3</td></tr></tfoot>
      </table>`);

    expect(style(cell('.last')).borderBottomWidth).toBe('0px');
    expect(style(cell('.total')).borderTopWidth).toBe('1px');
  });

  it('applies each appearance only where it is asked, with both imported', () => {
    mount(`${PLAIN()}${PLAIN('data-appearance="grid"').replace(/class="a1"/, 'class="g1"')}`);

    expect(style(cell('.a1')).borderRightWidth).toBe('0px');
    expect(style(cell('.g1')).borderRightWidth).toBe('1px');
  });
});
