import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function checkProducts() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({ collection: 'products', limit: 1000 })
  
  const withoutImages = products.docs.filter(p => !p.gallery || p.gallery.length === 0)
  const withoutCategories = products.docs.filter(p => !p.categories || p.categories.length === 0)
  
  console.log(`Total products: ${products.totalDocs}`)
  console.log(`Products without images: ${withoutImages.length}`)
  console.log(`Products without categories: ${withoutCategories.length}`)
  
  if (withoutCategories.length > 0) {
    console.log('Sample products without categories:')
    withoutCategories.slice(0, 10).forEach(p => console.log(`- ${p.title}`))
  }
}

checkProducts()
