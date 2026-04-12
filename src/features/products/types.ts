export type ProductCategoryShowcase = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  background: "gray" | "white";
};

export type ProductsPageData = {
  heroTitle: string;
  heroSubtitle: string;
  breadcrumbLabel: string;
  homeLabel: string;
  collectionLabel: string;
  collectionDescription: string;
  readMoreLabel: string;
  showcases: ProductCategoryShowcase[];
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type ProductDetailPageData = {
  backLabel: string;
  requestSampleLabel: string;
  title: string;
  category: string;
  image: string;
  descriptionParagraphs: string[];
  specifications: ProductSpecification[];
};
