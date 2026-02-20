'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  orderID: string
}

type Props = {
  initialEmail?: string
}

export const FindOrderForm: React.FC<Props> = ({ initialEmail }) => {
  const router = useRouter()
  const { user } = useAuth()

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>({
    defaultValues: {
      email: initialEmail || user?.email,
    },
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      router.push(`/orders/${data.orderID}?email=${data.email}`)
    },
    [router],
  )

  return (
    <Fragment>
      <h1 className="text-xl mb-4">Найти мой заказ</h1>
      <div className="prose dark:prose-invert mb-8">
        <p>{`Пожалуйста, введите ваш адрес электронной почты и ID заказа ниже.`}</p>
      </div>
      <form className="max-w-lg flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Адрес электронной почты
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'Электронная почта обязательна.' })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>
        <FormItem>
          <Label htmlFor="orderID" className="mb-2">
            ID заказа
          </Label>
          <Input
            id="orderID"
            {...register('orderID', {
              required: 'ID заказа обязателен. Вы можете найти его в своем email.',
            })}
            type="text"
          />
          {errors.orderID && <FormError message={errors.orderID.message} />}
        </FormItem>
        <Button type="submit" className="self-start" variant="default">
          Найти мой заказ
        </Button>
      </form>
    </Fragment>
  )
}
