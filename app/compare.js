// DealHunt price comparison: groups the deals by product name and renders one
// table per product that appears at two or more stores, cheapest store first
// in the row order, marked on the table.

import { escapeHtml, money } from './render.js';

export function compareGroups(deals, productNames) {
  return productNames
    .map((name) => {
      const rows = deals
        .filter((d) => d.product === name)
        .sort((a, b) => a.sale - b.sale);
      return { name, rows };
    })
    .filter((group) => group.rows.length >= 2);
}

export function compareHtml(deals, productNames) {
  const groups = compareGroups(deals, productNames);
  return groups
    .map((group) => {
      const cheapest = group.rows[0];
      const priciest = group.rows[group.rows.length - 1];
      const spread = Math.round((priciest.sale - cheapest.sale) * 100) / 100;
      const rows = group.rows
        .map((deal, index) => `
      <tr${index === 0 ? ' class="cheapest"' : ''}>
        <td><strong>${escapeHtml(deal.store)}</strong>${index === 0 ? '<span class="lowest-tag">LOWEST PRICE</span>' : ''}</td>
        <td class="num"><strong>${money(deal.sale)}</strong></td>
        <td class="num"><span class="was">${money(deal.usual)}</span></td>
        <td class="num">−${deal.discount}%</td>
        <td><a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} ↗</a></td>
      </tr>`)
        .join('');
      return `
<section class="compare-block">
  <h2>${escapeHtml(group.name)}</h2>
  <p class="best-line">Best price <strong>${money(cheapest.sale)} at ${escapeHtml(cheapest.store)}</strong> — ${money(spread)} less than the highest price for the same item.</p>
  <div class="table-scroll">
  <table class="compare">
    <thead>
      <tr><th>Store</th><th class="num">Sale price</th><th class="num">Usual price</th><th class="num">Discount</th><th>Link</th></tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
  </div>
</section>`;
    })
    .join('\n');
}
