import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { ProductDetailPageView } from "./ProductDetailPageView";

test("renders the complete element gallery above the space gallery", () => {
  const $ = load(
    renderToStaticMarkup(
      <ProductDetailPageView
        backLabel="返回"
        requestSampleLabel="获取样品"
        productSlug="sample-product"
        title="示例产品"
        category="岩板"
        seriesTypes={[]}
        descriptionParagraphs={[]}
        defaultVariantCode="SAMPLE-001"
        variants={[
          {
            code: "SAMPLE-001",
            showCode: true,
            optionLabel: "SAMPLE-001",
            elementImages: [
              { publicUrl: "/element.jpg", alt: "示例产品元素图" },
            ],
            spaceImages: [
              { publicUrl: "/space.jpg", alt: "示例产品空间图" },
            ],
            realImages: [],
            videos: [],
          },
        ]}
        relatedProducts={[]}
        labels={{
          variantSelector: "规格",
          productCode: "编号",
          colorGroup: "颜色",
          size: "尺寸",
          process: "工艺",
          faceCount: "面数",
          facePatternNote: "连纹说明",
          thickness: "厚度",
          elementImages: "元素图",
          spaceImages: "空间图",
          realImages: "实拍图",
          videos: "视频",
          videoFallback: "不支持视频",
          relatedProducts: "相关产品",
        }}
      />
    )
  );

  const elementSection = $("span")
    .filter((_, element) => $(element).text() === "元素图")
    .closest("section");
  const spaceSection = $("span")
    .filter((_, element) => $(element).text() === "空间图")
    .closest("section");

  expect(elementSection).toHaveLength(1);
  expect(elementSection.find('img[src="/element.jpg"]')).toHaveLength(1);
  expect(spaceSection).toHaveLength(1);
  expect(spaceSection.find('img[src="/space.jpg"]')).toHaveLength(1);
  expect(elementSection.index()).toBeLessThan(spaceSection.index());
});
