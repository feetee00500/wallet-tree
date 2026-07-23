interface LogoProps {
  subtitle?: string;
  className?: string;
}

export function Logo({ subtitle, className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>

      {subtitle ? (
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-mute">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}
