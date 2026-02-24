// ABOUTME: Дерево категорий раздела «Сантехника» santehnika-online.ru.
// ABOUTME: Подкатегории «Сантехника» становятся корневыми категориями нашего каталога.

import type { ParsedCategory } from './types'

export const categories: ParsedCategory[] = [
  {
    title: 'Унитазы',
    slug: 'unitazy',
    children: [
      { title: 'Напольные унитазы', slug: 'napolnye-unitazy' },
      { title: 'Подвесные унитазы', slug: 'podvesnye-unitazy' },
      { title: 'Компакт-унитазы', slug: 'kompakt-unitazy' },
      { title: 'Инсталляции', slug: 'installyacii' },
    ],
  },
  {
    title: 'Раковины',
    slug: 'rakoviny',
    children: [
      { title: 'Накладные раковины', slug: 'nakladnye-rakoviny' },
      { title: 'Врезные раковины', slug: 'vreznye-rakoviny' },
      { title: 'Раковины на пьедестале', slug: 'rakoviny-na-pedestale' },
      { title: 'Подвесные раковины', slug: 'podvesnye-rakoviny' },
    ],
  },
  {
    title: 'Ванны',
    slug: 'vanny',
    children: [
      { title: 'Акриловые ванны', slug: 'akrilovye-vanny' },
      { title: 'Чугунные ванны', slug: 'chugunnye-vanny' },
      { title: 'Стальные ванны', slug: 'stalnye-vanny' },
      { title: 'Отдельностоящие ванны', slug: 'otdelnostoyashchie-vanny' },
    ],
  },
  {
    title: 'Смесители',
    slug: 'smesiteli',
    children: [
      { title: 'Смесители для раковины', slug: 'smesiteli-dlya-rakoviny' },
      { title: 'Смесители для ванны', slug: 'smesiteli-dlya-vanny' },
      { title: 'Смесители для кухни', slug: 'smesiteli-dlya-kuhni' },
      { title: 'Смесители для душа', slug: 'smesiteli-dlya-dusha' },
    ],
  },
  {
    title: 'Душевые кабины',
    slug: 'dushevye-kabiny',
    children: [
      { title: 'Душевые уголки', slug: 'dushevye-ugolki' },
      { title: 'Душевые двери', slug: 'dushevye-dveri' },
      { title: 'Душевые поддоны', slug: 'dushevye-poddony' },
    ],
  },
  {
    title: 'Полотенцесушители',
    slug: 'polotencesushiteli',
    children: [
      { title: 'Водяные полотенцесушители', slug: 'vodyanye-polotencesushiteli' },
      { title: 'Электрические полотенцесушители', slug: 'elektricheskie-polotencesushiteli' },
    ],
  },
  {
    title: 'Мебель для ванной',
    slug: 'mebel-dlya-vannoj',
    children: [
      { title: 'Тумбы с раковиной', slug: 'tumby-s-rakovinoj' },
      { title: 'Зеркальные шкафы', slug: 'zerkalnye-shkafy' },
      { title: 'Пеналы', slug: 'penaly' },
    ],
  },
  {
    title: 'Аксессуары для ванной',
    slug: 'aksessuary-dlya-vannoj',
    children: [
      { title: 'Держатели полотенец', slug: 'derzhateli-polotenec' },
      { title: 'Дозаторы мыла', slug: 'dozatory-myla' },
      { title: 'Крючки', slug: 'kryuchki' },
    ],
  },
]
