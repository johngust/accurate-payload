import { getPayload } from 'payload';
import config from '../payload.config';
import 'dotenv/config';

async function analyze() {
  const payload = await getPayload({ config });
  const products = await payload.find({ 
    collection: 'products', 
    limit: 10000, 
    overrideAccess: true, 
    select: { categories: true, _status: true } 
  });
  
  const stats: any = { 
    total: products.totalDocs,
    published: 0, 
    draft: 0,
    noCategory: 0, 
    byCat: {}, 
  };
  
  products.docs.forEach(p => {
    if (p._status === 'published') stats.published++;
    else stats.draft++;
    
    if (!p.categories || p.categories.length === 0) {
      stats.noCategory++;
    } else {
      p.categories.forEach((c: any) => {
        const id = typeof c === 'object' ? c.id : c;
        stats.byCat[id] = (stats.byCat[id] || 0) + 1;
      });
    }
  });
  
  console.log(JSON.stringify(stats, null, 2));
}

analyze().catch(console.error);
