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
    <Card className={`border-rose-500/30 bg-rose-500/5 px-4 py-3 text-[13px] text-rose-300 ${className}`}>
      <p className="font-medium">{message}</p>
      {hint ? <p className="mt-1 text-xs text-rose-300/70">{hint}</p> : null}
    </Card>
  );
}
