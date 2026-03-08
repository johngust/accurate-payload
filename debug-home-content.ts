import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function debugHomePageContent() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'home' }
    }
  })
  
  if (result.docs.length > 0) {
    const page = result.docs[0]
    console.log('--- Home Page Debug ---')
    console.log('Status:', page._status)
    console.log('Title:', page.title)
    console.log('Blocks Data Summary:')
    page.layout.forEach((block, i) => {
      console.log(`${i+1}. ${block.blockType}:`, JSON.stringify(block).substring(0, 100) + '...')
    })
  } else {
    console.log('Home page not found')
  }
  process.exit(0)
}

debugHomePageContent().catch(err => {
  console.error(err)
  process.exit(1)
})
