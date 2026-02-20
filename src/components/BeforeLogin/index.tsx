import React from 'react'

export const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Добро пожаловать в вашу панель управления!</b>
        {' Здесь администраторы сайта входят в систему для управления магазином. Клиентам необходимо '}
        <a href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/login`}>войти на сам сайт</a>
        {' для доступа к аккаунту, истории заказов и прочему.'}
      </p>
    </div>
  )
}
