"use client";

import { useEffect, useState } from "react";

type ProductCoverCellProps = {
  cellData?: unknown;
  rowData?: { id?: string };
};

type MediaRef = { url?: string | null } | null | undefined;
type ImageMediaItem = { mediaRef?: MediaRef };
type VariantDoc = {
  elementImages?: ImageMediaItem[] | null;
  spaceImages?: ImageMediaItem[] | null;
  realImages?: ImageMediaItem[] | null;
};

function readUrlFromMediaRef(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const url = (value as { url?: unknown }).url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function pickFirstImageUrl(variant: VariantDoc | undefined): string | null {
  if (!variant) return null;
  const candidates: ImageMediaItem[] = [
    ...(variant.elementImages ?? []),
    ...(variant.spaceImages ?? []),
    ...(variant.realImages ?? []),
  ];
  for (const item of candidates) {
    const url = readUrlFromMediaRef(item?.mediaRef);
    if (url) return url;
  }
  return null;
}

export function ProductCoverCell({ cellData, rowData }: ProductCoverCellProps) {
  const directUrl = readUrlFromMediaRef(cellData);
  const productId = rowData?.id;

  const [variantUrl, setVariantUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!directUrl && Boolean(productId));

  useEffect(() => {
    if (directUrl || !productId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const url =
      `/api/productVariants?where[productRef][equals]=${encodeURIComponent(productId)}` +
      `&limit=1&sort=sortOrder&depth=1`;
    fetch(url, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { docs?: VariantDoc[] } | null) => {
        if (cancelled) return;
        setVariantUrl(pickFirstImageUrl(payload?.docs?.[0]));
      })
      .catch(() => {
        if (!cancelled) setVariantUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [directUrl, productId]);

  const finalUrl = directUrl ?? variantUrl;

  if (loading && !finalUrl) {
    return <span style={{ color: "var(--theme-elevation-400)" }}>…</span>;
  }
  if (!finalUrl) {
    return <span style={{ color: "var(--theme-elevation-400)" }}>—</span>;
  }
  return (
    <img
      src={finalUrl}
      alt=""
      loading="lazy"
      style={{
        width: 48,
        height: 48,
        objectFit: "cover",
        borderRadius: 4,
        display: "block",
      }}
    />
  );
}
