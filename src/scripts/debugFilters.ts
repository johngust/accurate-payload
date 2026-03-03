import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const products = await payload.find({ 
    collection: 'products', 
    limit: 50,
    depth: 0
  })
  
  console.log('--- Product Samples ---')
  products.docs.forEach(p => {
    const catInfo = p.categories ? p.categories.join(', ') : 'NONE'
    console.log('Title: ' + p.title.substring(0, 30) + ' | Cats: ' + catInfo)
  })

  const rootCats = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false } },
    limit: 100
  })
  
  console.log('\n--- Root Categories ---')
  rootCats.docs.forEach(c => {
    console.log('ID: ' + c.id + ' | Title: ' + c.title)
  })

  process.exit(0)
}

run()
