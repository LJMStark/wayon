"use client";

/* eslint-disable @next/next/no-img-element */
import { useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useMemo } from "react";

import {
  pickVariantCoverUrl,
  readUrlFromMediaRef,
  type ImageMediaItem,
  type VariantDoc,
} from "./productAdminUtils";

// Read media arrays directly off the product's own form fields.
function readSelfImageArray(value: unknown): ImageMediaItem[] {
  return Array.isArray(value) ? (value as ImageMediaItem[]) : [];
}

export function ProductCoverPreviewField() {
  const { collectionSlug, data, savedDocumentData } = useDocumentInfo();
  const directImage = useFormFields(([fields]) => fields?.image?.value);
  const selfElementImages = useFormFields(([fields]) => fields?.elementImages?.value);
  const selfSpaceImages = useFormFields(([fields]) => fields?.spaceImages?.value);
  const selfRealImages = useFormFields(([fields]) => fields?.realImages?.value);

  const hiddenCoverUrl =
    readStringUrl(data?.coverImageUrl) ??
    readStringUrl(savedDocumentData?.coverImageUrl);
  const directUrl =
    hiddenCoverUrl ??
    readUrlFromMediaRef(directImage) ??
    readUrlFromMediaRef(data?.image) ??
    readUrlFromMediaRef(savedDocumentData?.image);

  // Synthesise a single VariantDoc from the product's own media arrays so we
  // can reuse the existing pickVariantCoverUrl picker.
  const selfCoverUrl = useMemo(() => {
    if (collectionSlug !== "products") return null;
    const elementImages = readSelfImageArray(selfElementImages);
    const spaceImages = readSelfImageArray(selfSpaceImages);
    const realImages = readSelfImageArray(selfRealImages);
    if (elementImages.length === 0 && spaceImages.length === 0 && realImages.length === 0) {
      return null;
    }
    const synthetic: VariantDoc = {
      code: null,
      elementImages,
      spaceImages,
      realImages,
      videos: [],
      sortOrder: 0,
    };
    return pickVariantCoverUrl([synthetic]);
  }, [collectionSlug, selfElementImages, selfSpaceImages, selfRealImages]);

  if (collectionSlug !== "products") return null;

  const finalUrl = directUrl ?? selfCoverUrl;
  const sourceLabel = hiddenCoverUrl
    ? "来自隐藏封面 URL"
    : directUrl
      ? "来自主图字段"
      : "来自产品图片";

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

      {finalUrl ? (
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
              前台列表优先使用隐藏封面 URL，其次使用主图；都为空时，再从下方的材质纹理图、实景应用图、工地实拍图里取一张。
            </div>
          </div>
        </div>
      ) : (
        <div style={mutedTextStyle}>
          还没有可用列表封面。可以上传主图，或在下方添加材质纹理图、实景应用图、工地实拍图。
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
