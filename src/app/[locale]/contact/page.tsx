"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { getCommonCopy, getContactPageCopy } from "@/data/siteCopy";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", content: "f" },
  { label: "Instagram", href: "https://instagram.com", content: "ig" },
  { label: "YouTube", href: "https://youtube.com", content: "▶" },
];

const FORM_CONTROL_CLASS =
  "w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#0f2858] focus:outline-none";

export default function ContactPage() {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const commonCopy = getCommonCopy(locale);
  const contactCopy = getContactPageCopy(locale);
  const [activeAccordion, setActiveAccordion] = useState<string>(
    contactCopy.locations[0].name
  );

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <section className="relative h-[350px] w-full bg-neutral-200">
        <Image
          src="/assets/products/4114a4ac18610909eb9728c75328bcff.jpg"
          alt={contactCopy.heroTitle}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 text-white">
          <h1 className="mb-4 text-3xl font-light tracking-wide md:text-5xl">
            {contactCopy.heroTitle}
          </h1>
          <p className="border-b border-transparent text-sm tracking-wide md:text-base">
            {contactCopy.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto mb-16 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-gray-500">
        <span className="text-gray-400">◆</span> {commonCopy.breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {tNav("home")}
        </Link>{" "}
        &gt; <span className="text-black">{contactCopy.breadcrumbCurrent}</span>
      </div>

      <section className="mx-auto mb-24 max-w-[1400px] px-6">
        <div className="grid items-start gap-12 md:grid-cols-2 lg:gap-24">
          <div className="relative flex aspect-square w-full flex-col items-center justify-center bg-neutral-50 text-gray-400 md:h-[600px] md:aspect-auto">
            <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-gray-200 p-8 text-center">
              <span className="mb-2">{contactCopy.mapTitle}</span>
              <span className="text-xs">{contactCopy.mapSubtitle}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {contactCopy.locations.map((location: {
              name: string;
              address?: string;
              tel?: string;
              fax?: string;
              postalCode?: string;
            }) => {
              const isActive = activeAccordion === location.name;

              return (
                <div
                  key={location.name}
                  className="overflow-hidden border border-gray-200"
                >
                  <button
                    onClick={() => setActiveAccordion(location.name)}
                    className={`flex w-full items-center p-0 transition-colors ${
                      isActive
                        ? "bg-gray-50/50"
                        : "bg-neutral-50 hover:bg-neutral-100"
                    }`}
                    type="button"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center ${
                        isActive
                          ? "bg-[#0f2858] text-white"
                          : "bg-[#112349] text-white"
                      }`}
                    >
                      {isActive ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </div>
                    <span className="ml-4 flex-1 text-left text-[15px] font-medium text-gray-700">
                      {location.name}
                    </span>
                  </button>

                  {isActive && location.address ? (
                    <div className="border-t border-gray-200 bg-gray-50/50 p-6 text-sm leading-relaxed text-gray-600">
                      <div className="mb-2">
                        <span className="text-gray-400">
                          {contactCopy.labels.address}:
                        </span>{" "}
                        {location.address}
                      </div>
                      {location.tel ? (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            {contactCopy.labels.tel}:
                          </span>{" "}
                          <a
                            href={`tel:${location.tel}`}
                            className="text-[#0ea5e9] hover:underline"
                          >
                            {location.tel}
                          </a>
                        </div>
                      ) : null}
                      {location.fax ? (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            {contactCopy.labels.fax}:
                          </span>{" "}
                          {location.fax}
                        </div>
                      ) : null}
                      {location.postalCode ? (
                        <div className="mb-8">
                          <span className="text-gray-400">
                            {contactCopy.labels.postalCode}:
                          </span>{" "}
                          {location.postalCode}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        {SOCIAL_LINKS.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                          >
                            <span className="shrink-0 text-xs font-bold">
                              {link.content}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-[1400px] px-6">
        <h2 className="mb-12 text-3xl font-light text-[#1a1a1a]">
          {contactCopy.formTitle}
        </h2>

        <form className="w-full space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.name.label}:
              </label>
              <input
                type="text"
                placeholder={contactCopy.fields.name.placeholder}
                className={FORM_CONTROL_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.role.label}:
              </label>
              <select
                className={`${FORM_CONTROL_CLASS} appearance-none text-gray-500`}
                defaultValue=""
              >
                <option value="" disabled>
                  {contactCopy.fields.role.placeholder}
                </option>
                {contactCopy.fields.role.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.email.label}:
              </label>
              <input
                type="email"
                placeholder={contactCopy.fields.email.placeholder}
                className={FORM_CONTROL_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.company.label}:
              </label>
              <input
                type="text"
                placeholder={contactCopy.fields.company.placeholder}
                className={FORM_CONTROL_CLASS}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.contact.label}:
              </label>
              <input
                type="text"
                placeholder={contactCopy.fields.contact.placeholder}
                className={FORM_CONTROL_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.country.label}:
              </label>
              <input
                type="text"
                placeholder={contactCopy.fields.country.placeholder}
                className={FORM_CONTROL_CLASS}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[15px] font-medium">
              <span className="mr-1 text-red-500">*</span>
              {contactCopy.fields.message.label}:
            </label>
            <textarea
              rows={6}
              placeholder={contactCopy.fields.message.placeholder}
              className={`${FORM_CONTROL_CLASS} resize-none`}
            />
          </div>

          <button
            type="button"
            className="w-full bg-[#0a1e3f] py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-black"
          >
            {contactCopy.submit}
          </button>
        </form>
      </section>

      <section className="mx-auto mb-24 max-w-[1400px] px-6">
        <div className="flex w-full flex-col items-center justify-between bg-neutral-100 p-8 md:flex-row md:p-16">
          <div className="mb-8 text-center md:mb-0 md:mr-8 md:text-left">
            <h2 className="mb-4 text-4xl font-light text-[#112349] md:text-5xl">
              {contactCopy.sampleTitleLine1}
            </h2>
            <h2 className="text-4xl font-light text-[#5a718b] md:text-5xl">
              {contactCopy.sampleTitleLine2}
            </h2>
          </div>
          <div className="relative h-[250px] w-full max-w-3xl flex-1 md:h-[300px]">
            <div className="absolute right-0 top-0 flex h-full w-full items-center justify-center bg-[#e5e7eb] text-sm text-gray-400">
              {contactCopy.samplePlaceholder}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
