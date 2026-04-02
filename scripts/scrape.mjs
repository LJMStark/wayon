import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';

const BASE_URL = 'https://www.wayon.com/';
const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir() {
  await fs.ensureDir(DATA_DIR);
}

async function scrapeCategories() {
  console.log('启动 Playwright 并拉取主页数据...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL, { waitUntil: 'load' });
  
  // 按照分析，提取 Header 中的所有的导航链接
  const navItems = await page.evaluate(() => {
    const categories = [];
    const elements = document.querySelectorAll('a[href*="/products/"]');
    elements.forEach(el => {
      if (el.innerText.trim() && el.href) {
        categories.push({
          title: el.innerText.trim(),
          url: el.href,
        });
      }
    });

    // 去重
    const uniqueCategories = Array.from(new Map(categories.map(item => [item.url, item])).values());
    return uniqueCategories;
  });

  console.log(`成功抓取了 ${navItems.length} 个分类数据`);
  await fs.writeJson(path.join(DATA_DIR, 'categories.json'), navItems, { spaces: 2 });
  
  await browser.close();
  console.log('数据已保存到 data/categories.json');
}

async function main() {
  await ensureDir();
  await scrapeCategories();
}

main().catch(console.error);
