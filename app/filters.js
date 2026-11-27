// DealHunt filtering and sorting: pure functions over the deal list, so the
// finder on the home page is testable without a browser.

export function applyFilters(deals, state) {
  const query = (state.q || '').trim().toLowerCase();
  return deals.filter((deal) => {
    if (query && !deal.product.toLowerCase().includes(query) && !deal.category.toLowerCase().includes(query)) return false;
    if (state.category && state.category !== 'All' && deal.category !== state.category) return false;
    if (state.store && state.store !== 'All' && deal.store !== state.store) return false;
    if (state.minDiscount && deal.discount < state.minDiscount) return false;
    return true;
  });
}

const VERDICT_RANK = { 'NEW LOW': 0, 'STRONG DEAL': 1, 'ROUTINE SALE': 2 };

export function sortDeals(deals, sort) {
  const list = [...deals];
  if (sort === 'save') return list.sort((a, b) => b.save - a.save || b.discount - a.discount);
  if (sort === 'price') return list.sort((a, b) => a.sale - b.sale || b.discount - a.discount);
  if (sort === 'verdict') {
    return list.sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || b.discount - a.discount);
  }
  return list.sort((a, b) => b.discount - a.discount || b.save - a.save);
}

export function filterStateFromUrl(search) {
  const params = new URLSearchParams(search);
  const min = Number(params.get('min') || '0');
  return {
    q: params.get('q') || '',
    category: params.get('category') || 'All',
    store: params.get('store') || 'All',
    minDiscount: Number.isFinite(min) && min > 0 ? min : 0,
    sort: ['discount', 'save', 'price', 'verdict'].includes(params.get('sort')) ? params.get('sort') : 'discount',
  };
}
