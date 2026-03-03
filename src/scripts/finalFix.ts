import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  // 1. Get all categories to build a hierarchy map
  const allCats = await payload.find({ collection: 'categories', limit: 500, depth: 0 })
  const catMap = new Map(allCats.docs.map(c => [c.id, c]))
  const childToParent = new Map(allCats.docs.map(c => [c.id, c.parent]))

  // 2. Mass link missing categories based on keywords
  const products = await payload.find({ collection: 'products', limit: 10000, depth: 0 })
  console.log('Checking ' + products.totalDocs + ' products...')

  const keywordMap: Record<string, string> = {
    'унитаз': 'Унитазы',
    'смеситель': 'Смесители',
    'ванна': 'Ванны',
    'раковин': 'Раковины',
    'душев': 'Душевые',
    'биде': 'Биде',
    'полотенцесушитель': 'Полотенцесушители',
    'мойк': 'Кухонные мойки',
    'инсталл': 'Инсталляции',
  }

  let updated = 0
  for (const p of products.docs) {
    if (!p.categories || p.categories.length === 0) {
      const title = p.title.toLowerCase()
      let foundCatId = null
      for (const [k, v] of Object.entries(keywordMap)) {
        if (title.includes(k)) {
          const cat = allCats.docs.find(c => c.title === v)
          if (cat) {
            foundCatId = cat.id
            break
          }
        }
      }
      if (foundCatId) {
        await payload.update({
          collection: 'products',
          id: p.id,
          data: { categories: [foundCatId] } as any
        })
        updated++
      }
    }
  }
  console.log('Linked ' + updated + ' products.')
  process.exit(0)
}

run()
