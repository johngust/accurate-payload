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
      { title: 'Мебельные раковины', slug: 'mebelnye-rakoviny' },
      { title: 'Раковины над стиральной машиной', slug: 'rakoviny-nad-stiralnoj' },
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
      { title: 'Душевые стойки', slug: 'dushevye-stoyki' },
      { title: 'Смесители для душа', slug: 'smesiteli-dlya-dusha' },
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
    title: 'Биде',
    slug: 'bide',
    children: [
      { title: 'Подвесные биде', slug: 'podvesnye-bide' },
      { title: 'Напольные биде', slug: 'napolnye-bide' },
    ],
  },
]
