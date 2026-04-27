"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  LANGUAGES,
  NAV_ITEMS,
  type NavigationKey,
  type SubItem,
} from "@/data/navigation";
import { formatCopy, getHeaderCopy } from "@/data/siteCopy";
import { Link, usePathname, useRouter } from "@/i18n/routing";

import { useDialogInteraction } from "./useDialogInteraction";

const BRAND_ALT: Record<string, string> = {
  en: "ZYL Sintered Stone",
  zh: "岩联岩板",
  es: "ZYL Piedra Sinterizada",
  ar: "ZYL حجر ملبد",
};

function resolveBaseHref(href: string): string {
  return href.split(/[?#]/)[0] || "/";
}

type BrandLogoProps = {
  className: string;
  imageClassName?: string;
  locale: string;
  preload?: boolean;
  sizes: string;
};

function BrandLogo({
  className,
  imageClassName = "object-contain",
  locale,
  preload = false,
  sizes,
}: BrandLogoProps): React.JSX.Element {
  return (
    <div className={className}>
      <Image
        src="/assets/brand/logo-wayon-white.png"
        alt={BRAND_ALT[locale] ?? BRAND_ALT.en}
        fill
        sizes={sizes}
        className={imageClassName}
        preload={preload}
      />
    </div>
  );
}

function toggleStringItem(items: string[], value: string): string[] {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }

  return [...items, value];
}

function getDesktopNavLinkClassName(
  isCurrent: boolean,
  isTransparent: boolean
): string {
  if (isCurrent) {
    return "inline-flex items-center text-[16px] font-semibold text-white transition-colors";
  }

  if (isTransparent) {
    return "inline-flex items-center text-[16px] font-semibold text-white transition-colors hover:text-white";
  }

  return "inline-flex items-center text-[16px] font-semibold text-white transition-colors hover:text-white";
}

const UNDERLINE_BASE =
  "pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[42px] -translate-x-1/2 origin-center bg-white transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]";

function getDesktopUnderlineClassName(isCurrent: boolean): string {
  if (isCurrent) {
    return `${UNDERLINE_BASE} scale-x-100`;
  }

  return `${UNDERLINE_BASE} scale-x-0 group-hover:scale-x-100`;
}

function getMegaSubItemClassName(isActive: boolean): string {
  if (isActive) {
    return "block border-b border-[color:var(--border)] bg-[color:var(--primary)] px-4 py-3 text-[16px] leading-6 text-white transition-colors";
  }

  return "block border-b border-[color:var(--border)] px-4 py-3 text-[16px] leading-6 text-[#404040] transition-colors hover:bg-[color:var(--primary)] hover:text-white";
}

function getChevronClassName(isOpen: boolean): string {
  if (isOpen) {
    return "size-4 rotate-180 transition-transform";
  }

  return "size-4 transition-transform";
}

function getMobileSectionChevronClassName(isExpanded: boolean): string {
  if (isExpanded) {
    return "size-5 rotate-180 transition-transform";
  }

  return "size-5 transition-transform";
}

export default function Header(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const shouldReduce = useReducedMotion();
  const tNav = useTranslations("Navigation");
  const tHeader = useTranslations("Header");
  const headerCopy = getHeaderCopy(locale);
  const translateNav = (key: NavigationKey): string => tNav(key);
  const currentLanguage =
    LANGUAGES.find((language) => language.locale === locale) ?? LANGUAGES[0];
  const collectionItem = NAV_ITEMS.find((item) => item.label === "collection");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<SubItem | null>(
    collectionItem?.subItems?.[0] ?? null
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpenSections, setMobileOpenSections] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll-aware transparent header: starts transparent over the page hero,
  // becomes solid white after the user scrolls past the fold so nav text stays
  // legible against the underlying page content.
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Treat any open dropdown / mega menu the same as scrolled — those panels
  // need a solid header background to read against.
  const isTransparent =
    !isScrolled && !activeMenu && !searchOpen && !langOpen && !isMobileOpen;

  const closeMobileMenu = (): void => {
    setIsMobileOpen(false);
  };

  const mobileAsideRef = useDialogInteraction<HTMLElement>({
    isOpen: isMobileOpen,
    onClose: closeMobileMenu,
  });

  const toggleSearch = (): void => {
    setSearchOpen((value) => !value);
  };

  const openMobileMenu = (): void => {
    setIsMobileOpen(true);
  };

  const toggleMobileSection = (label: string): void => {
    setMobileOpenSections((current) => toggleStringItem(current, label));
  };

  // Search submits route to the products page carrying a `q` param.
  // getProductsPageData resolves it server-side by filtering the
  // directory against the query — no additional GROQ round-trip needed.
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get("keyword") ?? "").trim();
    const target = keyword
      ? `/products?q=${encodeURIComponent(keyword)}`
      : "/products";
    setSearchOpen(false);
    closeMobileMenu();
    router.push(target);
  };

  return (
    <motion.header
      initial={shouldReduce ? false : { y: "-100%", opacity: 0 }}
      animate={shouldReduce ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ease-out ${
        isTransparent
          ? "border-transparent bg-transparent"
          : "border-transparent bg-[color:var(--primary)]"
      }`}
    >
      <div className="mx-auto w-full px-4 md:px-8 xl:px-12 2xl:px-16">
        <div className="flex h-[var(--header-height)] w-full items-center justify-between lg:justify-center gap-6 lg:gap-10 xl:gap-16">
          <Link
            href="/"
            className="block shrink-0"
          >
            <BrandLogo
              className="relative h-[65px] w-[105px] md:h-[90px] md:w-[146px]"
              imageClassName={`object-contain transition-[filter] duration-300 ease-out ${
                isTransparent ? "" : ""
              }`}
              locale={locale}
              preload
              sizes="(max-width: 768px) 82px, 98px"
            />
          </Link>

          <nav className="hidden items-center lg:flex whitespace-nowrap">
            <ul className="flex items-center flex-nowrap">
              {NAV_ITEMS.map((item) => {
                const isOpen = activeMenu === item.label;
                const isCurrent = pathname === resolveBaseHref(item.href);

                return (
                  <li
                    key={translateNav(item.label)}
                    className="group relative flex h-[var(--header-height)] items-center px-3 xl:px-5"
                    onMouseEnter={() => {
                      setActiveMenu(item.label);
                      if (item.mega && item.subItems?.length) {
                        setActiveCollection(item.subItems[0]);
                      }
                    }}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={getDesktopNavLinkClassName(isCurrent, isTransparent)}
                    >
                      {translateNav(item.label)}
                    </Link>
                    <span className={getDesktopUnderlineClassName(isCurrent)} />

                    {item.mega && item.subItems ? (
                      <AnimatePresence>
                        {isOpen ? (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="fixed left-0 right-0 top-[var(--header-height)] border-t border-[color:var(--border)] bg-white py-8 wayon-menu-shadow"
                          >
                            <div className="wayon-container-wide grid grid-cols-[1.05fr_0.9fr_1fr] gap-10">
                              <div className="relative aspect-[48/35] overflow-hidden bg-[color:var(--surface)]">
                                {activeCollection?.previewImage ? (
                                  <Image
                                    src={activeCollection.previewImage}
                                    alt={activeCollection.label}
                                    fill
                                    sizes="40vw"
                                    className="object-cover"
                                  />
                                ) : null}
                              </div>

                              <div className="max-h-[360px] overflow-y-auto border-e border-[color:var(--border)] pe-8">
                                <ul className="space-y-1">
                                  {item.subItems.map((subItem) => {
                                    const isActive = activeCollection?.label === subItem.label;

                                    return (
                                      <li key={translateNav(subItem.label)}>
                                        <Link
                                          href={subItem.href}
                                          className={getMegaSubItemClassName(isActive)}
                                          onMouseEnter={() => setActiveCollection(subItem)}
                                        >
                                          {translateNav(subItem.label)}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              <div className="min-w-0">
                                <h3 className="mb-4 text-[24px] font-semibold text-[#1e1e1e]">
                                  {activeCollection?.label ? translateNav(activeCollection.label) : ""}
                                </h3>
                                {activeCollection?.description ? (
                                  <p className="mb-6 text-[16px] leading-[1.7] text-[#666666]">
                                    {translateNav(activeCollection.description)}
                                  </p>
                                ) : null}
                                {activeCollection?.children?.length ? (
                                  <ul className="grid gap-3 sm:grid-cols-2">
                                    {activeCollection.children.map((child) => (
                                      <li key={translateNav(child.label)}>
                                        <Link
                                          href={child.href}
                                          className="block text-[14px] leading-6 text-[#404040] transition-colors hover:text-[color:var(--primary)]"
                                        >
                                          {translateNav(child.label)}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <Link
                                    href={activeCollection?.href ?? "/products"}
                                    className="text-[16px] font-semibold text-[color:var(--primary)]"
                                  >{tNav("collection")}</Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    ) : item.subItems?.length ? (
                      <AnimatePresence>
                        {isOpen ? (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-1/2 top-[calc(var(--header-height)-2px)] z-50 w-[260px] -translate-x-1/2 pt-4"
                          >
                            <div className="border border-[color:var(--border)] bg-white py-2 wayon-menu-shadow">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={translateNav(subItem.label)}
                                  href={subItem.href}
                                  className="block px-5 py-3 text-[14px] text-[#404040] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--primary)]"
                                >
                                  {translateNav(subItem.label)}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden h-[40px] items-center gap-5 lg:flex xl:gap-8">
            <div className="relative">
              <button
                type="button"
                onClick={toggleSearch}
                className={`transition-colors ${
                  isTransparent
                    ? "text-white hover:text-white"
                    : "text-white hover:text-white"
                }`}
                aria-label={headerCopy.toggleSearch}
              >
                <Search className="size-5" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute end-0 top-[calc(100%+18px)] w-[320px] border-t-[3px] border-[color:var(--primary)] bg-white p-4 wayon-menu-shadow"
                  >
                    <form
                      className="flex gap-3"
                      onSubmit={handleSearchSubmit}
                    >
                      <input
                        id="desktop-search"
                        name="keyword"
                        type="search"
                        autoComplete="off"
                        placeholder={tHeader("searchPlaceholder")}
                        className="min-w-0 flex-1 border border-[color:var(--border)] px-3 py-2 text-[14px] text-[#333333] focus:border-[color:var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-1"
                      />
                      <button
                        type="submit"
                        className="bg-[color:var(--primary)] px-4 py-2 text-[13px] font-semibold text-white"
                      >
                        {headerCopy.searchAction}
                      </button>
                    </form>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className={`h-4 w-px transition-colors ${
                isTransparent ? "bg-white/35" : "bg-white/35"
              }`}
            />

            <div
              className="relative"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                aria-label={tHeader("language")}
                aria-expanded={langOpen}
                className={`inline-flex items-center gap-2 text-[16px] font-semibold transition-colors ${
                  isTransparent
                    ? "text-white hover:text-white"
                    : "text-white hover:text-white"
                }`}
              >
                <Globe className="size-4" aria-hidden="true" />
                <span>{currentLanguage.label}</span>
                <ChevronDown className={getChevronClassName(langOpen)} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {langOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute end-0 top-[calc(100%+18px)] w-[220px] border border-[color:var(--border)] bg-white py-2 wayon-menu-shadow"
                  >
                    {LANGUAGES.map((language) => (
                      <Link
                        key={language.label}
                        href={pathname}
                        locale={language.locale}
                        className="flex items-center gap-3 px-4 py-3 text-[16px] text-[#404040] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--primary)]"
                      >
                        <span className="inline-flex h-6 w-7 items-center justify-center bg-[color:var(--surface)] text-[11px] font-semibold tracking-[0.08em] text-[color:var(--muted-foreground)]">
                          {language.icon}
                        </span>
                        <span>{language.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          

          <button
            type="button"
            className={`relative z-10 inline-flex size-10 items-center justify-center border transition-colors lg:hidden ${
              isTransparent
                ? "border-white/45 bg-white/10 text-white backdrop-blur-[2px]"
                : "border-white/20 bg-white/10 text-white backdrop-blur-[2px]"
            }`}
            onClick={openMobileMenu}
            aria-label={headerCopy.openNavigation}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={closeMobileMenu}
              aria-label={headerCopy.closeNavigationOverlay}
            />
            <motion.aside
              ref={mobileAsideRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label={headerCopy.openNavigation}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.28, 0.2, 0, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto bg-[#272727] p-5 text-white lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <BrandLogo
                  className="relative h-[55px] w-[82px]"
                  imageClassName="object-contain"
                  locale={locale}
                  sizes="82px"
                />
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label={headerCopy.closeNavigation}
                >
                  <X className="size-6" />
                </button>
              </div>

              <form
                className="mb-6 flex gap-3"
                onSubmit={handleSearchSubmit}
              >
                <input
                  id="mobile-search"
                  name="keyword"
                  type="search"
                  autoComplete="off"
                  placeholder={tHeader("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-white px-4 py-3 text-[14px] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--primary)]"
                />
                <button
                  type="submit"
                  className="bg-[color:var(--primary)] px-4 py-3 text-[14px] font-semibold"
                >
                  {headerCopy.searchAction}
                </button>
              </form>

              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const expanded = mobileOpenSections.includes(item.label);

                  return (
                    <li key={translateNav(item.label)} className="border-b border-white/10 pb-3">
                      <div className="flex items-center justify-between gap-3 pt-3">
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          className="text-[16px] font-light"
                        >
                          {translateNav(item.label)}
                        </Link>
                        {item.subItems?.length ? (
                          <button
                            type="button"
                            onClick={() => toggleMobileSection(item.label)}
                            aria-label={formatCopy(headerCopy.toggleSection, {
                              section: translateNav(item.label),
                            })}
                          >
                            <ChevronDown className={getMobileSectionChevronClassName(expanded)} />
                          </button>
                        ) : null}
                      </div>

                      {item.subItems?.length && expanded ? (
                        <div className="mt-4 space-y-4 ps-4">
                          {item.subItems.map((subItem) => (
                            <div key={translateNav(subItem.label)}>
                              <Link
                                href={subItem.href}
                                onClick={closeMobileMenu}
                                className="block text-[16px] text-white/90"
                              >
                                {translateNav(subItem.label)}
                              </Link>
                              {subItem.children?.length ? (
                                <ul className="mt-3 space-y-2 border-s border-white/10 ps-3">
                                  {subItem.children.map((child) => (
                                    <li key={translateNav(child.label)}>
                                      <Link
                                        href={child.href}
                                        onClick={closeMobileMenu}
                                        className="text-[13px] text-white/65"
                                      >
                                        {translateNav(child.label)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="mb-3 text-[13px] uppercase tracking-[0.18em] text-white/50">{tHeader("language")}</h3>
                <div className="grid gap-2">
                  {LANGUAGES.map((language) => (
                    <Link
                      key={language.label}
                      href={pathname}
                      locale={language.locale}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 text-[16px] font-semibold text-white/80 transition-colors hover:text-white"
                    >
                      <span className="inline-flex h-6 w-7 items-center justify-center bg-white/10 text-[11px] font-semibold tracking-[0.08em] text-white/70">
                        {language.icon}
                      </span>
                      <span>{language.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
