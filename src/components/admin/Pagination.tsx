'use client';

/** Page numbers to show: always first/last and the current page's neighbours. */
export function pageList(page: number, pageCount: number): (number | 'gap')[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (['gap', p] as const) : [p]));
}

const btn: React.CSSProperties = {
  minWidth: 34,
  height: 34,
  padding: '0 10px',
  border: '1px solid #CBD5E1',
  borderRadius: 'var(--radius-sm)',
  background: '#FFFFFF',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
};

/** Prev / numbered pages / next, with a "Showing 1–20 of 57" summary. */
export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  noun = 'items',
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  noun?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label={`${noun} pages`}
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}
    >
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> {noun}
      </span>
      {pageCount > 1 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button type="button" style={{ ...btn, opacity: page === 1 ? 0.4 : 1 }} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
            ‹ Prev
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} style={{ color: 'var(--color-text-muted)', padding: '0 2px' }}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                style={{
                  ...btn,
                  ...(p === page ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#FFFFFF' } : {}),
                }}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            style={{ ...btn, opacity: page === pageCount ? 0.4 : 1 }}
            disabled={page === pageCount}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      )}
    </nav>
  );
}
