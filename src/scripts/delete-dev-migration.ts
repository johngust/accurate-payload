import { getPayload } from 'payload';
import config from '../payload.config';
import 'dotenv/config';

async function deleteDevMigration() {
  const payload = await getPayload({ config });
  
  try {
    console.log('Attempting to delete "dev" migration record via raw SQL...');
    
    const db: any = payload.db;
    
    // Пытаемся удалить через SQL напрямую, если это Postgres
    if (db && db.drizzle) {
      await db.drizzle.execute('DELETE FROM payload_migrations WHERE name = \'dev\'');
      console.log('SUCCESS: Запись "dev" была удалена через Drizzle SQL.');
    } else if (db && db.pool) {
      await db.pool.query('DELETE FROM payload_migrations WHERE name = \'dev\'');
      console.log('SUCCESS: Запись "dev" была удалена через PG Pool.');
    } else {
      // Попытка через API как крайняя мера
      try {
        await payload.delete({
          collection: 'payload-migrations' as any,
          where: {
            name: {
              equals: 'dev',
            },
          },
        });
        console.log('SUCCESS: Запись "dev" была удалена через Payload API.');
      } catch (e) {
        console.error('API delete failed, might not be a collection.');
      }
    }
  } catch (err: any) {
    console.error('ERROR during deletion:', err.message);
  }
  process.exit(0);
}

deleteDevMigration().catch(console.error);
