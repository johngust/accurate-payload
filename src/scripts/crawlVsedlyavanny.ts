import * as cheerio from 'cheerio';
import fs from 'fs';

const SITE_URL = 'https://vsedlyavanny.kz';

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  if (!response.ok) return '';
  return await response.text();
}

async function run() {
  console.log('Crawling categories...');
  const catalogHtml = await fetchHtml(`${SITE_URL}/catalog/`);
  if (!catalogHtml) {
    console.log('Failed to fetch catalog page');
    return;
  }
  const $ = cheerio.load(catalogHtml);
  
  const categoryUrls: string[] = [];
  $('.category-menu a, .catalog-section-list a').each((i, el) => {
    let url = $(el).attr('href');
    if (url && url.startsWith('/')) url = SITE_URL + url;
    if (url && !categoryUrls.includes(url) && (url.includes('/shop/') || url.includes('/catalog/'))) {
      categoryUrls.push(url);
    }
  });
  
  console.log(`Found ${categoryUrls.length} category links.`);
  
  const productUrls = new Set<string>();
  
  for (const catUrl of categoryUrls) {
    console.log(`Scanning category: ${catUrl}`);
    let currentUrl = catUrl;
    
    // Safety limit for pages per category
    let pages = 0;
    while (currentUrl && pages < 20) {
      pages++;
      const html = await fetchHtml(currentUrl);
      if (!html) break;
      const $cat = cheerio.load(html);
      
      let foundInPage = 0;
      $cat('.main-product-block, .catalog-item, .bx_catalog_item').each((i, el) => {
        let pUrl = $cat(el).find('.product-descr a, .slider-addtocart a, .bx_catalog_item_title a, a').first().attr('href');
        if (pUrl && pUrl.startsWith('/')) pUrl = SITE_URL + pUrl;
        if (pUrl && pUrl.includes('/shop/') && pUrl.split('/').length > 5) {
          productUrls.add(pUrl);
          foundInPage++;
        }
      });
      
      console.log(`  Page ${pages}: Found ${foundInPage} products.`);
      
      // Try multiple selectors for next page
      const nextLink = $cat('.modern-page-next, a:contains("След."), .bx-pagination-container a:contains("Next"), .bx-pagination-container .bx-active + li a').first().attr('href');
      if (nextLink && !nextLink.startsWith('javascript')) {
        const nextUrl = nextLink.startsWith('http') ? nextLink : SITE_URL + nextLink;
        if (nextUrl !== currentUrl) {
          currentUrl = nextUrl;
        } else {
          currentUrl = '';
        }
      } else {
        currentUrl = '';
      }
      
      if (foundInPage === 0 && pages === 1) break; 
    }
  }
  
  const allUrls = Array.from(productUrls);
  fs.writeFileSync('urls_all.txt', allUrls.join('\n'));
  console.log(`\nFinished! Total unique products found: ${allUrls.length}`);
}

run().catch(console.error);
