import { CategoryCard } from '@/components/CategoryCard'
import type { Category } from '@/payload-types'
import React from 'react'

type Props = {
    title?: string
    categories?: (number | string | Category)[]
}

export const CategoriesGridBlock: React.FC<Props> = ({ title, categories }) => {
    return (
        <section className="container py-12">
            {title && (
                <h2 className="mb-8 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
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
