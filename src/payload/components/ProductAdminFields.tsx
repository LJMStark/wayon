"use client";

/* eslint-disable @next/next/no-img-element */
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useEffect, useMemo, useState } from "react";

import {
  pickVariantCoverUrl,
  readUrlFromMediaRef,
  type VariantDoc,
} from "./productAdminUtils";

type VariantImageResult = {
  productId: string;
  url: string | null;
};

export function ProductCoverPreviewField() {
  const { collectionSlug, data, id, savedDocumentData } = useDocumentInfo();
  const directImage = useFormFields(([fields]) => fields?.image?.value);
  const hiddenCoverUrl =
    readStringUrl(data?.coverImageUrl) ??
    readStringUrl(savedDocumentData?.coverImageUrl);
  const directUrl =
    hiddenCoverUrl ??
    readUrlFromMediaRef(directImage) ??
    readUrlFromMediaRef(data?.image) ??
    readUrlFromMediaRef(savedDocumentData?.image);
  const productId = id ? String(id) : "";
  const [variantImage, setVariantImage] = useState<VariantImageResult | null>(
    null
  );

  useEffect(() => {
    if (collectionSlug !== "products" || directUrl || !productId) {
      return;
    }

    let cancelled = false;
    const url =
      `/api/productVariants?where[productRef][equals]=${encodeURIComponent(productId)}` +
      `&limit=20&sort=sortOrder&depth=1`;

    fetch(url, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { docs?: VariantDoc[] } | null) => {
        if (cancelled) return;
        setVariantImage({
          productId,
          url: pickVariantCoverUrl(payload?.docs ?? []),
        });
      })
      .catch(() => {
        if (!cancelled) setVariantImage({ productId, url: null });
      });

    return () => {
      cancelled = true;
    };
  }, [collectionSlug, directUrl, productId]);

  if (collectionSlug !== "products") return null;

  const hasLoadedVariant =
    variantImage != null && variantImage.productId === productId;
  const variantUrl = hasLoadedVariant ? variantImage.url : null;
  const finalUrl = directUrl ?? variantUrl;
  const sourceLabel = hiddenCoverUrl
    ? "来自隐藏封面 URL"
    : directUrl
      ? "来自主图字段"
      : "来自产品型号图片";
  const loading = !directUrl && Boolean(productId) && !hasLoadedVariant;

  return (
    <div
      style={{
        marginBlock: 12,
        padding: 12,
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 6,
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          color: "var(--theme-text)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        当前前台列表封面
      </div>

      {loading ? (
        <div style={mutedTextStyle}>正在读取产品型号图片…</div>
      ) : finalUrl ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            alt=""
            loading="lazy"
            src={finalUrl}
            style={{
              width: 120,
              height: 90,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid var(--theme-elevation-150)",
              background: "var(--theme-elevation-100)",
            }}
          />
          <div>
            <div
              style={{
                color: "var(--theme-text)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {sourceLabel}
            </div>
            <div style={mutedTextStyle}>
              前台列表优先使用隐藏封面 URL，其次使用主图；都为空时，再从产品型号里的元素图、空间图、实拍图里取一张。
            </div>
          </div>
        </div>
      ) : (
        <div style={mutedTextStyle}>
          还没有可用列表封面。可以上传主图，或在产品型号里添加元素图、空间图、实拍图。
        </div>
      )}
    </div>
  );
}

export function ProductSeriesTypesSummaryField() {
  const { collectionSlug } = useDocumentInfo();
  const value = useFormFields(([fields]) => fields?.seriesTypes?.value);
  const seriesTypes = useMemo(() => normalizeStringArray(value), [value]);

  if (collectionSlug !== "products") return null;

  return (
    <div
      style={{
        marginTop: -8,
        marginBottom: 18,
        padding: "10px 12px",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 6,
        background: "var(--theme-elevation-50)",
      }}
    >
      <div
        style={{
          color: "var(--theme-text)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: seriesTypes.length > 0 ? 8 : 0,
        }}
      >
        已选系列
      </div>
      {seriesTypes.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {seriesTypes.map((seriesType) => (
            <span
              key={seriesType}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 28,
                padding: "4px 9px",
                border: "1px solid var(--theme-elevation-200)",
                borderRadius: 4,
                background: "var(--theme-elevation-0, #fff)",
                color: "var(--theme-text)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {seriesType}
            </span>
          ))}
        </div>
      ) : (
        <div style={mutedTextStyle}>当前产品还没有选择岩板产品系列小类。</div>
      )}
    </div>
  );
}

const mutedTextStyle: React.CSSProperties = {
  color: "var(--theme-elevation-500)",
  fontSize: 12,
  lineHeight: 1.5,
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const objectValue = (item as { value?: unknown }).value;
        return typeof objectValue === "string" ? objectValue : "";
      }
      return "";
    })
    .filter((item) => item.length > 0);
}

function readStringUrl(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
