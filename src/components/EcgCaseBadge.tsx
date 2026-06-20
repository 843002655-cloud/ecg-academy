interface Props {
  number: number | null;
  className?: string;
}

export default function EcgCaseBadge({ number, className = "" }: Props) {
  if (number == null) return null;
  return (
    <span
      className={`inline-flex items-center text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[#1A2332] dark:bg-slate-700 text-white shrink-0 ${className}`}
      aria-label={`ECG 病例 ${number}`}
    >
      ECG {number}
    </span>
  );
}
