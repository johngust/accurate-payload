import configPromise from '@payload-config';
import 'dotenv/config';
import { getPayload } from 'payload';

async function run() {
    const payload = await getPayload({ config: configPromise })
    try {
        // В Payload CMS миграции недоступны как коллекция, поэтому выполняем SQL-запрос напрямую через drizzle
        await payload.db.drizzle.execute(`DELETE FROM payload_migrations WHERE name = 'dev'`);
        console.log('✅ Успешно удалена миграция dev');
    } catch (e) {
        console.log('❌ Ошибка при удалении миграции:', e);
    }
    process.exit(0);
}

run();
