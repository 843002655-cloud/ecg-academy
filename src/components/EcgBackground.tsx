export default function EcgBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#1B4F8A]/5 dark:bg-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#0F6E56]/5 dark:bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      <svg className="absolute bottom-0 left-0 w-full opacity-[0.06] dark:hidden" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: "30%" }}>
        <path d="M0,60 L100,60 L150,60 L160,15 L170,60 L180,60 L250,60 L300,60 L310,45 L320,60 L330,60 L400,60 L450,60 L460,10 L470,60 L480,60 L550,60 L600,60 L610,40 L620,60 L630,60 L700,60 L750,60 L760,15 L770,60 L780,60 L850,60 L900,60 L910,35 L920,60 L930,60 L1000,60 L1050,60 L1060,12 L1070,60 L1080,60 L1150,60 L1200,60" fill="none" stroke="#1B4F8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="8s" repeatCount="indefinite" />
        </path>
      </svg>
      <svg className="absolute bottom-0 left-0 w-full opacity-[0.1] hidden dark:block" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: "30%" }}>
        <path d="M0,60 L100,60 L150,60 L160,15 L170,60 L180,60 L250,60 L300,60 L310,45 L320,60 L330,60 L400,60 L450,60 L460,10 L470,60 L480,60 L550,60 L600,60 L610,40 L620,60 L630,60 L700,60 L750,60 L760,15 L770,60 L780,60 L850,60 L900,60 L910,35 L920,60 L930,60 L1000,60 L1050,60 L1060,12 L1070,60 L1080,60 L1150,60 L1200,60" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur="8s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}
