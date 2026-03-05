import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const revalidateCollection: CollectionAfterChangeHook = ({
    doc,
    req: { payload, context },
}) => {
    if (!context.disableRevalidate) {
        payload.logger.info(`Revalidating collection: ${doc.slug || 'item'}...`)

        // Сбрасываем кэш главной страницы
        revalidatePath('/')

        // Если это категория, сбрасываем кэш всех страниц каталога
        // В Next.js revalidatePath('/') с 'layout' сбросит всё, но это может быть накладно.
        // Для простоты пока сбросим главную.
    }
    return doc
}

export const revalidateCollectionDelete: CollectionAfterDeleteHook = ({
    doc,
    req: { context },
}) => {
    if (!context.disableRevalidate) {
        revalidatePath('/')
    }
    return doc
}
