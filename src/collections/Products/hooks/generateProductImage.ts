import type { CollectionBeforeChangeHook } from 'payload'

export const generateProductImage: CollectionBeforeChangeHook = async ({
    data,
    req,
    operation,
}) => {
    if (operation === 'create') {
        // 1. Проверяем, есть ли уже картинки в галерее
        const hasImages = data.gallery && data.gallery.length > 0

        // 2. Если картинок нет и указана категория
        if (!hasImages && data.categories && data.categories.length > 0) {
            try {
                // Достаем первую категорию (или ищем ту, где есть promptTemplate)
                const categoryId = typeof data.categories[0] === 'object' ? data.categories[0].id : data.categories[0]

                const category = await req.payload.findByID({
                    collection: 'categories',
                    id: categoryId,
                })

                // Проверяем, если есть шаблон промпта
                // @ts-ignore - Ignore type error as types might not be regenerated yet
                if (category && category.promptTemplate) {
                    // 3. Формируем финальный промпт
                    // @ts-ignore
                    const finalPrompt = category.promptTemplate.replace(/\[НАЗВАНИЕ ТОВАРА\]/gi, data.title)

                    req.payload.logger.info(`Генерация изображения для товара "${data.title}" по промпту: ${finalPrompt}`)

                    // 4. Проверяем наличие API-ключа Gemini
                    const apiKey = process.env.GEMINI_API_KEY
                    if (!apiKey) {
                        req.payload.logger.warn('GEMINI_API_KEY не задан в .env. Пропуск генерации изображения.')
                        return data
                    }

                    // 5. Делаем запрос к Google Gemini Pro Vision (Imagen 3)
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            instances: [
                                {
                                    prompt: finalPrompt,
                                }
                            ],
                            parameters: {
                                sampleCount: 1,
                                aspectRatio: "1:1",
                                outputOptions: {
                                    mimeType: "image/png"
                                }
                            }
                        }),
                    })

                    if (!response.ok) {
                        const errorData = await response.text()
                        req.payload.logger.error(`Ошибка API Gemini: ${errorData}`)
                        return data
                    }

                    const responseData = await response.json()

                    if (!responseData.predictions || responseData.predictions.length === 0) {
                        req.payload.logger.error('Gemini API не вернул изображение')
                        return data
                    }

                    // Gemini возвращает изображение в формате base64
                    const base64Image = responseData.predictions[0].bytesBase64Encoded
                    const buffer = Buffer.from(base64Image, 'base64')

                    // 6. Сохраняем как медиафайл в Payload (уйдет в Vercel Blob)
                    const fileName = `${data.slug || 'product'}-${Date.now()}.png`

                    const media = await req.payload.create({
                        collection: 'media',
                        data: {
                            alt: `Изображение для: ${data.title}`,
                        },
                        file: {
                            data: buffer,
                            name: fileName,
                            mimetype: 'image/png',
                            size: buffer.length,
                        },
                    })

                    // 7. Привязываем полученную картинку к товару
                    req.payload.logger.info(`Изображение успешно сгенерировано (Gemini) и сохранено (ID: ${media.id})`)
                    data.gallery = [
                        {
                            image: media.id,
                        }
                    ]
                } else {
                    req.payload.logger.info(`У категории "${category?.title}" нет шаблона promptTemplate. Пропуск генерации.`)
                }
            } catch (error) {
                req.payload.logger.error(`Произошла ошибка при генерации изображения: ${error}`)
            }
        }
    }

    return data
}
