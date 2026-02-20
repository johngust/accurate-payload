import configPromise from '@payload-config'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

async function uploadMedia() {
    const payload = await getPayload({ config: configPromise })

    const uploadDir = async (dir: string, prefix: string) => {
        const fullDir = path.resolve(process.cwd(), dir)
        if (!fs.existsSync(fullDir)) return

        if (fs.statSync(fullDir).isDirectory()) {
            const files = fs.readdirSync(fullDir)
            for (const file of files) {
                const filePath = path.join(fullDir, file)
                if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
                    console.log(`Uploading ${filePath}`)
                    try {
                        const data = fs.readFileSync(filePath)
                        const media = await payload.create({
                            collection: 'media',
                            data: {
                                alt: `${prefix} - ${path.parse(file).name}`,
                            },
                            file: {
                                data,
                                mimetype: 'image/png', // we know they are png from naming and curl
                                name: file,
                                size: data.byteLength,
                            },
                        })
                        console.log(`Uploaded! ID: ${media.id}`)
                    } catch (err) {
                        console.error(`Failed to upload ${filePath}`, err)
                    }
                }
            }
        } else {
            console.log(`Uploading ${fullDir}`)
            try {
                const data = fs.readFileSync(fullDir)
                const media = await payload.create({
                    collection: 'media',
                    data: {
                        alt: `${prefix}`,
                    },
                    file: {
                        data,
                        mimetype: 'image/png',
                        name: path.basename(fullDir),
                        size: data.byteLength,
                    },
                })
                console.log(`Uploaded! ID: ${media.id}`)
            } catch (err) {
                console.error(`Failed to upload ${fullDir}`, err)
            }
        }
    }

    try {
        console.log('Starting media upload...')
        await uploadDir('public/images/hero_banner.png', 'Hero Banner')
        await uploadDir('public/images/products', 'Product Mock')
        await uploadDir('public/images/categories', 'Category Mock')
        console.log('Media upload completed successfully.')
    } catch (error) {
        console.error('Error during media upload:', error)
    }

    process.exit(0)
}

uploadMedia()
