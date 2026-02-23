// ABOUTME: Редирект со старого маршрута /shop на /catalog.
// ABOUTME: Сохраняет обратную совместимость с существующими ссылками.

import { redirect } from 'next/navigation'

export default function ShopPage() {
  redirect('/catalog')
}
