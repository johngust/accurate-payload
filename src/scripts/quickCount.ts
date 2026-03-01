import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({ 
    collection: 'products', 
    limit: 1,
    where: {
      categories: { exists: true }
    }
  })
  console.log(`Products with categories: ${products.totalDocs}`)
  process.exit(0)
}

run()
