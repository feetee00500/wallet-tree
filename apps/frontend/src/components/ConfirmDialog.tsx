import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  error,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={loading ? () => undefined : onClose} title={title}>
      <p className="text-[13px] text-body">{description}</p>
      {error ? (
        <div className="mt-4 rounded-[6px] border border-error/30 bg-error-soft/30 px-4 py-3 text-[13px] text-error">
          {error}
        </div>
      ) : null}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading} className="sm:min-w-32">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
