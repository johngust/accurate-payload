import { CategoryCard } from '@/components/CategoryCard'
import type { Category } from '@/payload-types'
import React from 'react'

type Props = {
    title?: string
    categories?: (number | string | Category)[]
}

export const CategoriesGridBlock: React.FC<Props> = ({ title, categories }) => {
    return (
        <section className="container py-8">
            {title && (
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
                {categories?.map((cat, index) => {
                    if (typeof cat === 'object' && cat !== null) {
                        return <CategoryCard key={cat.id || index} category={cat} />
                    }
                    return null
                })}
            </div>
        </section>
    )
}
