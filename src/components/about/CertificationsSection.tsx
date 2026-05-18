"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

export type CertificateItem = {
  previewSrc: string;
  type: string;
  title: string;
  number: string;
  year: string;
  issuer: string;
};

type CertificationsSectionProps = {
  sectionTitle: string;
  description: string;
  viewLabel: string;
  certifications: CertificateItem[];
};

const TYPE_LABEL: Record<string, string> = {
  patent: "专利",
  membership: "会员",
  business: "执照",
};

function CertCard({
  cert,
  viewLabel,
  onZoom,
}: {
  cert: CertificateItem;
  viewLabel: string;
  onZoom: (cert: CertificateItem) => void;
}) {
  return (
    <div className="group flex flex-col border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-md">
      <button
        type="button"
        aria-label={viewLabel}
        onClick={() => onZoom(cert)}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-gray-100"
      >
        <Image
          src={cert.previewSrc}
          alt={cert.title}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
          <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow transition-opacity duration-300 group-hover:opacity-100" />
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="w-fit bg-[#0f2858]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0f2858]">
          {TYPE_LABEL[cert.type] ?? cert.type}
        </span>
        <p className="line-clamp-2 text-sm font-medium leading-snug text-[#1a1a1a]">
          {cert.title}
        </p>
        {cert.number && (
          <p className="font-mono text-[11px] text-gray-400">{cert.number}</p>
        )}
        <p className="mt-auto text-[11px] text-gray-400">{cert.issuer}</p>
      </div>
    </div>
  );
}

function Lightbox({
  cert,
  onClose,
}: {
  cert: CertificateItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={cert.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-3xl flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">{cert.title}</p>
            {cert.number && (
              <p className="font-mono text-xs text-white/60">{cert.number}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded border border-white/30 p-1.5 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative max-h-[80vh] overflow-hidden rounded">
          <Image
            src={cert.previewSrc}
            alt={cert.title}
            width={1200}
            height={900}
            className="max-h-[80vh] w-auto object-contain"
            style={{ maxWidth: "min(100%, 1200px)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function CertificationsSection({
  sectionTitle,
  description,
  viewLabel,
  certifications,
}: CertificationsSectionProps) {
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);

  return (
    <>
      <section
        id="certifications"
        className="mx-auto max-w-7xl px-6 pb-24 pt-20"
      >
        <div className="mb-12 text-center">
          <h2 className="zyl-brand-title mb-4 text-3xl font-normal uppercase tracking-widest text-[#1a1a1a] md:text-4xl">
            {sectionTitle}
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-gray-600">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <CertCard
              key={cert.previewSrc}
              cert={cert}
              viewLabel={viewLabel}
              onZoom={setActiveCert}
            />
          ))}
        </div>
      </section>

      {activeCert && (
        <Lightbox
          cert={activeCert}
          onClose={() => setActiveCert(null)}
        />
      )}
    </>
  );
}
