import 'dotenv/config'
import pg from 'pg'

const { Client } = pg

const run = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    const start = Date.now()
    await client.connect()
    console.log(`Connected in ${Date.now() - start}ms`)

    const res = await client.query('SELECT current_database(), now()')
    console.log('Query result:', res.rows[0])
    console.log(`Query took ${Date.now() - start}ms total`)

    await client.end()
  } catch (err) {
    console.error('Error connecting to database:', err)
  }
}

run()
