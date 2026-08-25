'use client'

import { useState } from 'react'

interface ContributorDetail {
  icon: string
  label: string
  value: string
}

interface Contributor {
  id: string
  name: string
  role: string
  photo: string
  tagline: string
  details: ContributorDetail[]
  bio: string
}

const CONTRIBUTORS: Contributor[] = [
  {
    id: 'ayesha-khan',
    name: 'Ayesha Khan',
    role: 'President · Project Lead',
    photo: '/contributor-placeholder-1.svg',
    tagline: 'Founded the archive to make elective planning transparent for every KMC student.',
    details: [
      { icon: 'school',          label: 'Batch',        value: 'KMC Batch 2023' },
      { icon: 'local_hospital',  label: 'Elective at',  value: 'Lady Reading Hospital, Peshawar' },
      { icon: 'interests',       label: 'Focus',        value: 'Internal Medicine · Medical Education' },
      { icon: 'mail',            label: 'Contact',      value: 'president.klc@ifmsapakistan.org' },
    ],
    bio: 'Ayesha spearheaded The Elective Diaries after navigating her own elective with little first-hand guidance. She leads the council\'s vision, reviews every submission before publication, and coordinates with hospital focal persons to keep facility information accurate and up to date. When she is not on wards, she mentors juniors preparing for their first clinical rotations.',
  },
  {
    id: 'muhammad-haris',
    name: 'Muhammad Haris',
    role: 'Content Editor',
    photo: '/contributor-placeholder-2.svg',
    tagline: 'Turns raw rotation notes into polished, honest diary entries.',
    details: [
      { icon: 'school',          label: 'Batch',        value: 'KMC Batch 2024' },
      { icon: 'local_hospital',  label: 'Elective at',  value: 'Hayatabad Medical Complex, Peshawar' },
      { icon: 'interests',       label: 'Focus',        value: 'Surgery · Medical Writing' },
      { icon: 'mail',            label: 'Contact',      value: 'editorial.klc@ifmsapakistan.org' },
    ],
    bio: 'Haris edits and fact-checks the diaries, working closely with contributors to preserve their voice while keeping entries practical and readable. He built the diary template that standardises sections like resources, workload, and tips for future electives. Outside the archive, he documents his own surgical rotations and contributes to the council\'s exchange program.',
  },
  {
    id: 'fatima-zahra',
    name: 'Fatima Zahra',
    role: 'Web Developer & Design',
    photo: '/contributor-placeholder-3.svg',
    tagline: 'Designed and built the platform you are reading this on.',
    details: [
      { icon: 'school',          label: 'Batch',        value: 'KMC Batch 2025' },
      { icon: 'local_hospital',  label: 'Elective at',  value: 'Khyber Teaching Hospital, Peshawar' },
      { icon: 'interests',       label: 'Focus',        value: 'Paediatrics · Health Technology' },
      { icon: 'mail',            label: 'Contact',      value: 'tech.klc@ifmsapakistan.org' },
    ],
    bio: 'Fatima architected the site end to end — from the scrolling home page to the admin pipeline that publishes new diaries. She obsesses over performance and accessibility so the archive stays fast on any device a student carries to the wards. She also manages deployments, backups, and the hospital data that powers the directory.',
  },
]

export default function Contributors() {
  const [activeId, setActiveId] = useState(CONTRIBUTORS[0].id)
  const active = CONTRIBUTORS.find(c => c.id === activeId) ?? CONTRIBUTORS[0]

  return (
    <div className="max-w-5xl mx-auto w-full">
      <style>{`
        @keyframes contrib-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .contrib-panel { animation: contrib-in 0.45s cubic-bezier(0.22,1,0.36,1) both }
      `}</style>

      <p className="font-label text-xs uppercase tracking-[0.25em] text-on-surface-variant/40 text-center mb-4">
        The People Behind It
      </p>
      <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface text-center leading-tight mb-4">
        Meet the Contributors
      </h2>
      <p className="font-body text-primary/70 text-center max-w-xl mx-auto mb-10">
        A small team of students who collect, curate, and publish every diary on this platform.
      </p>

      <div
        role="tablist"
        aria-label="Contributors"
        className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8"
      >
        {CONTRIBUTORS.map(c => {
          const selected = c.id === active.id
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`contrib-panel-${c.id}`}
              id={`contrib-tab-${c.id}`}
              onClick={() => setActiveId(c.id)}
              className={`flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                selected
                  ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/30 scale-[1.03]'
                  : 'bg-surface-container-high/60 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-outline-variant/60'
              }`}
            >
              <img
                src={c.photo}
                alt=""
                className={`w-8 h-8 rounded-full object-cover border ${selected ? 'border-on-primary/40' : 'border-outline-variant/40'}`}
              />
              <span className={`text-sm ${selected ? 'font-headline font-bold' : 'font-medium'}`}>
                {c.name}
              </span>
            </button>
          )
        })}
      </div>

      <div
        key={active.id}
        role="tabpanel"
        id={`contrib-panel-${active.id}`}
        aria-labelledby={`contrib-tab-${active.id}`}
        className="contrib-panel bg-surface-container rounded-3xl border border-outline-variant/20 p-7 md:p-10 shadow-lg shadow-primary/5"
      >
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="relative w-full max-w-[240px]">
              <img
                src={active.photo}
                alt={`${active.name} — ${active.role}`}
                className="w-full aspect-[400/480] rounded-2xl object-cover border border-outline-variant/20 shadow-xl"
              />
              <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-primary/10 rounded-full blur-2xl -z-10 pointer-events-none" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-secondary/10 rounded-full blur-2xl -z-10 pointer-events-none" />
            </div>
          </div>

          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
              {active.role}
            </p>
            <h3 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface leading-tight mb-3">
              {active.name}
            </h3>
            <p className="font-body italic text-primary/70 mb-6">{active.tagline}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-7">
              {active.details.map(d => (
                <div key={d.label} className="flex items-start gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0" style={{ fontSize: 19 }}>{d.icon}</span>
                  <div className="min-w-0">
                    <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/60">{d.label}</p>
                    <p className="font-body text-sm font-medium text-on-surface break-words">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-12 h-px bg-primary/40 mb-5" />
            <p className="font-body text-primary/80 leading-relaxed">{active.bio}</p>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center gap-3">
        <div className="w-16 h-px bg-outline-variant/40" />
        <p className="font-body text-xs text-on-surface-variant/40 text-center">
          © {new Date().getFullYear()} KMC Local Council · IFMSA Pakistan — The Elective Diaries
        </p>
      </div>
    </div>
  )
}
