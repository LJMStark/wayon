"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";

import { LANGUAGES, NAV_ITEMS, type SubItem } from "@/data/navigation";

export default function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const tHeader = useTranslations("Header");
  const currentLanguage = LANGUAGES.find(l => l.locale === locale) || LANGUAGES[0];
  const collectionItem = useMemo(
    () => NAV_ITEMS.find((item) => item.label === "collection"),
    []
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<SubItem | null>(
    collectionItem?.subItems?.[0] ?? null
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpenSections, setMobileOpenSections] = useState<string[]>([]);

  const toggleMobileSection = (label: string) => {
    setMobileOpenSections((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  const resolveBaseHref = (href: string) => href.split(/[?#]/)[0] || "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border)] bg-white">
      <div className="wayon-container">
        <div className="flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link href="/" className="relative block h-[40px] w-[78px] shrink-0 md:h-[46px] md:w-[90px]">
            <Image
              src="/assets/brand/logo-wayon-stone-group.png"
              alt="WAYON STONE GROUP"
              fill
              sizes="(max-width: 768px) 78px, 90px"
              className="object-contain"
              preload
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center">
              {NAV_ITEMS.map((item) => {
                const isOpen = activeMenu === item.label;
                const isCurrent = pathname === resolveBaseHref(item.href);

                return (
                  <li
                    key={tNav(item.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
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
                      className={`inline-flex items-center text-[15px] font-light transition-colors ${
                        isCurrent
                          ? "text-[color:var(--primary)]"
                          : "text-[#333333] hover:text-[color:var(--primary)]"
                      }`}
                    >
                      {tNav(item.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                    </Link>
                    <span
                      className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[42px] -translate-x-1/2 transition-colors ${
                        isCurrent ? "bg-[color:var(--primary)]" : "bg-transparent group-hover:bg-[color:var(--primary)]/45"
                      }`}
                    />

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

                              <div className="max-h-[360px] overflow-y-auto border-r border-[color:var(--border)] pr-8">
                                <ul className="space-y-1">
                                  {item.subItems.map((subItem) => {
                                    const isActive = activeCollection?.label === subItem.label;

                                    return (
                                      <li key={tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}>
                                        <Link
                                          href={subItem.href}
                                          className={`block border-b border-[color:var(--border)] px-4 py-3 text-[15px] leading-6 transition-colors ${
                                            isActive
                                              ? "bg-[color:var(--primary)] text-white"
                                              : "text-[#404040] hover:bg-[color:var(--primary)] hover:text-white"
                                          }`}
                                          onMouseEnter={() => setActiveCollection(subItem)}
                                        >
                                          {tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              <div className="min-w-0">
                                <h3 className="mb-4 text-[24px] font-medium text-[#1e1e1e]">
                                  {activeCollection?.label ? tNav(activeCollection.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ ) : ""}
                                </h3>
                                {activeCollection?.description ? (
                                  <p className="mb-6 text-[15px] leading-[1.7] text-[#666666]">
                                    {tNav(activeCollection.description as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                                  </p>
                                ) : null}
                                {activeCollection?.children?.length ? (
                                  <ul className="grid gap-3 sm:grid-cols-2">
                                    {activeCollection.children.map((child) => (
                                      <li key={tNav(child.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}>
                                        <Link
                                          href={child.href}
                                          className="block text-[14px] leading-6 text-[#404040] transition-colors hover:text-[color:var(--primary)]"
                                        >
                                          {tNav(child.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <Link
                                    href={activeCollection?.href ?? "/products"}
                                    className="text-[15px] font-medium text-[color:var(--primary)]"
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
                                  key={tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                                  href={subItem.href}
                                  className="block px-5 py-3 text-[14px] text-[#404040] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--primary)]"
                                >
                                  {tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
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

          <div className="hidden items-center gap-5 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className="text-[#333333] transition-colors hover:text-[color:var(--primary)]"
                aria-label="Toggle search"
              >
                <Search className="size-5" />
              </button>

              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+18px)] w-[320px] border-t-[3px] border-[color:var(--primary)] bg-white p-4 wayon-menu-shadow"
                  >
                    <form
                      className="flex gap-3"
                      onSubmit={(event) => event.preventDefault()}
                    >
                      <input
                        id="desktop-search"
                        name="keyword"
                        type="text"
                        placeholder={tHeader("searchPlaceholder")}
                        className="min-w-0 flex-1 border border-[color:var(--border)] px-3 py-2 text-[14px] text-[#333333] focus:border-[color:var(--primary)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[color:var(--primary)] px-4 py-2 text-[13px] font-medium text-white"
                      >{tHeader("searchPlaceholder").replace("...", "")}</button>
                    </form>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="h-4 w-px bg-[color:var(--border)]" />

            <div
              className="relative"
              onMouseEnter={() => setLangOpen(true)}
              onMouseLeave={() => setLangOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-2 text-[15px] font-light text-[#333333] transition-colors hover:text-[color:var(--primary)]"
              >
                <Globe className="size-4" />
                <span>{currentLanguage.label}</span>
                <ChevronDown className={`size-4 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-[calc(100%+18px)] w-[220px] border border-[color:var(--border)] bg-white py-2 wayon-menu-shadow"
                  >
                    {LANGUAGES.map((language) => (
                      <Link
                        key={language.label}
                        href={pathname}
                        locale={language.locale}
                        className="flex items-center gap-3 px-4 py-3 text-[15px] text-[#404040] transition-colors hover:bg-[color:var(--surface)] hover:text-[color:var(--primary)]"
                      >
                        <span className="text-[18px]">
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
            className="relative z-10 inline-flex size-10 items-center justify-center border border-[color:var(--border)] bg-white text-[#111111] lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
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
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation overlay"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.28, 0.2, 0, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto bg-[#272727] p-5 text-white lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="relative h-10 w-[78px]">
                  <Image
                    src="/assets/brand/logo-wayon-stone-group.png"
                    alt="WAYON STONE GROUP"
                    fill
                    sizes="78px"
                    className="object-contain brightness-[10]"
                  />
                </div>
                <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Close navigation">
                  <X className="size-6" />
                </button>
              </div>

              <form
                className="mb-6 flex gap-3"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  id="mobile-search"
                  name="keyword"
                  type="text"
                  placeholder={tHeader("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-white px-4 py-3 text-[14px] text-black focus:outline-none"
                />
                <button type="submit" className="bg-[color:var(--primary)] px-4 py-3 text-[14px] font-medium">{tHeader("searchPlaceholder").replace("...", "")}</button>
              </form>

              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const expanded = mobileOpenSections.includes(item.label);

                  return (
                    <li key={tNav(item.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )} className="border-b border-white/10 pb-3">
                      <div className="flex items-center justify-between gap-3 pt-3">
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="text-[16px] font-light"
                        >
                          {tNav(item.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                        </Link>
                        {item.subItems?.length ? (
                          <button
                            type="button"
                            onClick={() => toggleMobileSection(item.label)}
                            aria-label={`Toggle ${tNav(item.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}`}
                          >
                            <ChevronDown className={`size-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                          </button>
                        ) : null}
                      </div>

                      {item.subItems?.length && expanded ? (
                        <div className="mt-4 space-y-4 pl-4">
                          {item.subItems.map((subItem) => (
                            <div key={tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}>
                              <Link
                                href={subItem.href}
                                onClick={() => setIsMobileOpen(false)}
                                className="block text-[15px] text-white/90"
                              >
                                {tNav(subItem.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
                              </Link>
                              {subItem.children?.length ? (
                                <ul className="mt-3 space-y-2 border-l border-white/10 pl-3">
                                  {subItem.children.map((child) => (
                                    <li key={tNav(child.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}>
                                      <Link
                                        href={child.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className="text-[13px] text-white/65"
                                      >
                                        {tNav(child.label as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ )}
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
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-3 text-[15px] font-medium text-white/80 transition-colors hover:text-white"
                    >
                      <span className="text-[18px]">{language.icon}</span>
                      <span>{language.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
