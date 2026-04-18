import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('ZYL Stone CMS')
    .items([
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('product').title('Products'),
              S.documentTypeListItem('productVariant').title('Product Variants'),
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('news').title('News'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Submissions')
        .child(
          S.list()
            .title('Submissions')
            .items([
              S.listItem()
                .title('Inquiries')
                .schemaType('inquiry')
                .child(
                  S.documentTypeList('inquiry')
                    .title('Inquiries')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('System')
        .child(
          S.list()
            .title('System')
            .items([
              S.documentTypeListItem('customCapability').title('Custom Capabilities'),
            ]),
        ),
    ])
