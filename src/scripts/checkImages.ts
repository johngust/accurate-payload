import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  const payload = await getPayload({ config });
  
  const products = await payload.find({ 
    collection: 'products', 
    limit: 5,
    sort: '-createdAt'
  });
  
  console.log('--- Проверка изображений товаров ---');
  for (const p of products.docs) {
    console.log(`Товар: ${p.title}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Галерея: ${JSON.stringify(p.gallery)}`);
    
    if (p.gallery && p.gallery.length > 0 && p.gallery[0].image) {
      const mediaId = typeof p.gallery[0].image === 'object' ? p.gallery[0].image.id : p.gallery[0].image;
      const media = await payload.findByID({
        collection: 'media',
        id: mediaId,
      });
      console.log(`URL изображения: ${media.url}`);
    } else {
      console.log('Изображение отсутствует');
    }
    console.log('---');
  }
  
  process.exit(0);
}

run();
