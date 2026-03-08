import { getPayload } from 'payload'
import configPromise from './src/payload.config'

async function checkHeroData() {
  const payload = await getPayload({ config: configPromise })
  
  const promotions = await payload.find({
    collection: 'promotions',
    where: {
      and: [
        { active: { equals: true } },
        { type: { equals: 'hero' } },
      ],
    },
  })
  
  const featuredProducts = await payload.find({
    collection: 'featuredProducts',
    where: { active: { equals: true } },
  })

  console.log('Active Hero Promotions:', promotions.totalDocs)
  promotions.docs.forEach(p => console.log(`- ${p.title}`))
  
  console.log('Active Featured Products:', featuredProducts.totalDocs)
  featuredProducts.docs.forEach(p => console.log(`- ${p.title}`))
  
  process.exit(0)
}

checkHeroData().catch(err => {
  console.error(err)
  process.exit(1)
})
