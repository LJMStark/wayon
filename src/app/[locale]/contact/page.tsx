"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { getCommonCopy, getContactPageCopy } from "@/data/siteCopy";
import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";

import { submitInquiry } from "@/app/actions/inquiry";

const FORM_CONTROL_CLASS =
  "w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-[#0f2858] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed";

type ContactLocation = {
  name: string;
  address?: string;
  tel?: string;
  fax?: string;
  postalCode?: string;
  email?: string;
  businessHours?: string;
};

type ContactSocialLink = {
  label: string;
  href: string;
};

export default function ContactPage() {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const commonCopy = getCommonCopy(locale);
  const contactCopy = getContactPageCopy(locale);
  const [activeAccordion, setActiveAccordion] = useState<string>(
    contactCopy.locations[0].name
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | "rate_limited"
  >("idle");
  const renderedAtRef = useRef<number>(0);

  useEffect(() => {
    renderedAtRef.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    formData.set("renderedAt", String(renderedAtRef.current));
    const result = await submitInquiry(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setSubmitStatus("success");
      e.currentTarget.reset();
      return;
    }
    if (result.error === "rate_limited") {
      setSubmitStatus("rate_limited");
      return;
    }
    setSubmitStatus("error");
  };

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <section className="relative h-[350px] w-full bg-neutral-200">
        <Image
          src={TRADE_YELLOW_PLACEHOLDER_IMAGE}
          alt={contactCopy.heroTitle}
          fill
          sizes="100vw"
          priority
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
          <div className="relative w-full overflow-hidden bg-neutral-50 md:h-[600px] aspect-square md:aspect-auto">
            <iframe
              title={contactCopy.mapTitle}
              src={contactCopy.mapEmbedUrl}
              className="h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="flex flex-col gap-2">
            {contactCopy.locations.map((location: ContactLocation, index: number) => {
              const isActive = activeAccordion === location.name;
              const triggerId = `contact-location-${index}-trigger`;
              const panelId = `contact-location-${index}-panel`;

              return (
                <div
                  key={location.name}
                  className="overflow-hidden border border-gray-200"
                >
                  <button
                    id={triggerId}
                    onClick={() => setActiveAccordion(location.name)}
                    className={`flex w-full items-center p-0 transition-colors ${
                      isActive
                        ? "bg-gray-50/50"
                        : "bg-neutral-50 hover:bg-neutral-100"
                    }`}
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center ${
                        isActive
                          ? "bg-[#0f2858] text-white"
                          : "bg-[#112349] text-white"
                      }`}
                    >
                      {isActive ? (
                        <Minus className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Plus className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <span className="ml-4 flex-1 text-left text-[15px] font-medium text-gray-700">
                      {location.name}
                    </span>
                  </button>

                  {isActive && location.address ? (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="border-t border-gray-200 bg-gray-50/50 p-6 text-sm leading-relaxed text-gray-600"
                    >
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
                      {location.email ? (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            {contactCopy.labels.email}:
                          </span>{" "}
                          <a
                            href={`mailto:${location.email}`}
                            className="text-[#0ea5e9] hover:underline"
                          >
                            {location.email}
                          </a>
                        </div>
                      ) : null}
                      {location.businessHours ? (
                        <div className="mb-2">
                          <span className="text-gray-400">
                            {contactCopy.labels.businessHours}:
                          </span>{" "}
                          {location.businessHours}
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

                      <div className="flex flex-wrap gap-2">
                        {contactCopy.socialLinks.map((link: ContactSocialLink) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 items-center rounded-full bg-gray-200 px-3 text-xs font-medium transition-colors hover:bg-gray-300"
                          >
                            {link.label}
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

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-10000px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <label>
              Website (leave this field empty)
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </label>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[15px] font-medium">
                <span className="mr-1 text-red-500">*</span>
                {contactCopy.fields.name.label}:
              </label>
              <input
                type="text"
                name="name"
                required
                disabled={isSubmitting}
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
                name="role"
                required
                disabled={isSubmitting}
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
                name="email"
                required
                disabled={isSubmitting}
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
                name="company"
                required
                disabled={isSubmitting}
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
                name="contact"
                required
                disabled={isSubmitting}
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
                name="country"
                required
                disabled={isSubmitting}
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
              name="message"
              rows={6}
              required
              disabled={isSubmitting}
              placeholder={contactCopy.fields.message.placeholder}
              className={`${FORM_CONTROL_CLASS} resize-none`}
            />
          </div>

          {submitStatus === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              {contactCopy.successMessage}
            </div>
          )}

          {submitStatus === "rate_limited" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
              {contactCopy.rateLimitedMessage}
            </div>
          )}

          {submitStatus === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {contactCopy.errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0a1e3f] py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-black disabled:bg-gray-400"
          >
             {isSubmitting ? contactCopy.submitting : contactCopy.submit}
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
