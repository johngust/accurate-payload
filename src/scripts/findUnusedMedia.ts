import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function findUnusedMedia() {
  const payload = await getPayload({ config: configPromise })
  const media = await payload.find({ 
    collection: 'media', 
    limit: 1000
  })
  
  const products = await payload.find({ collection: 'products', limit: 1000 })
  const usedMediaIds = new Set()
  products.docs.forEach(p => {
    p.gallery?.forEach(item => {
      if (typeof item.image === 'object') usedMediaIds.add(item.image.id)
      else usedMediaIds.add(item.image)
    })
  })

  const unusedMedia = media.docs.filter(m => !usedMediaIds.has(m.id))
  console.log(`Found ${unusedMedia.length} unused media items with "Product Mock" in alt`)
  unusedMedia.slice(0, 10).forEach(m => console.log(`- ${m.filename} (${m.id})`))
}

findUnusedMedia()
