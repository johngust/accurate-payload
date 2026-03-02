import { getPayload } from 'payload';
import config from '../payload.config';
import 'dotenv/config';

async function listCategories() {
  const payload = await getPayload({ config });
  const cats = await payload.find({ 
    collection: 'categories', 
    limit: 100, 
    overrideAccess: true, 
    select: { title: true, slug: true } 
  });
  
  console.log(JSON.stringify(cats.docs.map(c => ({ id: c.id, title: c.title, slug: c.slug })), null, 2));
}

listCategories().catch(console.error);
