import type {
  ProductDetailPageLabels,
  ProductDetailVariantData,
} from "../types";

export type ProductSpecification = {
  label: string;
  value: string;
};

export function buildProductSpecifications(
  variant: ProductDetailVariantData,
  labels: ProductDetailPageLabels
): ProductSpecification[] {
  const specifications: ProductSpecification[] = [];

  addSpecification(specifications, labels.size, variant.size);
  addSpecification(specifications, labels.thickness, variant.thickness);
  addSpecification(specifications, labels.colorGroup, variant.colorGroup);
  addSpecification(specifications, labels.process, variant.process);

  return specifications;
}

function addSpecification(
  specifications: ProductSpecification[],
  label: string,
  value: string | null | undefined
): void {
  if (value) {
    specifications.push({ label, value });
  }
}
