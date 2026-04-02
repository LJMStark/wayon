import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

const DATA_DIR = path.join(process.cwd(), 'data');
const ASSETS_DIR = path.join(process.cwd(), 'wayon-web', 'public', 'assets', 'products');

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
    });
    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(filename))
        .on('finish', () => resolve(true))
        .on('error', e => reject(e));
    });
  } catch (error) {
    console.error(`图片下载失败: ${url} - ${error.message}`);
    return false;
  }
}

async function scrapeProducts() {
  await fs.ensureDir(ASSETS_DIR);
  const categoriesFile = path.join(DATA_DIR, 'categories.json');
  if (!fs.existsSync(categoriesFile)) {
    console.error('categories.json 不存在');
    return;
  }
  
  const categories = await fs.readJson(categoriesFile);
  const browser = await chromium.launch({ headless: true });
  const allProducts = [];

  // 为节省时间，此示例我们先抓取前 3 个核心大分类作为验证，然后再大规模扩容全站
  const targetCategories = categories.filter(c => 
    c.url.includes('quartz') || c.url.includes('terrazzo') || c.url.includes('flexible-stone')
  ).slice(0, 5);

  for (const category of targetCategories) {
    console.log(`正在抓取分类: ${category.title} (${category.url})`);
    const page = await browser.newPage();
    try {
      await page.goto(category.url, { waitUntil: 'load', timeout: 30000 });
      
      const products = await page.evaluate(() => {
        // 分析主页常见的列表 DOM
        const items = [];
        const cards = document.querySelectorAll('.pro-item, .item, li > a');
        cards.forEach(card => {
          const imgEl = card.querySelector('img');
          let linkEl = card.closest('a') || card;
          if (linkEl && linkEl.tagName !== 'A') {
              linkEl = card.querySelector('a');
          }
          const titleEl = card.querySelector('h3, .title, .name');
          
          if (imgEl && imgEl.src && linkEl && linkEl.href) {
             const title = titleEl ? titleEl.innerText.trim() : (imgEl.alt || 'Unknown Product');
             items.push({
               title,
               url: linkEl.href,
               imageSrc: imgEl.src,
             });
          }
        });
        return Array.from(new Map(items.map(item => [item.url, item])).values());
      });

      console.log(`    找到 ${products.length} 个产品`);
      
      for (const product of products) {
        if (!product.imageSrc.startsWith('http')) continue;
        const imgName = path.basename(new URL(product.imageSrc).pathname);
        const imgPath = path.join(ASSETS_DIR, imgName);
        
        // 如果文件不存在再下载拉取
        if (!fs.existsSync(imgPath)) {
          await downloadImage(product.imageSrc, imgPath);
        }
        product.localImage = `/assets/products/${imgName}`;
        product.category = category.title;
        allProducts.push(product);
      }
    } catch (e) {
      console.error(`    拉取失败 ${category.title}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  
  const productsFile = path.join(DATA_DIR, 'products.json');
  let existingProducts = [];
  if (fs.existsSync(productsFile)) {
    existingProducts = await fs.readJson(productsFile);
  }
  
  // 合并更新
  const merged = Array.from(new Map([...existingProducts, ...allProducts].map(item => [item.url, item])).values());
  await fs.writeJson(productsFile, merged, { spaces: 2 });
  
  console.log(`成功保存了 ${merged.length} 个产品数据到 products.json`);
}

scrapeProducts().catch(console.error);
