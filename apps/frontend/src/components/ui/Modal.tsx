import { useEffect, type ReactNode } from 'react';
import { XIcon } from '../icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

export function Modal({ open, onClose, title, children, footer, closeOnBackdrop = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/20 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className="relative flex min-h-screen w-full flex-col bg-canvas text-ink sm:min-h-0 sm:max-h-[85vh] sm:max-w-lg sm:rounded-[12px] sm:border sm:border-hairline sm:shadow-[var(--shadow-level-5)] animate-[fadeIn_150ms_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-heading-sm font-semibold tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            aria-label="ปิด"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-mute transition hover:bg-canvas-soft hover:text-ink"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <footer className="border-t border-hairline px-6 py-4">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
