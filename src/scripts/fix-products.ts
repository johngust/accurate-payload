import { getPayload } from 'payload';
import config from '../payload.config';
import 'dotenv/config';

async function fixProducts() {
  const payload = await getPayload({ config });
  
  console.log('Fetching categories...');
  const categoriesRes = await payload.find({ collection: 'categories', limit: 200 });
  const catMap: Record<string, any> = {};
  categoriesRes.docs.forEach(cat => {
    catMap[cat.title.toLowerCase()] = cat.id;
  });

  console.log('Searching for products without categories...');
  const products = await payload.find({
    collection: 'products',
    where: {
      or: [
        { categories: { exists: false } },
        { categories: { size: 0 } } as any,
        { categories: { equals: null } }
      ]
    },
    limit: 5000,
    overrideAccess: true,
    select: { id: true, title: true }
  });

  console.log(`Found ${products.totalDocs} products to fix.`);

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
    'лейка': 'Смесители',
    'сифон': 'Аксессуары',
  };

  let fixedCount = 0;
  let errorCount = 0;

  // Process in batches of 20
  const batchSize = 20;
  for (let i = 0; i < products.docs.length; i += batchSize) {
    const batch = products.docs.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (product) => {
      let assignedCatId: any = null;
      const lowerTitle = product.title.toLowerCase();
      for (const [keyword, catTitle] of Object.entries(keywordMap)) {
        if (lowerTitle.includes(keyword)) {
          assignedCatId = catMap[catTitle.toLowerCase()];
          if (assignedCatId) break;
        }
      }

      if (assignedCatId) {
        try {
          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              categories: [assignedCatId]
            },
            overrideAccess: true,
          });
          fixedCount++;
        } catch (err: any) {
          errorCount++;
        }
      }
    }));
    
    console.log(`Processed ${i + batch.length}/${products.totalDocs}... Fixed: ${fixedCount}`);
  }

  console.log(`Successfully fixed ${fixedCount} products. Errors: ${errorCount}`);
}

fixProducts().catch(console.error);
