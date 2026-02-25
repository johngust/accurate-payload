// ABOUTME: Ряд из 3 сервисных карточек с иконками Lucide.
// ABOUTME: Рассрочка, установка, доставка — информационные карточки-ссылки.

import * as LucideIcons from 'lucide-react'
import Link from 'next/link'

type Card = {
  iconName: string
  title: string
  description?: string | null
  link?: { url?: string | null } | null
  id?: string | null
}

type Props = {
  cards?: Card[] | null
}

export const ServiceCardsBlock: React.FC<Props> = ({ cards }) => {
  if (!cards?.length) return null

  return (
    <section className="container py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const IconComponent = card.iconName
            ? ((LucideIcons as any)[card.iconName] || LucideIcons.Info)
            : LucideIcons.Info
          const Wrapper = card.link?.url ? Link : 'div'
          const wrapperProps = card.link?.url ? { href: card.link.url } : {}

          return (
            <Wrapper
              key={card.id || i}
              {...(wrapperProps as any)}
              className="flex items-start gap-4 rounded-2xl bg-secondary/50 p-5 transition-colors hover:bg-secondary"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold">{card.title}</h3>
                {card.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                )}
              </div>
            </Wrapper>
          )
        })}
      </div>
    </section>
  )
}
