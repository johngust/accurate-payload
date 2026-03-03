import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const all = await payload.find({ collection: 'products', limit: 100, depth: 0 })
  console.log('Total checked: ' + all.docs.length)
  all.docs.forEach(p => {
     if (!p.categories || p.categories.length === 0) {
         console.log('No Cat: ' + Buffer.from(p.title).toString('hex'))
     } else {
         console.log('Has Cat (' + p.categories.length + '): ' + Buffer.from(p.title).toString('hex'))
     }
  })

  process.exit(0)
}

run()
