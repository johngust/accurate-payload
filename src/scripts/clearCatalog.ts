import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function clearCatalog() {
  console.log('Инициализация Payload...')
  const payload = await getPayload({ config: configPromise })

  console.log('Очистка коллекции Products...')
  const products = await payload.delete({
    collection: 'products',
    where: { id: { exists: true } },
  })
  console.log(`Удалено товаров: ${products.errors.length > 0 ? 'ошибки' : 'все'}`)

  console.log('Очистка коллекции Categories...')
  const categories = await payload.delete({
    collection: 'categories',
    where: { id: { exists: true } },
  })
  console.log(`Удалено категорий: ${categories.errors.length > 0 ? 'ошибки' : 'все'}`)

  console.log('Каталог успешно очищен. Теперь можно запускать чистый импорт.')
  process.exit(0)
}

clearCatalog().catch(err => {
  console.error('Ошибка при очистке:', err)
  process.exit(1)
})
