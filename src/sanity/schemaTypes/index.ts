import { type SchemaTypeDefinition } from 'sanity'

import { categoryType } from './categoryType'
import { productType } from './productType'
import { newsType } from './newsType'
import { inquiryType } from './inquiryType'
import { localeStringType } from './localeStringType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localeStringType,
    categoryType,
    productType,
    newsType,
    inquiryType,
  ],
}
