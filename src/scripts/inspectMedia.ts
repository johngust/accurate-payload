import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function inspectMedia() {
  const payload = await getPayload({ config: configPromise })
  const media = await payload.find({ collection: 'media', limit: 10 })
  
  console.log('Sample Media Records:')
  media.docs.forEach(m => {
    console.log(`- ID: ${m.id}`)
    console.log(`  Filename: ${m.filename}`)
    console.log(`  URL: ${m.url}`)
    console.log(`  Alt: ${m.alt}`)
    console.log(`  Mimetype: ${m.mimeType}`)
  })
}

inspectMedia()
