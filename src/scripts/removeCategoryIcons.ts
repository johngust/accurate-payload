import { getPayload } from 'payload'
import configPromise from '@payload-config'
import 'dotenv/config'

async function run() {
  const p = await getPayload({ config: configPromise })
  const pages = await p.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })

  if (pages.docs.length > 0) {
    const home = pages.docs[0]
    
    // Фильтруем блоки, удаляя CategoryIconsRow
    const newLayout = home.layout?.filter((block: any) => block.blockType !== 'categoryIconsRow')
    
    await p.update({
      collection: 'pages',
      id: home.id,
      data: {
        layout: newLayout
      },
      context: { disableRevalidate: true }
    })
    console.log('Блок с иконками категорий успешно удален с главной страницы')
  } else {
    console.log('Главная страница не найдена')
  }
  process.exit(0)
}

run()
