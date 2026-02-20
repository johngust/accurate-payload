import { Banner } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Добро пожаловать в вашу панель управления!</h4>
      </Banner>
      Вот что нужно сделать дальше:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' с несколькими товарами и страницами, чтобы быстро запустить проект, затем '}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">посетите ваш сайт</a>
          {', чтобы увидеть результат.'}
        </li>
        <li>
          {'Head over to '}
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe, чтобы получить API ключи
          </a>
          {
            '. Создайте новый аккаунт, если нужно, затем скопируйте их в переменные окружения и перезапустите сервер. См. '
          }
          <a
            href="https://github.com/payloadcms/payload/blob/main/templates/ecommerce/README.md#stripe"
            rel="noopener noreferrer"
            target="_blank"
          >
            README
          </a>
          {' для подробностей.'}
        </li>
        <li>
          {'Отредактируйте ваши '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            коллекции
          </a>
          {' и добавьте больше '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            полей
          </a>
          {' по необходимости. Если вы новичок в Payload, мы рекомендуем ознакомиться с разделом '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Начало работы
          </a>
          {'.'}
        </li>
      </ul>
      {'Совет: Этот блок — '}
      <a
        href="https://payloadcms.com/docs/admin/components#base-component-overrides"
        rel="noopener noreferrer"
        target="_blank"
      >
        кастомный компонент
      </a>
      , вы можете удалить его в любое время, обновив ваш <strong>payload.config</strong>.
    </div>
  )
}
