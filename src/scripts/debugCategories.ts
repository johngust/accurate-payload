import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const categoriesRes = await payload.find({ collection: 'categories', limit: 300 })
  console.log('--- Categories ---')
  categoriesRes.docs.forEach(cat => {
    console.log('ID: ' + cat.id + ' | Title: ' + Buffer.from(cat.title).toString('hex'))
  })

  const prod = await payload.find({ collection: 'products', limit: 10 })
  console.log('\n--- Products ---')
  prod.docs.forEach(p => {
    console.log('Title: ' + Buffer.from(p.title).toString('hex'))
    console.log('Cats value: ' + JSON.stringify(p.categories))
  })

  process.exit(0)
}

run()
