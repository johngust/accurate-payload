'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

// Mock filter options based on Santehnika Clone design
const filterOptions = {
    inStock: [
        { label: 'В наличии', value: 'in_stock' },
        { label: 'Под заказ', value: 'preorder' },
    ],
    price: [
        { label: 'До 5 000 ₽', value: 'under_5k' },
        { label: '5 000 - 15 000 ₽', value: '5k_to_15k' },
        { label: 'Более 15 000 ₽', value: 'over_15k' },
    ],
}

export const FiltersSidebar: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (params.get(key) === value) {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 font-heading text-lg font-semibold">Фильтры</h3>

                <Accordion type="multiple" defaultValue={['inStock', 'price']} className="w-full">
                    <AccordionItem value="inStock">
                        <AccordionTrigger className="font-medium hover:no-underline">Наличие</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-3 py-2">
                                {filterOptions.inStock.map((option) => (
                                    <label key={option.value} className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={searchParams.get('inStock') === option.value}
                                            onChange={() => handleFilterChange('inStock', option.value)}
                                        />
                                        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price">
                        <AccordionTrigger className="font-medium hover:no-underline">Цена</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-3 py-2">
                                {filterOptions.price.map((option) => (
                                    <label key={option.value} className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={searchParams.get('price') === option.value}
                                            onChange={() => handleFilterChange('price', option.value)}
                                        />
                                        <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
