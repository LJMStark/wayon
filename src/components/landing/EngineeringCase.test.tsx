import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

type MockSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("./RevealSection", () => ({
  RevealSection: ({ children, ...props }: MockSectionProps) => (
    <section {...props}>{children}</section>
  ),
}));

import { EngineeringCase } from "./EngineeringCase";

const items = [
  {
    title: "Weihao Hotel",
    href: "/cases",
    image: "/assets/cases/weihao.jpg",
  },
  {
    title: "Yuehai Land",
    href: "/cases",
    image: "/assets/cases/yuehai.jpg",
  },
];

test("engineering case cards are native list items containing links", () => {
  const markup = renderToStaticMarkup(
    EngineeringCase({
      title: "Engineering cases",
      subtitle: "Recent projects",
      items,
    })
  );

  expect(markup.match(/<ul class="engineering-case__group"/g)).toHaveLength(2);
  expect(markup.match(/<li class="engineering-case__item">/g)).toHaveLength(
    items.length * 2
  );
  expect(markup.match(/class="engineering-case__card group"/g)).toHaveLength(
    items.length * 2
  );
  expect(markup).not.toContain('role="listitem"');
});
