import * as LucideIcons from 'lucide-react'
import React from 'react'

type ServiceProp = {
    id?: string | null
    iconName?: string | null
    title?: string | null
    description?: string | null
}

type Props = {
    title?: string
    services?: ServiceProp[] | null
}

export const ServicesBlockComponent: React.FC<Props> = ({ title, services }) => {
    return (
        <section className="container py-12">
            {title && (
                <h2 className="mb-8 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {services?.map((service, index) => {
                    const IconComponent = service.iconName
                        ? (LucideIcons as any)[service.iconName] || LucideIcons.Info
                        : LucideIcons.Info

                    return (
                        <div key={service.id || index} className="flex flex-col items-center rounded-2xl bg-secondary/50 p-6 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
                                <IconComponent className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-2 font-heading text-lg font-semibold">{service.title}</h3>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
