// oxlint-disable-next-line typescript/triple-slash-reference -- ambient *.css module for the side-effect CSS import below.
/// <reference path="./a11y/a11y-env.d.ts" />
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { userEvent } from './support/user-event.js';

// `.l-table` ships no JavaScript: the sort state is a platform state
// (`aria-sort`). What is under test is what a user sees and can reach
// once the stylesheet is applied — so the real stylesheet is loaded, and
// assertions read the painted result.
import '../../src/css/preset.css';
import '../../src/css/elements/button.css';
import '../../src/css/elements/table.css';

let host: HTMLElement;

afterEach(() => host?.remove());

function mount(html: string): HTMLElement {
  host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

const ROWS = `
  <tr id="row-9f1c">
    <th scope="row">SKU-1042</th>
    <td class="item">Desk lamp</td>
    <td data-align="end">4 210</td>
  </tr>
  <tr id="row-1a2b">
    <th scope="row">SKU-2087</th>
    <td class="item">Office chair</td>
    <td data-align="end">12 004</td>
  </tr>`;

const TABLE = (attrs = '', rows = ROWS) => `
  <table class="l-table" ${attrs}>
    <caption>Products</caption>
    <thead>
      <tr>
        <th scope="col" aria-sort="ascending"><button type="button">SKU</button></th>
        <th scope="col"><button type="button">Name</button></th>
        <th scope="col" data-align="end"><button type="button">In stock</button></th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

const cell = <T extends HTMLElement = HTMLElement>(selector: string) =>
  host.querySelector<T>(selector)!;
const style = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const height = (el: Element) => Math.round(el.getBoundingClientRect().height);
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

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

  it('paints the table on the surface', () => {
    mount(TABLE());

    expect(style(host.querySelector('table')!).backgroundColor).not.toMatch(
      /rgba\(0, 0, 0, 0\)|transparent/,
    );
  });

  it('reads a row header as data, not as a column title', () => {
    mount(TABLE());

    expect(style(cell('tbody th')).fontWeight).toBe(style(cell('tbody .item')).fontWeight);
  });

  it('draws a rule between rows, not after the last one', () => {
    mount(TABLE());

    expect(style(cell('#row-9f1c .item')).borderBottomWidth).toBe('1px');
    expect(style(cell('#row-9f1c .item')).borderRightWidth).toBe('0px');
    expect(style(cell('#row-1a2b .item')).borderBottomWidth).toBe('0px');
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

describe('Columns align as asked, and figures line up', () => {
  it('aligns a column to the end or the centre with data-align', () => {
    mount(
      TABLE().replace(
        '<td class="item">Desk lamp</td>',
        '<td class="item" data-align="center">Desk lamp</td>',
      ),
    );

    expect(style(cell('tbody [data-align="end"]')).textAlign).toBe('end');
    expect(style(cell('tbody [data-align="center"]')).textAlign).toBe('center');
    expect(style(cell('#row-1a2b .item')).textAlign).toBe('start');
  });

  it('sets digits in tabular figures across the table', () => {
    mount(TABLE());

    expect(style(cell('tbody .item')).fontVariantNumeric).toBe('tabular-nums');
  });

  it('puts end-aligned figures on the left in a right-to-left table', () => {
    mount(`<div dir="rtl">${TABLE()}</div>`);

    const number = cell('tbody [data-align="end"]');
    const text = textRect(number);
    const box = number.getBoundingClientRect();
    expect(text.left - box.left).toBeLessThan(box.right - text.right);
  });

  it('keeps an end-aligned header label flush with its figures, the sort glyph before it', () => {
    mount(TABLE());

    const header = cell('thead [data-align="end"]');
    const label = textRect(header.querySelector('button')!);
    const box = header.getBoundingClientRect();
    const padding = Number.parseFloat(style(header).paddingRight);
    expect(Math.round(box.right - padding - label.right)).toBe(0);
  });
});

describe('The header stays in view', () => {
  it('sticks to the top of its scroll container, opaque over the rows', async () => {
    mount(
      `<div class="scroller" style="overflow: auto; block-size: 90px">${TABLE('', ROWS + ROWS.replace(/row-/g, 'more-'))}</div>`,
    );
    const scroller = cell('.scroller');
    const header = cell('thead th:nth-child(3)');

    scroller.scrollTop = 40;
    await frame();

    expect(Math.round(header.getBoundingClientRect().top)).toBe(
      Math.round(scroller.getBoundingClientRect().top),
    );
    expect(style(header).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});

describe('Row groups and totals are set apart', () => {
  const GROUPED = `
    <table class="l-table">
      <thead><tr><th scope="col">Warehouse</th><th scope="col" data-align="end">Units</th></tr></thead>
      <tbody class="north"><tr><th scope="row">North</th><td data-align="end">48,200</td></tr></tbody>
      <tbody class="south"><tr><th scope="row">South</th><td data-align="end">21,350</td></tr></tbody>
      <tfoot><tr><th scope="row">Total</th><td data-align="end">69,550</td></tr></tfoot>
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

  it('leaves an .l-button in a header to its own look, with no sort glyph', () => {
    mount(
      TABLE().replace(
        '<button type="button">Name</button>',
        '<button type="button" class="l-button" data-size="sm">Columns</button>',
      ),
    );

    const button = page.getByRole('button', { name: 'Columns' }).element();
    expect(style(button).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style(button, '::after').maskImage).toBe('none');
  });

  it('dims the button of a column that cannot be sorted', () => {
    mount(
      TABLE().replace(
        '<button type="button">Name</button>',
        '<button type="button" disabled>Name</button>',
      ),
    );

    const button = page.getByRole('button', { name: 'Name', exact: true }).element();
    expect(style(button).cursor).toBe('not-allowed');
    expect(style(button).opacity).toBe('0.4');
  });

  it('draws the Luxen focus ring on a header button reached by keyboard (WCAG 2.4.7 / RGAA 10.7)', async () => {
    mount(TABLE());

    await userEvent.tab();

    const button = page.getByRole('button', { name: 'SKU', exact: true }).element();
    expect(document.activeElement).toBe(button);
    expect(style(button).outlineStyle).toBe('solid');
  });
});
