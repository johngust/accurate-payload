import configPromise from '@payload-config';
import * as cheerio from 'cheerio';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPayload } from 'payload';

const SITE_URL = 'https://vsedlyavanny.kz';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return await response.text();
}

async function extractUrlsFromSitemap(sitemapPath: string) {
  const urlFile = fs.existsSync('urls_all.txt') ? 'urls_all.txt' : 'urls.txt';
  if (fs.existsSync(urlFile)) {
    const content = fs.readFileSync(urlFile, 'utf8');
    const urls = content.split('\n').map(u => u.trim()).filter(Boolean);
    console.log(`Found ${urls.length} URLs in ${urlFile}`);
    return Array.from(new Set(urls)); // unique only
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls: string[] = [];
  const regex = /<loc>(http[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  console.log(`Debug: Total loc tags found via regex: ${urls.length}`);
  if (urls.length > 0) console.log(`Debug: First URL: ${urls[0]}`);
  return urls.filter((url) => url.includes('/shop/') && url.split('/').length > 5);
}

async function parseProductPage(url: string) {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    if (!title) return null;

    const priceText = $('.price').first().text().replace(/[^\d]/g, '');
    const price = priceText ? parseInt(priceText, 10) : 0;

    let imageUrl = '';
    const imgEl = $('.bx_bigimages_aligner img').first();
    if (imgEl.length) {
      imageUrl = imgEl.attr('src') || '';
    } else {
      const fallbackImg = $('img[itemprop="image"]').first().attr('src') || $('img[id$="_pict"]').first().attr('src');
      if (fallbackImg) imageUrl = fallbackImg;
    }
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = SITE_URL + imageUrl;
    }

    const descriptionHtml = $('#tabs-1').html()?.trim() || '';
    
    const specs: { key: string; value: string }[] = [];
    $('#tabs-2 dl dt').each((i, dt) => {
      const key = $(dt).text().trim();
      const value = $(dt).next('dd').text().trim();
      if (key && value) {
        specs.push({ key, value });
      }
    });

    return {
      title,
      price,
      imageUrl,
      descriptionHtml,
      specs,
      url,
    };
  } catch (err) {
    console.error(`Error parsing ${url}:`, err);
    return null;
  }
}

async function downloadAndUploadImage(payload: any, imageUrl: string, title: string) {
  if (!imageUrl) return null;
  
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;
    
    const tempPath = path.join(process.cwd(), '.next', filename);
    fs.writeFileSync(tempPath, Buffer.from(buffer));
    
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: title,
      },
      file: {
        data: fs.readFileSync(tempPath),
        name: filename,
        mimetype: response.headers.get('content-type') || 'image/jpeg',
        size: fs.statSync(tempPath).size,
      },
    });
    
    fs.unlinkSync(tempPath);
    return media.id;
  } catch (err) {
    console.error('Failed to upload image:', err);
    return null;
  }
}

async function run() {
  const payload = await getPayload({ config: configPromise });

  console.log('Fetching categories...');
  const categoriesRes = await payload.find({ collection: 'categories', limit: 300 });
  const catMap: Record<string, string> = {};
  categoriesRes.docs.forEach((cat) => {
    catMap[cat.title.toLowerCase()] = cat.id.toString();
  });
  
  console.log('Loading sitemap...');
  const urls = await extractUrlsFromSitemap('sitemap.xml');
  console.log(`Found ${urls.length} product URLs.`);
  
  console.log(`Starting import of all ${urls.length} products...`);
  
  let count = 0;
  for (const url of urls) {
    count++;
    console.log(`\n[${count}/${urls.length}] Fetching ${url}`);
    const productData = await parseProductPage(url);
    
    if (!productData || !productData.title) {
      console.log('Skipping - no product data found.');
      continue;
    }
    
    console.log(`Extracted: ${productData.title} | ${productData.price} KZT`);
    
    // Determine category based on URL segments first (more reliable)
    const urlSegments = url.split('/');
    // Example: https://vsedlyavanny.kz/shop/Smesiteli/Dushevaya_stoyka/...
    // Segments: ["https:", "", "vsedlyavanny.kz", "shop", "Smesiteli", "Dushevaya_stoyka", ...]
    const shopCategorySlug = urlSegments[4]; // "Smesiteli"
    const shopSubCategorySlug = urlSegments[5]; // "Dushevaya_stoyka"

    const urlToInternalMap: Record<string, string> = {
      'Smesiteli': 'Смесители',
      'Unitazy': 'Унитазы',
      'Vanny': 'Ванны',
      'Rakoviny': 'Раковины',
      'Polotencesushiteli': 'Полотенцесушители',
      'Bide': 'Биде',
      'Installyacii': 'Инсталляции',
      'Kukhonnye_moyki': 'Кухонные мойки',
      'Dushevye_poddony': 'Душевые поддоны',
      'Mebel_dlya_vannoy': 'Мебель для ванной',
    };

    let assignedCatId: string | null = null;
    
    // 1. Try to match by URL segment
    if (shopCategorySlug && urlToInternalMap[shopCategorySlug]) {
      assignedCatId = catMap[urlToInternalMap[shopCategorySlug].toLowerCase()];
    }
    
    // 2. Fallback to keyword matching in title if URL didn't match
    if (!assignedCatId) {
      const keywordMap: Record<string, string> = {
        'унитаз': 'Унитазы',
        'смеситель': 'Смесители',
        'ванна': 'Ванны',
        'раковин': 'Раковины',
        'душев': 'Душевые',
        'биде': 'Биде',
        'полотенцесушитель': 'Полотенцесушители',
        'мойк': 'Кухонные мойки',
        'инсталл': 'Инсталляции',
      };

      const lowerTitle = productData.title.toLowerCase();
      for (const [keyword, catTitle] of Object.entries(keywordMap)) {
        if (lowerTitle.includes(keyword)) {
          assignedCatId = catMap[catTitle.toLowerCase()];
          if (assignedCatId) break;
        }
      }
    }

    let mediaId = null;
    if (productData.imageUrl) {
      console.log(`Downloading image: ${productData.imageUrl}`);
      mediaId = await downloadAndUploadImage(payload, productData.imageUrl, productData.title);
    }
    
    try {
      const existing = await payload.find({
        collection: 'products',
        where: { title: { equals: productData.title } },
        limit: 1,
      });
      
      if (existing.docs.length > 0) {
        const product = existing.docs[0];
        // If product exists but has no categories, update it
        if ((!product.categories || product.categories.length === 0) && assignedCatId) {
          console.log(`Updating categories for existing product: ${productData.title}`);
          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              categories: [assignedCatId] as any
            },
          });
        } else {
          console.log(`Product already exists and has categories: ${productData.title}`);
        }
        continue;
      }
      
      const slug = productData.url.split('/').filter(Boolean).pop() || productData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      
      const newProduct = await payload.create({
        collection: 'products',
        data: {
          title: productData.title,
          slug,
          enableVariants: false,
          inStock: 'in_stock',
          categories: assignedCatId ? [assignedCatId] : [],
          specs: productData.specs.slice(0, 10).map(s => ({
            id: Math.random().toString(36).substring(7),
            key: s.key,
            value: s.value
          })),
          gallery: mediaId ? [{ image: mediaId }] : [],
          _status: 'published',
        } as any, // bypassing strict types for dynamic generation
      });
      
      if (productData.price > 0) {
          await payload.update({
             collection: 'products',
             id: newProduct.id,
             data: {
                 priceInKZTEnabled: true,
                 priceInKZT: productData.price
             } as any
          });
      }
      
      console.log(`✅ Created product: ${productData.title}`);
    } catch (err) {
      console.error(`Failed to create product in Payload:`, err);
    }
    
    await sleep(1000);
  }
  
  console.log('\nDone with batch!');
  process.exit(0);
}

run().catch(console.error);
