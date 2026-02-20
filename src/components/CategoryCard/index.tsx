import type { Category } from '@/payload-types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
    category: Pick<Category, 'title' | 'slug'>
}

export const CategoryCard: React.FC<Props> = ({ category }) => {
    return (
        <Link
            href={`/catalog/${category.slug}`}
            className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-secondary p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md hover:bg-secondary/80"
        >
            <span className="font-heading text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                {category.title}
            </span>
            <div className="absolute bottom-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
                    Перейти <ChevronRight className="ml-1 h-3 w-3" />
                </span>
            </div>
        </Link>
    )
}
