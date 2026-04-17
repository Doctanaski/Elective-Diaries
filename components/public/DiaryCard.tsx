import Link from 'next/link'
import Image from 'next/image'
import type { Diary } from '@/types/database'

export default function DiaryCard({ diary, hospitalSlug }: { diary: Diary; hospitalSlug: string }) {
  return (
    <Link href={`/hospitals/${hospitalSlug}/diaries/${diary.id}`}>
      <article className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {diary.cover_image_url && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={diary.cover_image_url}
              alt={diary.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          {diary.specialty && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3 w-fit">
              {diary.specialty}
            </span>
          )}
          <h3 className="font-headline font-bold text-lg text-on-surface leading-snug group-hover:text-primary transition-colors duration-200 mb-2">
            {diary.title}
          </h3>
          {diary.excerpt && (
            <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 flex-grow">
              {diary.excerpt}
            </p>
          )}
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-outline-variant/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {diary.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{diary.author_name}</p>
              <p className="text-xs text-on-surface-variant">{diary.author_year}</p>
            </div>
            <span className="ml-auto text-xs text-on-surface-variant">
              {new Date(diary.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
