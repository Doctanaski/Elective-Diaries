// Pure CSS animations — no 'use client', no JS, no Motion.
// CSS keyframes fire immediately on first paint on all browsers/devices.

export default function HomeHero() {
  return (
    <>
      <style>{`
        @keyframes hero-fade-down {
          from { opacity: 0; filter: blur(12px); transform: translateY(-24px); }
          to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
        }
        @keyframes hero-fade-up {
          from { opacity: 0; filter: blur(12px); transform: translateY(24px); }
          to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; filter: blur(8px); transform: translateY(12px); }
          to   { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        .hero-title {
          animation: hero-fade-down 0.9s cubic-bezier(0.22,1,0.36,1) 0.05s both;
        }
        .hero-badge {
          animation: hero-fade-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both;
        }
        .hero-desc {
          animation: hero-fade-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.35s both;
        }
      `}</style>

      <header className="text-center mb-24 relative max-w-4xl mx-auto">
        <div className="absolute inset-0 -z-10 bg-primary/5 rounded-full blur-3xl opacity-70 w-full h-full transform scale-150 pointer-events-none" />

        {/* Title */}
        <h1 className="hero-title font-headline font-extrabold text-5xl md:text-6xl leading-tight text-primary tracking-tight mb-6">
          The Elective Diaries
        </h1>

        {/* Badge */}
        <div className="hero-badge flex items-center justify-center space-x-2 bg-surface-container-high/50 w-fit mx-auto px-4 py-2 rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>account_balance</span>
          <p className="font-label text-sm font-semibold tracking-widest text-primary uppercase">
            KMC Local Council · IFMSA Pakistan
          </p>
        </div>

        {/* Description */}
        <p className="hero-desc mt-8 text-primary font-body max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          A precision archive documenting clinical experiences, resource availability, and operational protocols across affiliated medical facilities.
        </p>
      </header>
    </>
  )
}
