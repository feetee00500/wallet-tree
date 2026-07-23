import { useEffect, useRef, useState } from 'react';
import { SearchIcon, XIcon } from './icons';

interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'ค้นหา',
  ariaLabel,
  debounceMs = 250,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const externalRef = useRef(value);

  useEffect(() => {
    if (externalRef.current !== value) {
      externalRef.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === externalRef.current) return;
    const id = window.setTimeout(() => {
      externalRef.current = draft;
      onChange(draft);
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [draft, debounceMs, onChange]);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="min-h-[40px] w-full rounded-[6px] border border-hairline bg-canvas pl-9 pr-9 text-[13px] text-ink placeholder:text-mute outline-none transition focus:border-link/70 focus:ring-2 focus:ring-link/20"
      />
      {draft.length > 0 ? (
        <button
          type="button"
          aria-label="ล้างการค้นหา"
          onClick={() => {
            setDraft('');
            externalRef.current = '';
            onChange('');
          }}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[4px] text-body transition hover:bg-canvas-soft-2 hover:text-ink"
        >
          <XIcon className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
