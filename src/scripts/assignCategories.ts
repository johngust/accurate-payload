import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const categories = await payload.find({ collection: 'categories', limit: 300 })
  const products = await payload.find({ collection: 'products', limit: 10000 })
  
  console.log(`Found ${products.totalDocs} products and ${categories.totalDocs} categories`)

  const catMap: Record<string, string> = {}
  categories.docs.forEach(cat => {
    catMap[cat.title.toLowerCase()] = cat.id
  })

  // Mapping keywords to category titles
  const keywordMap: Record<string, string> = {
    'унитаз': 'Унитазы',
    'смеситель': 'Смесители',
    'ванна': 'Ванны',
    'раковин': 'Раковины',
    'душев': 'Душевые',
    'душ': 'Душевые',
    'биде': 'Биде',
    'полотенцесушитель': 'Полотенцесушители',
    'мойк': 'Кухонные мойки',
    'инсталл': 'Инсталляции',
    'lemark': 'Смесители',
    'grossman': 'Душевые',
    'iddis': 'Смесители',
    'brave': 'Смесители',
    'pissuar': 'Унитазы',
    'трап': 'Душевые',
  }

  let updatedCount = 0

  for (const product of products.docs) {
    // Re-assign if empty
    if (product.categories && product.categories.length > 0) continue;

    const title = product.title.toLowerCase()
    let assignedCatId: string | null = null

    for (const [keyword, catTitle] of Object.entries(keywordMap)) {
      if (title.includes(keyword)) {
        assignedCatId = catMap[catTitle.toLowerCase()]
        if (assignedCatId) break
      }
    }

    if (assignedCatId) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          categories: [assignedCatId]
        } as any
      })
      updatedCount++
      console.log(`Assigned category to: ${product.title}`)
    }
  }

  console.log(`Updated ${updatedCount} products`)
  process.exit(0)
}

run()
