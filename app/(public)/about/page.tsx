import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — The Elective Diaries',
}

export default function AboutPage() {
  return (
    <div className="pt-20 pb-24 px-6 md:px-12 lg:px-24 max-w-3xl mx-auto">
      <div className="mb-12">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4">
          About This Project
        </span>
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-6">
          What is The Elective Diaries?
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          The Elective Diaries is a student-led initiative by the{' '}
          <strong className="text-on-surface">KMC Local Council of IFMSA Pakistan</strong> to
          document and share clinical elective experiences at hospitals affiliated with Khyber
          Medical College, Peshawar.
        </p>
      </div>

      <div className="space-y-8 text-on-surface-variant leading-relaxed">
        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
          <div className="flex items-start space-x-4">
            <span className="material-symbols-outlined text-primary mt-1">menu_book</span>
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Our Mission</h2>
              <p>
                We believe every clinical experience holds lessons worth preserving. This platform
                serves as a living archive — helping future KMC students make informed decisions
                about their electives by reading real accounts from their peers.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
          <div className="flex items-start space-x-4">
            <span className="material-symbols-outlined text-primary mt-1">groups</span>
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Who We Are</h2>
              <p>
                IFMSA Pakistan's KMC Local Council is a student-run organization at Khyber Medical
                College. We run exchanges, academic events, and community projects to build a
                globally-minded medical community in Peshawar.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/20">
          <div className="flex items-start space-x-4">
            <span className="material-symbols-outlined text-primary mt-1">edit_note</span>
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Contribute Your Story</h2>
              <p>
                Have you completed a clinical elective at one of our affiliated hospitals? We'd love
                to feature your experience. Reach out to your KMC LC representatives to get your
                diary published on this platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
