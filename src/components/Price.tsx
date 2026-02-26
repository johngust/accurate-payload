'use client'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

const KZT_CURRENCY = {
  code: 'KZT',
  decimals: 0,
  label: 'Tenge',
  symbol: '₸',
}

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { currency: activeCurrency, formatCurrency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps === 'KZT') return KZT_CURRENCY
    if (currencyCodeFromProps) {
      return (
        supportedCurrencies?.find((currency) => currency.code === currencyCodeFromProps) ||
        KZT_CURRENCY
      )
    }
    // Если плагин еще не загрузил валюту или по умолчанию стоит USD, форсируем KZT
    if (!activeCurrency || activeCurrency.code === 'USD') {
      return KZT_CURRENCY
    }
    return activeCurrency
  }, [currencyCodeFromProps, supportedCurrencies, activeCurrency])

  const formattedAmount = (val: number) => {
    // Жестко форматируем в тенге, чтобы избежать проблем с инициализацией плагина
    const formatted = new Intl.NumberFormat('ru-KZ', {
      minimumFractionDigits: 0,
    }).format(val)
    return `${formatted} ₸`
  }

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formattedAmount(amount)}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formattedAmount(lowestAmount)} - ${formattedAmount(highestAmount)}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formattedAmount(lowestAmount)}`}
      </Element>
    )
  }

  return null
}
