import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function deleteHomePage() {
  const payload = await getPayload({ config: configPromise })
  
  // try to find the page first
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'home' }
    }
  })
  
  if (result.docs.length > 0) {
    try {
      await payload.delete({
        collection: 'pages',
        id: result.docs[0].id,
        context: { disableRevalidate: true }
      })
      console.log('Home page deleted from DB.')
    } catch (e) {
      console.error('Error during deletion:', e.message)
      // Even if revalidation fails, the deletion might have happened
    }
  } else {
    console.log('Home page not found in DB')
  }
  process.exit(0)
}

deleteHomePage().catch(err => {
  console.error(err)
  process.exit(1)
})
