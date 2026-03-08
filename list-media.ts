import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function listMedia() {
  const payload = await getPayload({ config: configPromise })
  const media = await payload.find({
    collection: 'media',
    limit: 20
  })
  console.log('Total media docs:', media.totalDocs)
  media.docs.forEach(m => {
    console.log(`- ID: ${m.id}, Filename: ${m.filename}`)
  })
  process.exit(0)
}

listMedia().catch(err => {
  console.error(err)
  process.exit(1)
})
