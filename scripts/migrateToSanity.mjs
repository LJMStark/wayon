import { createClient } from '@sanity/client'
import rawProducts from '../src/data/products.json' with { type: 'json' }
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Configure this to match your sanity config
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // You need a write token
  useCdn: false,
})

async function migrate() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Please set SANITY_API_TOKEN in .env.local with a write-access token.')
    process.exit(1)
  }

  console.log(`Starting migration for ${rawProducts.length} products...`)

  // Step 1: Collect unique categories
  const categories = new Set(rawProducts.map(p => p.category))
  const categoryMap = new Map() // title -> _id

  console.log(`Found ${categories.size} categories. Creating them...`)
  for (const catName of categories) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    // Try to create category
    const result = await client.create({
      _type: 'category',
      title: catName,
      slug: { current: slug }
    })
    categoryMap.set(catName, result._id)
    console.log(`Created category: ${catName}`)
  }

  // Step 2: Create products
  let count = 0;
  for (const p of rawProducts) {
    // Generate slug from url
    const extractSlug = p.url.split("/").pop()?.replace(".html", "") ?? ""

    const productDoc = {
      _type: 'product',
      title: {
        en: p.title_en || p.title,
        zh: p.title_zh || p.title,
        es: p.title_es || p.title,
        ar: p.title_ar || p.title,
        ru: p.title_ru || p.title,
      },
      slug: { current: extractSlug },
      category: {
        _type: 'reference',
        _ref: categoryMap.get(p.category)
      },
      // Note: We skip image upload in this simple script. To do it properly, 
      // one would need to download the image from p.imageSrc and upload to Sanity.
      // But we will upload images manually for now.
    }

    try {
      await client.create(productDoc)
      count++
      console.log(`Created product ${count}/${rawProducts.length}: ${productDoc.title.en}`)
    } catch (err) {
      console.error(`Failed to create product: ${productDoc.title.en}`, err)
    }
  }

  console.log('Migration complete.')
}

migrate()
