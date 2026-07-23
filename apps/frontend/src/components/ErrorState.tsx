import { Card } from './ui/Card';

interface ErrorStateProps {
  message: string;
  hint?: string;
  className?: string;
}

export function ErrorState({
  message,
  hint = 'กรุณาลองใหม่อีกครั้ง',
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={`border-error/30 bg-error/5 px-4 py-3 text-[13px] text-error ${className}`}>
      <p className="font-medium">{message}</p>
      {hint ? <p className="mt-1 text-xs text-error/70">{hint}</p> : null}
    </Card>
  );
}
