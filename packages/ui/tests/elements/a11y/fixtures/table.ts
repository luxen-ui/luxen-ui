import { defineA11yFixture } from '../../support/a11y-fixture.js';

// .l-table is CSS only, on a native <table>. The a11y-critical surfaces are the
// table's name (caption), column and row headers, the sort state on `aria-sort`,
// named row checkboxes, the stretched row link staying a real link, and contrast
// of header text, the quieter sort glyph and the empty-state row against the surface.
const HEAD = `
  <thead>
    <tr>
      <th scope="col" data-select><span class="l-visually-hidden">Selection</span></th>
      <th scope="col" aria-sort="ascending"><button type="button">SKU</button></th>
      <th scope="col"><button type="button">Name</button></th>
      <th scope="col" data-type="number">In stock</th>
      <th scope="col" data-sticky="end"><span class="l-visually-hidden">Actions</span></th>
    </tr>
  </thead>`;

const ROW = (id: string, sku: string, name: string, stock: string, checked = '') => `
  <tr id="row-${id}">
    <td data-select><input type="checkbox" class="l-checkbox" name="product" value="${id}" aria-label="Select ${sku}" ${checked}></td>
    <th scope="row"><a href="#product-${id}" data-row-link>${sku}</a></th>
    <td>${name}</td>
    <td data-type="number">${stock}</td>
    <td data-sticky="end"><button type="button" class="l-button" data-size="sm">Actions for ${sku}</button></td>
  </tr>`;

export default defineA11yFixture({
  name: 'table',
  states: {
    basic: `
      <table class="l-table">
        <caption>Products</caption>
        <thead>
          <tr>
            <th scope="col">SKU</th>
            <th scope="col">Name</th>
            <th scope="col" data-type="number">In stock</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">SKU-1042</th><td>Desk lamp</td><td data-type="number">4,210</td></tr>
          <tr><th scope="row">SKU-2087</th><td>Office chair</td><td data-type="number">12,004</td></tr>
        </tbody>
      </table>`,
    interactive: `
      <table class="l-table" style="--stripe-color: var(--l-color-bg-state-hover)">
        <caption>Products</caption>
        ${HEAD}
        <tbody>
          ${ROW('9f1c', 'SKU-1042', 'Desk lamp', '4,210', 'checked')}
          ${ROW('1a2b', 'SKU-2087', 'Office chair', '12,004')}
        </tbody>
      </table>`,
    grid: `
      <table class="l-table" data-appearance="grid">
        <caption>Products</caption>
        ${HEAD}
        <tbody>
          ${ROW('9f1c', 'SKU-1042', 'Desk lamp', '4,210')}
          ${ROW('1a2b', 'SKU-2087', 'Office chair', '12,004')}
        </tbody>
      </table>`,
    small: `
      <table class="l-table" data-size="sm" aria-label="Products">
        ${HEAD}
        <tbody>${ROW('9f1c', 'SKU-1042', 'Desk lamp', '4,210')}</tbody>
      </table>`,
    footer: `
      <table class="l-table">
        <caption>Stock by warehouse</caption>
        <thead>
          <tr><th scope="col">Warehouse</th><th scope="col" data-type="number">Units</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">North</th><td data-type="number">48,200</td></tr>
          <tr><th scope="row">South</th><td data-type="number">21,350</td></tr>
        </tbody>
        <tfoot>
          <tr><th scope="row">Total</th><td data-type="number">69,550</td></tr>
        </tfoot>
      </table>`,
    serverSorted: `
      <table class="l-table">
        <caption>Products</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort="descending"><a href="?sort=-sku">SKU</a></th>
            <th scope="col"><a href="?sort=name">Name</a></th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">SKU-1042</th><td>Desk lamp</td></tr>
        </tbody>
      </table>`,
    empty: `
      <table class="l-table">
        <caption>Products</caption>
        ${HEAD}
        <tbody><tr><td colspan="5">No product matches these filters.</td></tr></tbody>
      </table>`,
  },
});
