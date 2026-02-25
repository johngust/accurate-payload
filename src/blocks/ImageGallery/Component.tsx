// ABOUTME: Masonry-галерея изображений в стиле Pinterest.
// ABOUTME: CSS columns для автоматического распределения по колонкам.

import { Media } from '@/components/Media'

type GalleryImage = {
  image: any
  caption?: string | null
  id?: string | null
}

type Props = {
  title?: string | null
  images?: GalleryImage[] | null
  blockType: 'imageGallery'
  blockName?: string | null
  id?: string | null
}

export const ImageGalleryBlock: React.FC<Props> = ({ title, images }) => {
  if (!images?.length) return null

  return (
    <section className="container py-8">
      {title && <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {images.map((item, i) => {
          const image = item.image && typeof item.image === 'object' ? item.image : undefined
          if (!image) return null

          return (
            <div key={item.id || i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
              <Media resource={image} imgClassName="w-full object-cover" />
              {item.caption && (
                <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
