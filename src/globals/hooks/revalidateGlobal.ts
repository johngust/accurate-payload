import { revalidatePath } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateGlobal: GlobalAfterChangeHook = ({
    doc,
    req: { payload, context },
}) => {
    if (!context.disableRevalidate) {
        payload.logger.info(`Revalidating global: ${doc.slug}...`)

        // Глобальные элементы (шапка/подвал) есть на всех страницах.
        // Сбрасываем кэш всех страниц сразу.
        revalidatePath('/', 'layout')
    }
    return doc
}
