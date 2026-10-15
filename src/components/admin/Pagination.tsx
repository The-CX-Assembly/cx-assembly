'use client';

import { IconChevronLeft, IconChevronRight } from './AdminIcons';
import { cx, ui } from './ui';

/** Page numbers to show: always first/last and the current page's neighbours. */
export function pageList(page: number, pageCount: number): (number | 'gap')[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (['gap', p] as const) : [p]));
}

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
    <nav aria-label={`${noun} pages`} className={ui.pager}>
      <span className={ui.pagerInfo}>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> {noun}
      </span>
      {pageCount > 1 && (
        <div className={ui.pagerButtons}>
          <button type="button" className={ui.pagerBtn} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
            <IconChevronLeft size={16} /> Prev
          </button>
          {pageList(page, pageCount).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className={ui.pagerGap}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={cx(ui.pagerBtn, p === page && ui.pagerBtnOn)}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            className={ui.pagerBtn}
            disabled={page === pageCount}
            onClick={() => onChange(page + 1)}
            aria-label="Next page"
          >
            Next <IconChevronRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
