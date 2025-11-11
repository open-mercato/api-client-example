import { fetchDeals, type Deal } from '@/lib/deals';

export const dynamic = 'force-dynamic';

function formatCurrency(amount?: number | null, currency?: string | null) {
  if (typeof amount !== 'number' || !currency) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
}

function describeAssociations(deal: Deal) {
  const companies = (Array.isArray(deal.companies) ? deal.companies.length : deal.companyIds?.length) ?? 0;
  const people = (Array.isArray(deal.people) ? deal.people.length : deal.personIds?.length) ?? 0;
  if (!companies && !people) {
    return 'No associations yet';
  }
  const parts = [];
  if (people) parts.push(`${people} people`);
  if (companies) parts.push(`${companies} companies`);
  return parts.join(' · ');
}

export default async function DealsPage() {
  let errorMessage: string | null = null;
  let total = 0;
  let totalPages = 0;
  let items: Deal[] = [];

  try {
    const result = await fetchDeals();
    items = result.items;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error while loading deals.';
  }

  return (
    <main>
      <div className="card">
        <div>
          <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', fontSize: '0.78rem' }}>
            Open Mercato
          </p>
          <h1 style={{ fontSize: '2.5rem', margin: '0.2rem 0 0.4rem' }}>Live pipeline snapshot</h1>
          <p style={{ color: '#cbd5f5', maxWidth: '560px', lineHeight: 1.5 }}>
            This sample Next.js page loads deals from the Open Mercato API using the official TypeScript client. Update
            <code style={{ marginLeft: '0.35rem' }}>OPEN_MERCATO_API_KEY</code> to see your organization&apos;s data.
          </p>
        </div>

        {errorMessage ? (
          <div className="error">
            <strong>Could not load deals.</strong>
            <div style={{ marginTop: '0.35rem' }}>{errorMessage}</div>
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span>Total deals</span>
                <strong>{total}</strong>
              </div>
              <div className="stat-card">
                <span>Pages available</span>
                <strong>{totalPages}</strong>
              </div>
              <div className="stat-card">
                <span>Showing</span>
                <strong>{items.length}</strong>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">No deals were returned for the current filter.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Updated</th>
                    <th>Associations</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((deal) => (
                    <tr key={deal.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{deal.title}</div>
                        {deal.description ? (
                          <div style={{ fontSize: '0.9rem', color: '#cbd5f5', marginTop: '0.15rem' }}>{deal.description}</div>
                        ) : null}
                      </td>
                      <td>
                        <span className="pill">{deal.status ?? 'unknown'}</span>
                        {deal.pipeline_stage ? (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{deal.pipeline_stage}</div>
                        ) : null}
                      </td>
                      <td>{formatCurrency(deal.value_amount, deal.value_currency)}</td>
                      <td>{formatDate(deal.updated_at ?? deal.created_at)}</td>
                      <td style={{ color: '#cbd5f5' }}>{describeAssociations(deal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </main>
  );
}
