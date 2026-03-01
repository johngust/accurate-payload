import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  const payload = await getPayload({ config });
  
  // Проверим последние 10 товаров
  const products = await payload.find({ 
    collection: 'products', 
    limit: 10,
    sort: '-createdAt'
  });
  
  console.log('--- Последние 10 товаров ---');
  products.docs.forEach(p => {
    console.log(`Название: ${p.title}`);
    console.log(`Статус: ${p._status}`);
    console.log(`Категории: ${JSON.stringify(p.categories)}`);
    console.log(`Slug: ${p.slug}`);
    console.log('---');
  });

  // Проверим, есть ли вообще опубликованные товары с категориями
  const publishedWithCat = await payload.find({
    collection: 'products',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { categories: { exists: true } }
      ]
    },
    limit: 1
  });

  console.log(`
Всего товаров: ${products.totalDocs}`);
  console.log(`Опубликовано с категориями: ${publishedWithCat.totalDocs}`);
  
  process.exit(0);
}

run();
