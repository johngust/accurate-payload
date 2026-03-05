import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Promotion } from '../../payload-types'

export const revalidatePromotion: CollectionAfterChangeHook<Promotion> = ({
    doc,
    req: { payload, context },
}) => {
    if (!context.disableRevalidate) {
        payload.logger.info(`Revalidating global promo caches...`)

        // Поскольку промо выводятся на главной странице и в категориях,
        // проще всего сбросить кэш главной страницы и страниц со списком товаров.
        revalidatePath('/')
        // В идеале мы могли бы ревалидировать только по тегам (revalidateTag('promotions')),
        // но в текущем проекте кэш сбрасывается по путям.
        // Если промо привязаны к конкретным категориям, можно было бы
        // добавить логику для сброса путей этих категорий.
    }
    return doc
}

export const revalidatePromotionDelete: CollectionAfterDeleteHook<Promotion> = ({
    doc,
    req: { context },
}) => {
    if (!context.disableRevalidate) {
        revalidatePath('/')
    }
    return doc
}
