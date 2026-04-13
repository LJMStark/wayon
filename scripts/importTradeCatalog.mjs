import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

import {
  extractTradeCode,
  extractTradeDisplayName,
  extractTradeFaceMetadata,
  inferTradeSize,
  normalizeTradeProcess,
} from '../src/features/products/lib/tradeCatalog.ts'
import { buildTradeMediaPublicUrl } from '../src/features/products/lib/tradeMedia.ts'
import { selectProductCoverUrl } from '../src/features/products/model/productDirectory.ts'

dotenv.config({ path: '.env.local' })

const ROOT_DIR = path.join(process.cwd(), 'docs/外贸出口资料')
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  'docs/trade-import-report.json'
)
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
])
const SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mov'])
const MEDIA_SOURCE_DIRECTORIES = [
  ['众岩联--元素图整理', 'elementImages'],
  ['众岩联--产品效果图', 'spaceImages'],
  ['众岩联--实物图', 'realImages'],
  ['众岩联--实物视频', 'videos'],
]
const SANITY_BATCH_SIZE = 100

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-04-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function parseArgs(argv) {
  return {
    apply: argv.includes('--apply'),
    reportPath:
      argv.find((arg) => arg.startsWith('--report='))?.slice('--report='.length) ||
      DEFAULT_REPORT_PATH,
  }
}

function hashValue(input) {
  return createHash('sha1').update(input).digest('hex').slice(0, 10)
}

function sanitizeIdSegment(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-')
}

function normalizeFamilyName(name) {
  return name.replace(/\s+/g, ' ').trim()
}

function buildFamilySlug(name, firstCode) {
  const asciiSlug = name
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (asciiSlug) {
    return asciiSlug
  }

  if (firstCode) {
    return `trade-${sanitizeIdSegment(firstCode)}`
  }

  return `trade-${hashValue(name)}`
}

function buildProductId(slug) {
  return `product-family-${sanitizeIdSegment(slug)}`
}

function buildVariantId(slug, code) {
  return `product-variant-${sanitizeIdSegment(slug)}-${sanitizeIdSegment(code)}`
}

function createEmptyVariant(code) {
  return {
    code,
    size: undefined,
    thickness: undefined,
    process: undefined,
    colorGroup: undefined,
    faceCount: undefined,
    facePatternNote: undefined,
    elementImages: [],
    spaceImages: [],
    realImages: [],
    videos: [],
  }
}

function mergeMedia(existing = [], imported = []) {
  const merged = [...existing]
  const seen = new Set(existing.map((item) => item.sourcePath || item.publicUrl))

  for (const item of imported) {
    const key = item.sourcePath || item.publicUrl

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    merged.push(item)
  }

  return merged
}

function createMediaRecord(sourcePath, basename) {
  return {
    sourcePath,
    publicUrl: buildTradeMediaPublicUrl(sourcePath),
    altZh: basename,
    titleZh: basename,
    sortOrder: 0,
  }
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)))
      continue
    }

    files.push(fullPath)
  }

  return files
}

async function collectCandidates(report) {
  const candidates = []

  for (const [directoryName, mediaKind] of MEDIA_SOURCE_DIRECTORIES) {
    const directoryPath = path.join(ROOT_DIR, directoryName)
    const files = await walkFiles(directoryPath)

    for (const fullPath of files) {
      const extension = path.extname(fullPath).toLowerCase()
      const basename = path.basename(fullPath)
      const relativePath = path.relative(ROOT_DIR, fullPath).split(path.sep).join('/')

      const isImage = SUPPORTED_IMAGE_EXTENSIONS.has(extension)
      const isVideo = SUPPORTED_VIDEO_EXTENSIONS.has(extension)

      if (!isImage && !isVideo) {
        report.skippedFiles.push({
          sourcePath: relativePath,
          reason: `Unsupported extension: ${extension || 'unknown'}`,
        })
        continue
      }

      const displayName = extractTradeDisplayName(relativePath)
      const normalizedName = displayName ? normalizeFamilyName(displayName) : null
      const code = extractTradeCode(relativePath)
      const size = inferTradeSize(relativePath)
      const process = normalizeTradeProcess(relativePath)
      const { faceCount, facePatternNote } = extractTradeFaceMetadata(relativePath)

      candidates.push({
        mediaKind,
        sourcePath: relativePath,
        displayName,
        normalizedName,
        code,
        size,
        process,
        faceCount,
        facePatternNote,
        mediaRecord: createMediaRecord(relativePath, displayName || basename),
      })
    }
  }

  return candidates
}

function attachMedia(variant, candidate) {
  if (candidate.mediaKind === 'videos') {
    variant.videos = mergeMedia(variant.videos, [
      {
        sourcePath: candidate.mediaRecord.sourcePath,
        publicUrl: candidate.mediaRecord.publicUrl,
        posterUrl: undefined,
        titleZh: candidate.mediaRecord.titleZh,
        sortOrder: 0,
      },
    ])
    return
  }

  variant[candidate.mediaKind] = mergeMedia(variant[candidate.mediaKind], [
    {
      sourcePath: candidate.mediaRecord.sourcePath,
      publicUrl: candidate.mediaRecord.publicUrl,
      altZh: candidate.mediaRecord.altZh,
      sortOrder: 0,
    },
  ])
}

function buildFamilies(candidates, report) {
  const families = new Map()

  for (const candidate of candidates.filter((item) => item.code)) {
    const familyName = candidate.normalizedName || candidate.code

    if (!candidate.normalizedName) {
      report.pendingManualReview.push({
        sourcePath: candidate.sourcePath,
        reason: 'Missing display name; family falls back to code',
      })
    }

    const family =
      families.get(familyName) ||
      {
        normalizedName: familyName,
        displayName: candidate.displayName || candidate.code,
        seriesTypes: [],
        variants: new Map(),
      }

    const variant =
      family.variants.get(candidate.code) || createEmptyVariant(candidate.code)

    if (!variant.size && candidate.size) {
      variant.size = candidate.size
    }
    if (!variant.process && candidate.process) {
      variant.process = candidate.process
    }
    if (!variant.faceCount && candidate.faceCount) {
      variant.faceCount = candidate.faceCount
    }
    if (!variant.facePatternNote && candidate.facePatternNote) {
      variant.facePatternNote = candidate.facePatternNote
    }

    attachMedia(variant, candidate)

    family.variants.set(candidate.code, variant)
    families.set(familyName, family)
  }

  for (const candidate of candidates.filter((item) => !item.code)) {
    if (!candidate.normalizedName) {
      report.pendingManualReview.push({
        sourcePath: candidate.sourcePath,
        reason: 'Missing code and display name',
      })
      continue
    }

    const family = families.get(candidate.normalizedName)

    if (!family) {
      report.pendingManualReview.push({
        sourcePath: candidate.sourcePath,
        reason: 'No family matched this no-code asset',
      })
      continue
    }

    const variantCandidates = [...family.variants.values()].filter((variant) => {
      if (candidate.size && variant.size && variant.size !== candidate.size) {
        return false
      }

      if (
        candidate.process &&
        variant.process &&
        variant.process !== candidate.process
      ) {
        return false
      }

      return true
    })

    const variant =
      variantCandidates.length === 1
        ? variantCandidates[0]
        : family.variants.size === 1
          ? [...family.variants.values()][0]
          : null

    if (!variant) {
      report.pendingManualReview.push({
        sourcePath: candidate.sourcePath,
        reason: 'No unique variant match for no-code asset',
      })
      continue
    }

    if (!variant.faceCount && candidate.faceCount) {
      variant.faceCount = candidate.faceCount
    }
    if (!variant.facePatternNote && candidate.facePatternNote) {
      variant.facePatternNote = candidate.facePatternNote
    }

    attachMedia(variant, candidate)
  }

  return [...families.values()]
    .map((family) => {
      const variants = [...family.variants.values()].filter((variant) => {
        const mediaCount =
          variant.elementImages.length +
          variant.spaceImages.length +
          variant.realImages.length +
          variant.videos.length

        return mediaCount > 0
      })

      if (variants.length === 0) {
        return null
      }

      const firstCode = variants[0]?.code
      const slug = buildFamilySlug(family.normalizedName, firstCode)

      return {
        ...family,
        slug,
        productId: buildProductId(slug),
        variants,
      }
    })
    .filter(Boolean)
}

function buildCoverImageUrl(family) {
  return selectProductCoverUrl(
    {
      slug: family.slug,
      seriesTypes: family.seriesTypes,
      coverImageUrl: null,
      variants: family.variants,
    },
    ''
  )
}

function mergeLocalizedTitle(existingTitle, familyName) {
  return {
    en: existingTitle?.en || familyName,
    zh: existingTitle?.zh || familyName,
    es: existingTitle?.es || existingTitle?.en || familyName,
    ar: existingTitle?.ar || existingTitle?.en || familyName,
    ru: existingTitle?.ru || existingTitle?.en || familyName,
  }
}

function chunkItems(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

async function fetchDocumentsByIds(ids) {
  if (!client.config().token || ids.length === 0) {
    return new Map()
  }

  const documents = []

  for (const chunk of chunkItems(ids, SANITY_BATCH_SIZE)) {
    const result = await client.fetch('*[_id in $ids]', {ids: chunk})
    documents.push(...result)
  }

  return new Map(documents.map((document) => [document._id, document]))
}

function buildProductDocument(family, existingDocuments) {
  const existing = existingDocuments.get(family.productId)
  const coverImageUrl = buildCoverImageUrl(family) || existing?.coverImageUrl

  return {
    _id: family.productId,
    _type: 'product',
    title: mergeLocalizedTitle(existing?.title, family.displayName),
    normalizedName: family.normalizedName,
    slug: { current: existing?.slug?.current || family.slug },
    category: existing?.category,
    image: existing?.image,
    description: existing?.description,
    seriesTypes:
      existing?.seriesTypes && existing.seriesTypes.length > 0
        ? existing.seriesTypes
        : [],
    coverImageUrl: coverImageUrl || undefined,
    coverVideoPosterUrl: existing?.coverVideoPosterUrl,
    thickness: existing?.thickness,
    finish: existing?.finish,
    size: existing?.size,
    featured: existing?.featured ?? false,
    sortOrder: existing?.sortOrder ?? 0,
  }
}

function buildVariantDocument(family, variant, index, existingDocuments) {
  const variantId = buildVariantId(family.slug, variant.code)
  const existing = existingDocuments.get(variantId)

  return {
    _id: variantId,
    _type: 'productVariant',
    productRef: {
      _type: 'reference',
      _ref: family.productId,
    },
    code: variant.code,
    size: existing?.size || variant.size,
    thickness: existing?.thickness || variant.thickness,
    process: existing?.process || variant.process,
    colorGroup: existing?.colorGroup || variant.colorGroup,
    faceCount: existing?.faceCount || variant.faceCount,
    facePatternNote: existing?.facePatternNote || variant.facePatternNote,
    sortOrder: existing?.sortOrder ?? index,
    elementImages: mergeMedia(existing?.elementImages, variant.elementImages),
    spaceImages: mergeMedia(existing?.spaceImages, variant.spaceImages),
    realImages: mergeMedia(existing?.realImages, variant.realImages),
    videos: mergeMedia(existing?.videos, variant.videos),
  }
}

async function writeReport(reportPath, payload) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true })
  await fs.writeFile(reportPath, JSON.stringify(payload, null, 2), 'utf8')
}

async function commitInBatches(documents) {
  for (const chunk of chunkItems(documents, SANITY_BATCH_SIZE)) {
    await client.mutate(
      chunk.map((document) => ({
        createOrReplace: document,
      }))
    )
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.apply && !process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in .env.local')
    process.exit(1)
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: !args.apply,
    skippedFiles: [],
    pendingManualReview: [],
    families: 0,
    variants: 0,
    images: 0,
    videos: 0,
  }

  const candidates = await collectCandidates(report)
  const families = buildFamilies(candidates, report)

  report.families = families.length
  report.variants = families.reduce(
    (total, family) => total + family.variants.length,
    0
  )
  report.images = families.reduce(
    (total, family) =>
      total +
      family.variants.reduce(
        (variantTotal, variant) =>
          variantTotal +
          variant.elementImages.length +
          variant.spaceImages.length +
          variant.realImages.length,
        0
      ),
    0
  )
  report.videos = families.reduce(
    (total, family) =>
      total +
      family.variants.reduce(
        (variantTotal, variant) => variantTotal + variant.videos.length,
        0
      ),
    0
  )

  if (args.apply) {
    const productIds = families.map((family) => family.productId)
    const variantIds = families.flatMap((family) =>
      family.variants.map((variant) => buildVariantId(family.slug, variant.code))
    )
    const [existingProducts, existingVariants] = await Promise.all([
      fetchDocumentsByIds(productIds),
      fetchDocumentsByIds(variantIds),
    ])
    const productDocuments = families.map((family) =>
      buildProductDocument(family, existingProducts)
    )
    const variantDocuments = families.flatMap((family) =>
      family.variants.map((variant, index) =>
        buildVariantDocument(family, variant, index, existingVariants)
      )
    )

    await commitInBatches(productDocuments)
    await commitInBatches(variantDocuments)
  }

  await writeReport(args.reportPath, report)

  console.log(
    JSON.stringify(
      {
        dryRun: report.dryRun,
        reportPath: args.reportPath,
        families: report.families,
        variants: report.variants,
        images: report.images,
        videos: report.videos,
        pendingManualReview: report.pendingManualReview.length,
        skippedFiles: report.skippedFiles.length,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
