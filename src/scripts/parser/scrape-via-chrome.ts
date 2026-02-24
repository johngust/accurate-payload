// ABOUTME: Скрипт для парсинга santehnika-online.ru через Chrome DevTools Protocol.
// ABOUTME: Запускается вручную, результат сохраняется в parsed-data.json.

// Этот скрипт нужно запускать вручную через Chrome console или через
// claude-in-chrome MCP. Он собирает данные и сохраняет их.
//
// Для автоматизации: используйте функцию parseProductPage() на каждой
// странице товара, а parseCategoryPage() на странице категории.

export const CATEGORIES_TO_PARSE = [
  { title: 'Унитазы', path: '/unitazy/', slug: 'unitazy' },
  { title: 'Раковины', path: '/rakoviny/', slug: 'rakoviny' },
  { title: 'Ванны', path: '/vanny/', slug: 'vanny' },
  { title: 'Смесители', path: '/smesiteli/', slug: 'smesiteli' },
  { title: 'Полотенцесушители', path: '/polotencesushiteli/', slug: 'polotencesushiteli' },
  { title: 'Биде', path: '/bide/', slug: 'bide' },
]

// JS код для выполнения на странице категории — собирает ссылки на товары
export const PARSE_CATEGORY_JS = `
(function() {
  const links = Array.from(document.querySelectorAll('a'));
  return links
    .filter(a => a.href.includes('/product/'))
    .map(a => new URL(a.href, location.origin).pathname)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 7);
})()
`

// JS код для выполнения на странице товара — парсит все данные
export const PARSE_PRODUCT_JS = `
(function() {
  const body = document.body.innerText;
  const result = {};
  result.title = document.querySelector('h1')?.textContent?.trim() || '';
  const priceMatch = body.match(/(\\d[\\d\\s]+)\\s*₽/);
  result.price = priceMatch ? parseInt(priceMatch[1].replace(/\\s/g, '')) : 0;
  const codeMatch = body.match(/Код товара:\\s*(\\d+)/);
  result.productCode = codeMatch ? codeMatch[1] : '';
  const artMatch = body.match(/Артикул\\n([^\\n]+)/);
  result.sku = artMatch ? artMatch[1].trim() : '';
  result.inStock = body.includes('В наличии') ? 'in_stock' : body.includes('Под заказ') ? 'preorder' : 'out_of_stock';
  const specsSection = body.match(/Характеристики\\n([\\s\\S]*?)(?:\\nВсе характеристики|\\nОтзывы|\\nДоставка)/);
  const specs = [];
  if (specsSection) {
    const lines = specsSection[1].split('\\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < lines.length - 1; i += 2) {
      const key = lines[i];
      const val = lines[i + 1];
      if (key && val && key.length < 50 && !key.includes('₽') && !val.includes('₽')) {
        specs.push({ key: key, value: val });
      }
    }
  }
  result.specs = specs;
  const imgs = Array.from(document.querySelectorAll('img'))
    .filter(img => img.alt && img.alt.length > 10 && img.naturalWidth > 100)
    .map(img => img.src)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);
  result.images = imgs;
  const ratingMatch = body.match(/(\\d[.,]\\d)\\s*\\n\\s*(\\d+)\\s*отзыв/);
  result.rating = ratingMatch ? { value: parseFloat(ratingMatch[1].replace(',', '.')), count: parseInt(ratingMatch[2]) } : null;
  return JSON.stringify(result);
})()
`
