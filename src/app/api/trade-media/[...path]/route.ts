import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'
import path from 'node:path'
import {Readable} from 'node:stream'

import type {NextRequest} from 'next/server'

import {
  getTradeMediaContentType,
  resolveTradeMediaPath,
} from '@/features/products/lib/tradeMedia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TRADE_MEDIA_ROOT = path.join(process.cwd(), 'docs')

function buildHeaders(
  contentType: string,
  size: number,
  range?: {start: number; end: number}
): Headers {
  const headers = new Headers()

  headers.set('Content-Type', contentType)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'public, max-age=3600')

  if (range) {
    headers.set('Content-Length', String(range.end - range.start + 1))
    headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`)
  } else {
    headers.set('Content-Length', String(size))
  }

  return headers
}

function parseRangeHeader(
  header: string | null,
  size: number
): {start: number; end: number} | null {
  if (!header || !header.startsWith('bytes=')) {
    return null
  }

  const [startToken, endToken] = header.replace('bytes=', '').split('-')
  const start = Number.parseInt(startToken, 10)
  const end = endToken ? Number.parseInt(endToken, 10) : size - 1

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < start ||
    end >= size
  ) {
    return null
  }

  return {start, end}
}

function notFoundResponse() {
  return new Response('Not Found', {status: 404})
}

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{path: string[]}>}
) {
  const {path: pathSegments} = await params
  const resolvedPath = resolveTradeMediaPath(TRADE_MEDIA_ROOT, pathSegments)

  if (!resolvedPath) {
    return notFoundResponse()
  }

  // Extension whitelist enforced before any filesystem access. Hidden files
  // (.DS_Store, Thumbs.db) and unrelated formats (xlsx, psd, txt) get
  // rejected here, so the route only ever serves declared image/video types.
  const contentType = getTradeMediaContentType(resolvedPath)
  if (!contentType) {
    return notFoundResponse()
  }

  try {
    const fileStat = await stat(resolvedPath)

    if (!fileStat.isFile()) {
      return notFoundResponse()
    }

    const range = parseRangeHeader(request.headers.get('range'), fileStat.size)

    if (request.headers.get('range') && !range) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: buildHeaders(contentType, fileStat.size),
      })
    }

    const stream = createReadStream(resolvedPath, range ?? undefined)

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: range ? 206 : 200,
      headers: buildHeaders(contentType, fileStat.size, range ?? undefined),
    })
  } catch {
    return notFoundResponse()
  }
}
