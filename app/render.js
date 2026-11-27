// DealHunt rendering: turns deal objects into the HTML shoppers see. No
// framework, no templating library — plain strings, with every value that
// came from data escaped before it reaches the page.

export function money(amount) {
  const rounded = Math.round(amount * 100) / 100;
  return '$' + rounded.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2, maximumFractionDigits: 2 });
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function verdictClass(verdict) {
  if (verdict === 'NEW LOW') return 'new-low';
  if (verdict === 'STRONG DEAL') return 'strong-deal';
  return 'routine-sale';
}

export function dealCard(deal, hero = false) {
  return `
<article class="deal-card${hero ? ' hero-card' : ''}">
  <div class="deal-top">
    <span class="store-chip">${escapeHtml(deal.store)}</span>
    <span class="category">${escapeHtml(deal.category)}</span>
  </div>
  <h3 class="deal-name">${escapeHtml(deal.product)}</h3>
  <div class="price-row">
    <span class="sale-price">${money(deal.sale)}</span>
    <span class="usual-price">${money(deal.usual)}</span>
    <span class="discount-badge">−${deal.discount}%</span>
  </div>
  <p class="save-line">You save <strong>${money(deal.save)}</strong> vs the usual price</p>
  <span class="verdict ${verdictClass(deal.verdict)}">${escapeHtml(deal.verdict)}</span>
  <p class="evidence">${escapeHtml(deal.evidence)}</p>
  <div class="deal-foot">
    <a class="store-btn" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} ↗</a>
    <p class="checked-line">Checked ${escapeHtml(deal.checkedAt)} · Source: <a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(deal.sourceName)}</a></p>
  </div>
</article>`;
}

export function dealGridHtml(deals) {
  if (deals.length === 0) {
    return `<p class="empty-note">No deals match those filters. Try widening the discount or clearing the search.</p>`;
  }
  return deals.map((d) => dealCard(d)).join('\n');
}

export function statsHtml(meta) {
  return `
<li><span class="num">${meta.dealCount}</span><span class="lbl">verified deals</span></li>
<li><span class="num">${meta.stores.length}</span><span class="lbl">stores compared</span></li>
<li><span class="num">${meta.avgDiscount}%</span><span class="lbl">average discount</span></li>
<li><span class="num">${money(meta.maxSave)}</span><span class="lbl">biggest single saving</span></li>`;
}

export function heroHtml(deals) {
  const best = deals
    .filter((d) => d.verdict === 'NEW LOW')
    .sort((a, b) => b.discount - a.discount || b.save - a.save)
    .slice(0, 6);
  return best.map((d) => dealCard(d, true)).join('\n');
}

export function resultCountHtml(shown, total) {
  if (shown === total) return `Showing all ${total} deals`;
  if (shown === 0) return `Showing 0 of ${total} deals <span class="empty-note">— no match for these filters.</span>`;
  return `Showing ${shown} of ${total} deals`;
}
