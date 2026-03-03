import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  
  const categories = await payload.find({ collection: 'categories', limit: 500, depth: 0 })
  const products = await payload.find({ collection: 'products', limit: 10000, depth: 0 })
  
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
    'зеркало': 'Зеркала',
    'тумба': 'Мебель для ванной',
  }

  let fixed = 0
  const tasks = []

  for (const p of products.docs) {
    if (!p.categories || p.categories.length === 0) {
      const title = p.title.toLowerCase()
      let targetCatId = null
      
      for (const [key, val] of Object.entries(keywordMap)) {
        if (title.includes(key)) {
          const found = categories.docs.find(c => c.title.toLowerCase().includes(val.toLowerCase()))
          if (found) {
            targetCatId = found.id
            break
          }
        }
      }
      
      if (targetCatId) {
        tasks.push({ id: p.id, catId: targetCatId })
      }
    }
  }

  console.log('Found ' + tasks.length + ' products to fix. Updating in batches...')

  const BATCH_SIZE = 50
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(t => 
      payload.update({
        collection: 'products',
        id: t.id,
        data: { categories: [t.catId] } as any
      })
    ))
    fixed += batch.length
    console.log('Processed ' + fixed + '/' + tasks.length)
  }
  
  console.log('Successfully fixed ' + fixed + ' products.')
  process.exit(0)
}

run()
