import { createClient } from '@/lib/supabase/server'
import PresidentMessageForm from '@/components/admin/PresidentMessageForm'
import ContributorsManager from '@/components/admin/ContributorsManager'
import type { Contributor, SiteContent } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const supabase = createClient()

  const [{ data: contentRows }, { data: contributorsRaw }] = await Promise.all([
    supabase.from('site_content').select('*'),
    supabase.from('contributors').select('*').order('sort_order', { ascending: true }),
  ])

  const content: Record<string, string> = {}
  for (const row of (contentRows ?? []) as SiteContent[]) content[row.key] = row.value

  return (
    <div className="max-w-4xl pb-16">
      <div className="mb-8">
        <h1 className="font-headline font-bold text-3xl text-on-surface">Site Content</h1>
        <p className="text-primary mt-1">Edit the President&apos;s Message and homepage Contributors.</p>
      </div>

      <section className="mb-12">
        <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Message from the LEO</h2>
        <PresidentMessageForm
          heading={content['president_heading'] ?? ''}
          message1={content['president_message_1'] ?? ''}
          message2={content['president_message_2'] ?? ''}
          signoff={content['president_signoff'] ?? ''}
          imageUrl={content['president_image'] ?? ''}
        />
      </section>

      <section>
        <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Contributors</h2>
        <ContributorsManager initialContributors={(contributorsRaw ?? []) as Contributor[]} />
      </section>
    </div>
  )
}
