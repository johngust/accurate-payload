import { getPayload } from 'payload'
import config from '../payload.config'

const productsToImport = [
  {
    title: 'Унитаз-компакт безободковый Grossman GR-4455S',
    price: 105000,
    brand: 'Grossman',
    country: 'Германия',
    categoryName: 'Унитазы',
    description: 'Напольный унитаз-компакт с безободковой чашей и сиденьем микролифт.',
  },
  {
    title: 'Смеситель для ванны Lemark Luna LM4106C',
    price: 28500,
    brand: 'Lemark',
    country: 'Чехия',
    categoryName: 'Смесители',
    description: 'Классический смеситель для ванны с длинным изливом и душевым набором.',
  },
  {
    title: 'Ванна акриловая Aquanet West 170x70',
    price: 85000,
    brand: 'Aquanet',
    country: 'Россия',
    categoryName: 'Ванны',
    description: 'Современная акриловая ванна прямоугольной формы, устойчивая к повреждениям.',
  },
  {
    title: 'Раковина Santek Форум 60',
    price: 18000,
    brand: 'Santek',
    country: 'Россия',
    categoryName: 'Раковины',
    description: 'Универсальный умывальник с отверстием под смеситель.',
  },
  {
    title: 'Душевая кабина Grossman GR-121 (90x90)',
    price: 245000,
    brand: 'Grossman',
    country: 'Германия',
    categoryName: 'Душевые кабины',
    description: 'Компактная душевая кабина с низким поддоном и каленым стеклом.',
  },
  {
    title: 'Тумба с раковиной Aquaton Ария 60',
    price: 72000,
    brand: 'Aquaton',
    country: 'Россия',
    categoryName: 'Мебель для ванны',
    description: 'Влагостойкая тумба с выдвижными ящиками и керамической раковиной.',
  },
  {
    title: 'Биде подвесное Vitra S50',
    price: 55000,
    brand: 'Vitra',
    country: 'Турция',
    categoryName: 'Биде',
    description: 'Подвесное биде в современном минималистичном стиле.',
  },
  {
    title: 'Полотенцесушитель Terminus Аврора П6',
    price: 42000,
    brand: 'Terminus',
    country: 'Россия',
    categoryName: 'Полотенцесушители',
    description: 'Водяной полотенцесушитель из нержавеющей стали.',
  }
]

async function importFromVsedlyavanny() {
  const payload = await getPayload({ config })

  console.log('Начинаем импорт товаров...')

  for (const item of productsToImport) {
    try {
      // 1. Ищем или создаем категорию
      let category = await payload.find({
        collection: 'categories',
        where: { title: { equals: item.categoryName } },
        limit: 1,
      })

      let categoryId
      if (category.docs.length === 0) {
        const newCat = await payload.create({
          collection: 'categories',
          data: { title: item.categoryName },
        })
        categoryId = newCat.id
        console.log(`Создана категория: ${item.categoryName}`)
      } else {
        categoryId = category.docs[0].id
      }

      // 2. Создаем товар
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      await payload.create({
        collection: 'products',
        data: {
          title: item.title,
          slug: slug,
          priceInKZT: item.price,
          description: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [{ text: item.description, type: 'text', version: 1 }],
                  version: 1,
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          },
          categories: [categoryId],
          specs: [
            { key: 'Бренд', value: item.brand },
            { key: 'Страна', value: item.country },
          ],
          _status: 'published',
          inStock: 'in_stock',
        },
      })

      console.log(`Импортирован товар: ${item.title}`)
    } catch (error) {
      console.error(`Ошибка при импорте ${item.title}:`, error.message)
    }
  }

  console.log('Импорт завершен успешно.')
  process.exit(0)
}

importFromVsedlyavanny()
