import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import { getPayload } from 'payload'

async function findCategory() {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
        collection: 'categories',
        where: {
            title: {
                contains: 'смесители',
            },
        },
    })
    fs.writeFileSync('category_search_results.json', JSON.stringify(result.docs, null, 2))
    process.exit(0)
}

findCategory().catch(err => {
    console.error(err)
    process.exit(1)
})
