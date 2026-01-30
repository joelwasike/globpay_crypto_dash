// Map Solana Gateway API transaction to shape used by shared chart/table components
// API: { id, amount, status: 'completed'|'pending'|'failed', created_at, ... }
// Charts expect: { id, amount, transaction_status: 'SUCCESS'|'PENDING'|'FAILED', date_added (unix seconds), ... }
export function toChartTransaction(t) {
  if (!t) return t;
  const statusMap = { completed: 'SUCCESS', pending: 'PENDING', failed: 'FAILED' };
  const dateAdded = t.created_at ? Math.floor(new Date(t.created_at).getTime() / 1000) : 0;
  return {
    ...t,
    amount: t.amount ?? 0,
    transaction_status: statusMap[t.status] || (t.status || '').toUpperCase(),
    date_added: dateAdded,
    external_id: t.merchant_deposit_id || t.deposit_id,
    currency: t.asset || 'USDT',
    source_of_funds: t.asset || 'USDT'
  };
}

export function toChartTransactions(list) {
  return (list || []).map(toChartTransaction);
}
