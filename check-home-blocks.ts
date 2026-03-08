import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function checkHomePageBlocks() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'home' }
    }
  })
  
  if (result.docs.length > 0) {
    const page = result.docs[0]
    console.log('Blocks on Home page:', page.layout.length)
    page.layout.forEach((block, i) => {
      console.log(`${i+1}. Block Type: ${block.blockType}`)
    })
  } else {
    console.log('Home page not found in DB')
  }
  process.exit(0)
}

checkHomePageBlocks().catch(err => {
  console.error(err)
  process.exit(1)
})
