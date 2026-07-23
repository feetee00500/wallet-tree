interface LogoProps {
  subtitle?: string;
  className?: string;
}

export function Logo({ subtitle, className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="text-sm font-bold tracking-tight text-bone-white">
        Wallet Tree
      </span>
      {subtitle ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-iron">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}
