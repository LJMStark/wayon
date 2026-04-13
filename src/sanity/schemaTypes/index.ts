import { type SchemaTypeDefinition } from 'sanity'

import { categoryType } from './categoryType'
import { productType } from './productType'
import { productVariantType } from './productVariantType'
import { newsType } from './newsType'
import { inquiryType } from './inquiryType'
import { localeStringType } from './localeStringType'
import { externalImageMediaType } from './externalImageMediaType'
import { externalVideoMediaType } from './externalVideoMediaType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localeStringType,
    externalImageMediaType,
    externalVideoMediaType,
    categoryType,
    productType,
    productVariantType,
    newsType,
    inquiryType,
  ],
}
