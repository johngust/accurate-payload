import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  console.log('Fetching categories...')
  const categoriesRes = await payload.find({ collection: 'categories', limit: 300 })
  const catMap: Record<string, any> = {}
  categoriesRes.docs.forEach(cat => {
    catMap[cat.title.toLowerCase()] = cat.id
  })

  console.log('Fetching all products...')
  const productsRes = await payload.find({ collection: 'products', limit: 10000, depth: 0 })
  console.log('Processing ' + productsRes.totalDocs + ' products...')

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
    'поддон': 'Душевые поддоны',
    'зеркало': 'Зеркала',
    'тумба': 'Мебель для ванной',
    'шкаф': 'Мебель для ванной',
  }

  let updatedCount = 0
  
  for (const product of productsRes.docs) {
    const title = product.title.toLowerCase()
    let assignedCatId: any = null

    for (const [keyword, catTitle] of Object.entries(keywordMap)) {
      if (title.includes(keyword)) {
        assignedCatId = catMap[catTitle.toLowerCase()]
        if (assignedCatId) break
      }
    }

    if (assignedCatId) {
      // Check if already assigned to this specific category to avoid redundant updates
      const currentCats = product.categories || []
      if (currentCats.includes(assignedCatId)) continue

      await payload.update({
        collection: 'products',
        id: product.id,
        data: {
          categories: [assignedCatId]
        } as any
      })
      updatedCount++
      if (updatedCount % 50 === 0) console.log('Updated ' + updatedCount + ' products...')
    }
  }

  console.log('\nSuccessfully linked ' + updatedCount + ' products to categories.')
  process.exit(0)
}

run()
