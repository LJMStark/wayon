"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { submitInquiry } from "@/app/actions/inquiry";
import { PageHero } from "@/components/layout/PageHero";
import { formatCopy, getContactPageCopy } from "@/data/siteCopy";
import { Link } from "@/i18n/routing";

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

type ContactFormStatus = "idle" | "success" | "error" | "rate_limited";

const FIELD_LABEL_CLASS =
  "mb-2 block text-[11px] uppercase tracking-[0.18em] font-medium text-stone-400 transition-colors duration-300 group-focus-within:text-stone-700";
const FIELD_BASE_CONTROL_CLASS =
  "w-full border-0 border-b bg-transparent pb-3 pt-1 text-[15px] text-stone-800 outline-none transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-40";
const FIELD_FOCUS_TIMING = "cubic-bezier(0.32, 0.72, 0, 1)";

function useScrollReveal(): readonly [
  React.RefObject<HTMLDivElement | null>,
  boolean,
] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function GrainOverlay(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.028,
        mixBlendMode: "multiply",
      }}
    />
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }): React.JSX.Element {
  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <span
        className="absolute h-px w-4 bg-current transition-all duration-500"
        style={{ transform: expanded ? "rotate(45deg)" : "rotate(0deg)" }}
      />
      <span
        className="absolute h-px w-4 bg-current transition-all duration-500"
        style={{
          transform: expanded ? "rotate(-45deg)" : "rotate(90deg)",
        }}
      />
    </span>
  );
}

type FloatingFieldFrameProps = {
  id: string;
  label: string;
  required?: boolean;
  focused: boolean;
  children: React.ReactNode;
};

function getFieldControlStyle(focused: boolean): React.CSSProperties {
  return {
    borderColor: focused ? "#78716c" : "#d6d3d1",
    borderBottomWidth: "1px",
  };
}

function FloatingFieldFrame({
  id,
  label,
  required,
  focused,
  children,
}: FloatingFieldFrameProps): React.JSX.Element {
  return (
    <div className="group relative">
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
        {required ? <span className="ml-1 text-amber-600">·</span> : null}
      </label>
      <div className="relative">
        {children}
        <span
          className="absolute bottom-0 left-0 h-px bg-stone-700 transition-all duration-700"
          style={{
            width: focused ? "100%" : "0%",
            transitionTimingFunction: FIELD_FOCUS_TIMING,
          }}
        />
      </div>
    </div>
  );
}

type FloatingLabelInputProps = {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  inputKey?: string;
};

function FloatingLabelInput({
  id,
  name,
  type = "text",
  label,
  placeholder,
  autoComplete,
  required,
  disabled,
  defaultValue,
  inputKey,
}: FloatingLabelInputProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);

  return (
    <FloatingFieldFrame
      id={id}
      label={label}
      required={required}
      focused={focused}
    >
      <input
        id={id}
        key={inputKey}
        type={type}
        name={name}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        placeholder={focused ? (placeholder ?? "") : ""}
        defaultValue={defaultValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${FIELD_BASE_CONTROL_CLASS} placeholder-stone-300`}
        style={getFieldControlStyle(focused)}
      />
    </FloatingFieldFrame>
  );
}

type FloatingLabelSelectProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
  disabled?: boolean;
};

function FloatingLabelSelect({
  id,
  name,
  label,
  placeholder,
  options,
  required,
  disabled,
}: FloatingLabelSelectProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);

  return (
    <FloatingFieldFrame
      id={id}
      label={label}
      required={required}
      focused={focused}
    >
      <select
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        defaultValue=""
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${FIELD_BASE_CONTROL_CLASS} appearance-none`}
        style={getFieldControlStyle(focused)}
      >
        <option value="" disabled className="text-stone-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-stone-800">
            {opt}
          </option>
        ))}
      </select>

      <svg
        className="pointer-events-none absolute bottom-3 right-0 h-3.5 w-3.5 text-stone-400"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 5L7 10L12 5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </FloatingFieldFrame>
  );
}

type FloatingLabelTextareaProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  inputKey?: string;
  rows?: number;
};

function FloatingLabelTextarea({
  id,
  name,
  label,
  placeholder,
  required,
  disabled,
  defaultValue,
  inputKey,
  rows = 5,
}: FloatingLabelTextareaProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);

  return (
    <FloatingFieldFrame
      id={id}
      label={label}
      required={required}
      focused={focused}
    >
      <textarea
        id={id}
        key={inputKey}
        name={name}
        rows={rows}
        required={required}
        disabled={disabled}
        placeholder={focused ? (placeholder ?? "") : ""}
        defaultValue={defaultValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`${FIELD_BASE_CONTROL_CLASS} resize-none placeholder-stone-300`}
        style={getFieldControlStyle(focused)}
      />
    </FloatingFieldFrame>
  );
}

export default function ContactPage(): React.JSX.Element {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const searchParams = useSearchParams();
  const contactCopy = getContactPageCopy(locale);
  const [activeAccordion, setActiveAccordion] = useState<string>(
    contactCopy.locations[0].name
  );

  const prefilledEmail = searchParams.get("email")?.trim() ?? "";
  const prefilledProductSlug = searchParams.get("product")?.trim() ?? "";
  const prefilledMessage = useMemo(
    () =>
      prefilledProductSlug
        ? formatCopy(contactCopy.productInquiryPrefill, {
            slug: prefilledProductSlug,
          })
        : "",
    [prefilledProductSlug, contactCopy.productInquiryPrefill]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<ContactFormStatus>("idle");
  const renderedAtRef = useRef<number>(0);

  const [formRevealRef, isFormRevealVisible] = useScrollReveal();
  const [mapRevealRef, isMapRevealVisible] = useScrollReveal();

  useEffect(() => {
    renderedAtRef.current = Date.now();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(form);
    formData.set("renderedAt", String(renderedAtRef.current));
    const result = await submitInquiry(formData);

    setIsSubmitting(false);
    if (result.success) {
      setSubmitStatus("success");
      form.reset();
      return;
    }
    if (result.error === "rate_limited") {
      setSubmitStatus("rate_limited");
      return;
    }
    setSubmitStatus("error");
  };

  return (
    <main
      className="min-h-[100dvh] text-stone-800"
      style={{ backgroundColor: "#FDFBF7" }}
    >
      <GrainOverlay />

      <PageHero
        imageSrc="/assets/contact/contact-hero.jpg"
        imageAlt={contactCopy.heroTitle}
        title={contactCopy.heroTitle}
        subtitle={contactCopy.heroSubtitle}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] border-b border-stone-200/60 px-6 py-4 text-[12px] uppercase tracking-[0.12em] text-stone-400">
        <Link href="/" className="transition-colors duration-300 hover:text-stone-700">
          {tNav("home")}
        </Link>
        <span className="mx-2 text-stone-300">—</span>
        <span className="text-stone-600">{contactCopy.breadcrumbCurrent}</span>
      </div>

      {/* ── MAIN CONTENT: Editorial Split ── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr] md:gap-24 lg:gap-32">

          {/* ── LEFT: Brand + Contact Info ── */}
          <div ref={mapRevealRef}>
            {/* Eyebrow tag */}
            <div
              className="mb-8 transition-all duration-1000"
              style={{
                transform: isMapRevealVisible ? "translateY(0)" : "translateY(2rem)",
                opacity: isMapRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <span className="inline-flex items-center rounded-full border border-stone-300/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-stone-500">
                {contactCopy.mapSubtitle}
              </span>
            </div>

            {/* Main heading */}
            <div
              className="mb-12 transition-all duration-1000 delay-100"
              style={{
                transform: isMapRevealVisible ? "translateY(0)" : "translateY(2.5rem)",
                opacity: isMapRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <h1
                className="font-serif text-5xl font-light leading-[1.1] text-stone-800 md:text-6xl lg:text-7xl"
                style={{ fontFamily: "'Plus Jakarta Sans', Georgia, serif" }}
              >
                {contactCopy.heroTitle}
              </h1>
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-stone-500">
                {contactCopy.heroSubtitle}
              </p>
            </div>

            {/* Map — Double Bezel */}
            <div
              className="mb-12 transition-all duration-1000 delay-200"
              style={{
                transform: isMapRevealVisible ? "translateY(0)" : "translateY(2rem)",
                opacity: isMapRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {/* Outer shell */}
              <div
                className="rounded-[1.75rem] p-1.5"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
                }}
              >
                {/* Inner core */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: "calc(1.75rem - 0.375rem)",
                    height: "260px",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
                  }}
                >
                  <iframe
                    title={contactCopy.mapTitle}
                    src={contactCopy.mapEmbedUrl}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Locations accordion */}
            <div
              className="mb-10 space-y-0 transition-all duration-1000 delay-300"
              style={{
                transform: isMapRevealVisible ? "translateY(0)" : "translateY(1.5rem)",
                opacity: isMapRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {contactCopy.locations.map((location: ContactLocation, index: number) => {
                const isActive = activeAccordion === location.name;
                const triggerId = `contact-location-${index}-trigger`;
                const panelId = `contact-location-${index}-panel`;

                return (
                  <div
                    key={location.name}
                    className="border-b border-stone-200/70"
                  >
                    <button
                      id={triggerId}
                      onClick={() =>
                        setActiveAccordion(isActive ? "" : location.name)
                      }
                      className="flex w-full items-center justify-between py-4 text-left transition-colors duration-300 hover:text-stone-600"
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={panelId}
                    >
                      <span className="text-[13px] uppercase tracking-[0.14em] font-medium text-stone-700">
                        {location.name}
                      </span>
                      <span className="ml-4 flex-shrink-0 text-stone-400">
                        <ExpandIcon expanded={isActive} />
                      </span>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      className="overflow-hidden transition-all duration-700"
                      style={{
                        maxHeight: isActive ? "400px" : "0px",
                        opacity: isActive ? 1 : 0,
                        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    >
                      <div className="pb-5 pr-8 text-[13px] leading-relaxed text-stone-500">
                        {location.address && (
                          <div className="mb-2">
                            <span className="font-medium text-stone-400 uppercase tracking-wider text-[10px]">
                              {contactCopy.labels.address}
                            </span>
                            <p className="mt-0.5">{location.address}</p>
                          </div>
                        )}
                        {location.tel && (
                          <div className="mb-2">
                            <span className="font-medium text-stone-400 uppercase tracking-wider text-[10px]">
                              {contactCopy.labels.tel}
                            </span>
                            <p className="mt-0.5">
                              <a
                                href={`tel:${location.tel}`}
                                className="text-stone-600 transition-colors hover:text-stone-800"
                              >
                                {location.tel}
                              </a>
                            </p>
                          </div>
                        )}
                        {location.email && (
                          <div className="mb-2">
                            <span className="font-medium text-stone-400 uppercase tracking-wider text-[10px]">
                              {contactCopy.labels.email}
                            </span>
                            <p className="mt-0.5">
                              <a
                                href={`mailto:${location.email}`}
                                className="text-stone-600 transition-colors hover:text-stone-800"
                              >
                                {location.email}
                              </a>
                            </p>
                          </div>
                        )}
                        {location.businessHours && (
                          <div className="mb-2">
                            <span className="font-medium text-stone-400 uppercase tracking-wider text-[10px]">
                              {contactCopy.labels.businessHours}
                            </span>
                            <p className="mt-0.5">{location.businessHours}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social links */}
            <div
              className="flex flex-wrap gap-2 transition-all duration-1000 delay-[400ms]"
              style={{
                transform: isMapRevealVisible ? "translateY(0)" : "translateY(1rem)",
                opacity: isMapRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {contactCopy.socialLinks.map((link: ContactSocialLink) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-stone-300/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-medium text-stone-500 transition-all duration-500 hover:border-stone-500 hover:text-stone-800 active:scale-[0.97]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                >
                  {link.label}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-stone-100 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-stone-200">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none" aria-hidden="true">
                      <path d="M1 6L6 1M6 1H2M6 1V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Luxury Form ── */}
          <div ref={formRevealRef}>
            {/* Form section heading */}
            <div
              className="mb-12 transition-all duration-1000"
              style={{
                transform: isFormRevealVisible ? "translateY(0)" : "translateY(2rem)",
                opacity: isFormRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <span className="inline-flex items-center rounded-full border border-stone-300/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-stone-500">
                {contactCopy.formTitle}
              </span>
            </div>

            {/* Double Bezel form container */}
            <div
              className="transition-all duration-1000 delay-150"
              style={{
                transform: isFormRevealVisible ? "translateY(0)" : "translateY(2.5rem)",
                opacity: isFormRevealVisible ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {/* Outer shell */}
              <div
                className="rounded-[2rem] p-2"
                style={{
                  background: "rgba(0,0,0,0.025)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 32px 80px -20px rgba(0,0,0,0.06)",
                }}
              >
                {/* Inner core */}
                <div
                  className="px-8 py-10 md:px-12 md:py-12"
                  style={{
                    borderRadius: "calc(2rem - 0.5rem)",
                    background: "#FDFBF7",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8)",
                  }}
                >
                  <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Honeypot */}
                    <div
                      aria-hidden="true"
                      className="sr-only"
                    >
                      <label>
                        {contactCopy.honeypotLabel}
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          defaultValue=""
                        />
                      </label>
                    </div>

                    {/* Row 1: Name + Role */}
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div
                        className="transition-all duration-700 delay-200"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0) blur(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelInput
                          id="contact-name"
                          name="name"
                          type="text"
                          label={contactCopy.fields.name.label}
                          placeholder={contactCopy.fields.name.placeholder}
                          autoComplete="name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div
                        className="transition-all duration-700 delay-[250ms]"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelSelect
                          id="contact-role"
                          name="role"
                          label={contactCopy.fields.role.label}
                          placeholder={contactCopy.fields.role.placeholder}
                          options={contactCopy.fields.role.options}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Row 2: Email + Company */}
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div
                        className="transition-all duration-700 delay-[300ms]"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelInput
                          id="contact-email"
                          name="email"
                          type="email"
                          label={contactCopy.fields.email.label}
                          placeholder={contactCopy.fields.email.placeholder}
                          autoComplete="email"
                          required
                          disabled={isSubmitting}
                          defaultValue={prefilledEmail}
                          inputKey={`email-${prefilledEmail}`}
                        />
                      </div>
                      <div
                        className="transition-all duration-700 delay-[350ms]"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelInput
                          id="contact-company"
                          name="company"
                          type="text"
                          label={contactCopy.fields.company.label}
                          placeholder={contactCopy.fields.company.placeholder}
                          autoComplete="organization"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Row 3: Contact + Country */}
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div
                        className="transition-all duration-700 delay-[400ms]"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelInput
                          id="contact-phone"
                          name="contact"
                          type="tel"
                          label={contactCopy.fields.contact.label}
                          placeholder={contactCopy.fields.contact.placeholder}
                          autoComplete="tel"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div
                        className="transition-all duration-700 delay-[450ms]"
                        style={{
                          transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                          opacity: isFormRevealVisible ? 1 : 0,
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                        }}
                      >
                        <FloatingLabelInput
                          id="contact-country"
                          name="country"
                          type="text"
                          label={contactCopy.fields.country.label}
                          placeholder={contactCopy.fields.country.placeholder}
                          autoComplete="country-name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div
                      className="transition-all duration-700 delay-[500ms]"
                      style={{
                        transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                        opacity: isFormRevealVisible ? 1 : 0,
                        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    >
                      <FloatingLabelTextarea
                        id="contact-message"
                        name="message"
                        label={contactCopy.fields.message.label}
                        placeholder={contactCopy.fields.message.placeholder}
                        required
                        disabled={isSubmitting}
                        defaultValue={prefilledMessage}
                        inputKey={`message-${prefilledMessage}`}
                        rows={5}
                      />
                    </div>

                    {/* Status messages */}
                    <div aria-live="polite" aria-atomic="true">
                      {submitStatus === "success" && (
                        <div
                          className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-4 text-[13px] text-stone-600"
                          style={{
                            animation: "fadeSlideUp 0.6s cubic-bezier(0.32, 0.72, 0, 1) forwards",
                          }}
                        >
                          <span className="mr-2 text-stone-400">✓</span>
                          {contactCopy.successMessage}
                        </div>
                      )}
                      {submitStatus === "rate_limited" && (
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-4 text-[13px] text-amber-700">
                          <span className="mr-2">◷</span>
                          {contactCopy.rateLimitedMessage}
                        </div>
                      )}
                      {submitStatus === "error" && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-[13px] text-red-600">
                          <span className="mr-2">✕</span>
                          {contactCopy.errorMessage}
                        </div>
                      )}
                    </div>

                    {/* Submit — Button-in-Button architecture */}
                    <div
                      className="transition-all duration-700 delay-[600ms]"
                      style={{
                        transform: isFormRevealVisible ? "translateY(0)" : "translateY(1rem)",
                        opacity: isFormRevealVisible ? 1 : 0,
                        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                      }}
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative flex w-full items-center justify-between overflow-hidden rounded-full px-6 py-4 text-[13px] uppercase tracking-[0.14em] font-medium text-white transition-all duration-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          background: isSubmitting
                            ? "#78716c"
                            : "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
                          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                          boxShadow: "0 8px 40px -12px rgba(28, 25, 23, 0.35)",
                        }}
                      >
                        {/* Shimmer on hover */}
                        <span
                          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                          style={{
                            background:
                              "linear-gradient(135deg, #292524 0%, #44403c 100%)",
                          }}
                          aria-hidden="true"
                        />

                        <span className="relative z-[1]">
                          {isSubmitting ? contactCopy.submitting : contactCopy.submit}
                        </span>

                        {/* Trailing icon — nested pill */}
                        <span
                          className="relative z-[1] ml-4 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105"
                          style={{
                            background: "rgba(255,255,255,0.12)",
                            transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                          }}
                        >
                          {isSubmitting ? (
                            <svg
                              className="h-3.5 w-3.5 animate-spin text-white/70"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M2 10L10 2M10 2H4M10 2V8"
                                stroke="white"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Fine print */}
                    <p className="text-center text-[11px] leading-relaxed text-stone-400">
                      {contactCopy.finePrint}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(0.5rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
