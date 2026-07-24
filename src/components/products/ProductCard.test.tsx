import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { expect, test, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    children,
    href,
    prefetch: _prefetch,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    prefetch?: boolean;
  }) => {
    void _prefetch;
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

import ProductCard from "./ProductCard";

test("the whole product card links to its detail page", () => {
  const $ = load(
    renderToStaticMarkup(
      <ProductCard
        title="Sinai Gold"
        image="/sinai-gold.jpg"
        slug="sinai-gold"
        summaryTags={["800 × 2600mm"]}
      />
    )
  );
  const cardLink = $('a[href="/products/sinai-gold"]');

  expect(cardLink).toHaveLength(1);
  expect(cardLink.attr("aria-label")).toBe("Sinai Gold");
  expect(cardLink.find('img[alt="Sinai Gold"]')).toHaveLength(1);
  expect(cardLink.find("h3").text()).toBe("Sinai Gold");
  expect(cardLink.text()).toContain("800 × 2600mm");
});
