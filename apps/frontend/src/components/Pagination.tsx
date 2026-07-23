interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (nextPage: number) => void;
}

const baseButtonClass =
  'inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-[4px] border text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40';

const navClass = `${baseButtonClass} border-hairline bg-canvas px-3 text-ink hover:border-hairline hover:text-ink`;
const numberClass = `${baseButtonClass} border-hairline bg-canvas text-body hover:border-hairline hover:text-ink`;
const activeClass = `${baseButtonClass} border-link/40 bg-link/10 text-link`;
const ellipsisClass = 'inline-flex min-h-[36px] min-w-[36px] items-center justify-center text-[13px] text-mute';

function buildPageList(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }
  const pages: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages - 1) pages.push('gap');
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const pages = buildPageList(page, safeTotalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-[13px] text-body">
        ทั้งหมด <span className="font-medium text-ink">{total.toLocaleString('th-TH')}</span>{' '}
        รายการ
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={navClass}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ก่อนหน้า
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, idx) =>
            p === 'gap' ? (
              <span key={`gap-${idx}`} className={ellipsisClass}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-current={p === page ? 'page' : undefined}
                className={p === page ? activeClass : numberClass}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            ),
          )}
        </div>
        <span className="text-[13px] text-body sm:hidden">
          หน้า {page} / {safeTotalPages}
        </span>
        <button
          type="button"
          className={navClass}
          disabled={page >= safeTotalPages}
          onClick={() => onChange(page + 1)}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
