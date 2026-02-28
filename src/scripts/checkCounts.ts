import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function checkMedia() {
  const payload = await getPayload({ config: configPromise })
  const media = await payload.find({ collection: 'media', limit: 1000 })
  console.log(`Media count: ${media.totalDocs}`)
  const products = await payload.find({ collection: 'products', limit: 1000 })
  console.log(`Product count: ${products.totalDocs}`)
  const categories = await payload.find({ collection: 'categories', limit: 100 })
  console.log(`Categories: ${categories.docs.map(c => c.title).join(', ')}`)
}

checkMedia()
