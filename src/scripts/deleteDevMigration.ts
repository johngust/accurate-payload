import pg from 'pg'
import 'dotenv/config'

async function run() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    await client.query("DELETE FROM payload_migrations WHERE name = 'dev'")
    console.log('dev migration deleted')
    await client.end()
  } catch (err) {
    console.error('Error deleting dev migration:', err)
  }
}

run()
