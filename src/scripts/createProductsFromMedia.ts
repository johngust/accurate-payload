import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  // Find all categories
  const categories = await payload.find({ collection: 'categories', limit: 100 })
  console.log(`Found ${categories.totalDocs} categories`)

  // Find all media items that are not used in any product
  const media = await payload.find({ collection: 'media', limit: 1000 })
  const products = await payload.find({ collection: 'products', limit: 1000 })
  
  const usedMediaIds = new Set()
  products.docs.forEach(p => {
    p.gallery?.forEach(item => {
      if (typeof item.image === 'object' && item.image?.id) usedMediaIds.add(item.image.id)
      else if (item.image) usedMediaIds.add(item.image)
    })
  })

  const unusedMedia = media.docs.filter(m => !usedMediaIds.has(m.id))
  console.log(`Found ${unusedMedia.length} unused media items`)

  // Filter those that seem to be products (not heroes, not icons)
  // Products usually have "Product Mock" or long filenames with brand names
  const productMedia = unusedMedia.filter(m => {
    return (m.alt?.includes('Product Mock')) || 
           (m.filename && m.filename.length > 20)
  })

  console.log(`Found ${productMedia.length} media items to turn into products`)

  for (const m of productMedia) {
    const title = m.alt?.replace('Product Mock - ', '') || m.filename.split('.')[0].replace(/_/g, ' ')
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    // Simple heuristic for categories
    let categoryIds: string[] = []
    if (title.toLowerCase().includes('унитаз') || title.toLowerCase().includes('cersanit')) {
       const cat = categories.docs.find(c => c.title.toLowerCase().includes('унитаз'))
       if (cat) categoryIds.push(cat.id)
    } else if (title.toLowerCase().includes('смеситель')) {
       const cat = categories.docs.find(c => c.title.toLowerCase().includes('смеситель'))
       if (cat) categoryIds.push(cat.id)
    } else if (title.toLowerCase().includes('ванна')) {
       const cat = categories.docs.find(c => c.title.toLowerCase().includes('ванна'))
       if (cat) categoryIds.push(cat.id)
    }

    try {
      const existing = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1
      })
      
      if (existing.totalDocs > 0) {
        console.log(`Product with slug ${slug} already exists, skipping`)
        continue
      }

      await payload.create({
        collection: 'products',
        data: {
          title,
          slug,
          _status: 'published',
          enableVariants: false,
          gallery: [{ image: m.id }],
          categories: categoryIds,
          priceInKZT: Math.floor(Math.random() * 100000) + 10000,
          priceInKZTEnabled: true,
          inStock: 'in_stock'
        } as any
      })
      console.log(`Created product: ${title}`)
    } catch (err) {
      console.error(`Failed to create product for ${title}:`, err)
    }
  }

  process.exit(0)
}

run()
