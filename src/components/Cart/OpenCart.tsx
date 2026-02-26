import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { ShoppingCart } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      variant="clear"
      size="clear"
      className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors relative"
      {...rest}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {quantity ? (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {quantity}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] mt-1">Корзина</span>
    </Button>
  )
}
