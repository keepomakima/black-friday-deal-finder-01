// DealHunt startup: wires each page to the data. The home page renders the
// stats strip, the six best new-low deals and the live finder; the compare
// page renders the cross-store tables; the sources page lists the sources.
// window.__shotReady flips to true once the page has rendered, so a
// screenshot script knows when to capture.

import { DEALS, META } from './data.js';
import { dealGridHtml, heroHtml, resultCountHtml, statsHtml, escapeHtml } from './render.js';
import { applyFilters, filterStateFromUrl, sortDeals } from './filters.js';
import { compareHtml } from './compare.js';

const page = document.body.dataset.page;

function optionList(values, allLabel) {
  return [`<option value="All">${allLabel}</option>`, ...values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`)].join('');
}

function initHome() {
  document.getElementById('stats').innerHTML = statsHtml(META);
  document.getElementById('hero').innerHTML = heroHtml(DEALS);

  const q = document.getElementById('q');
  const category = document.getElementById('category');
  const store = document.getElementById('store');
  const minDiscount = document.getElementById('minDiscount');
  const sort = document.getElementById('sort');
  const grid = document.getElementById('grid');
  const count = document.getElementById('resultCount');

  category.innerHTML = optionList(META.categories, 'All categories');
  store.innerHTML = optionList(META.stores, 'All stores');

  const state = filterStateFromUrl(location.search);
  q.value = state.q;
  if ([...category.options].some((o) => o.value === state.category)) category.value = state.category;
  if ([...store.options].some((o) => o.value === state.store)) store.value = state.store;
  if ([...minDiscount.options].some((o) => Number(o.value) === state.minDiscount)) minDiscount.value = String(state.minDiscount);
  sort.value = state.sort;

  function render() {
    const current = {
      q: q.value,
      category: category.value,
      store: store.value,
      minDiscount: Number(minDiscount.value),
      sort: sort.value,
    };
    const shown = sortDeals(applyFilters(DEALS, current), current.sort);
    grid.innerHTML = dealGridHtml(shown);
    count.innerHTML = resultCountHtml(shown.length, DEALS.length);
  }

  for (const control of [q, category, store, minDiscount, sort]) {
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  }
  render();
}

function initCompare() {
  document.getElementById('compareRoot').innerHTML = compareHtml(DEALS, META.compareProducts);
}

function initSources() {
  const seen = new Map();
  for (const deal of DEALS) {
    if (!seen.has(deal.sourceName)) seen.set(deal.sourceName, deal.sourceUrl);
  }
  document.getElementById('sourceList').innerHTML = [...seen.entries()]
    .map(([name, url]) => `<li><strong>${escapeHtml(name)}</strong> — <a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a> · read 27 Nov 2026</li>`)
    .join('');
}

window.__shotReady = false;
if (page === 'home') initHome();
else if (page === 'compare') initCompare();
else if (page === 'sources') initSources();
window.__shotReady = true;
