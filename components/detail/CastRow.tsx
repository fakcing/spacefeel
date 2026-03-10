import Image from 'next/image'
import { Person } from '@/types/tmdb'
import { getPoster } from '@/lib/tmdbImages'

interface CastRowProps {
  cast: Person[]
}

export default function CastRow({ cast }: CastRowProps) {
  return (
    <section className="px-4 md:px-12 py-6">
      <h2 className="text-xl font-semibold tracking-tight mb-4 text-[var(--text-primary)]">Cast</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {cast.slice(0, 24).map((person) => {
          const photo = getPoster(person.profile_path, 'w185')
          return (
            <div key={`${person.id}-${person.character}`} className="flex-shrink-0 text-center w-16">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 group">
                {photo ? (
                  <Image
                    src={photo}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10" />
                )}
                {person.character && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-white text-center px-1 leading-tight line-clamp-3">
                      {person.character}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">{person.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">{person.character}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
