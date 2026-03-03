import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const products = await payload.find({ collection: 'products', limit: 10000, depth: 0 })
  let noGallery = 0
  let noImage = 0
  
  for (const p of products.docs) {
    if (!p.gallery || p.gallery.length === 0) {
      noGallery++
    } else {
      const first = p.gallery[0]
      if (!first.image) noImage++
    }
  }
  
  console.log('Total products: ' + products.totalDocs)
  console.log('Products without gallery: ' + noGallery)
  console.log('Products with empty first image: ' + noImage)
  
  process.exit(0)
}

run()
