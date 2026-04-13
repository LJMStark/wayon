import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('ZYL Stone CMS')
    .items([
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('productVariant').title('Product Variants'),
      S.documentTypeListItem('category').title('Categories'),
      S.divider(),
      S.documentTypeListItem('news').title('News'),
      S.divider(),
      S.documentTypeListItem('inquiry').title('Inquiries'),
    ])
