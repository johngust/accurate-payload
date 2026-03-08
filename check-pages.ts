import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function checkPages() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
  })
  console.log('Total pages in DB:', pages.totalDocs)
  pages.docs.forEach(page => {
    console.log(`- Title: ${page.title}, Slug: ${page.slug}, Status: ${page._status}`)
  })
  process.exit(0)
}

checkPages().catch(err => {
  console.error(err)
  process.exit(1)
})
