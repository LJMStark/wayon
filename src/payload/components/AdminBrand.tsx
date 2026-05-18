/* eslint-disable @next/next/no-img-element */
import type { ServerProps } from "payload";

const WORDMARK_SRC = "/assets/brand/logo-yanlian-yanban-header.jpg";
const BRAND_NAME = "众岩联岩板";
const CMS_TITLE = `${BRAND_NAME} CMS`;

type AdminBrandProps = Pick<ServerProps, "viewType"> & {
  compact?: boolean;
};

export function AdminLogo() {
  return (
    <div className="zyl-admin-logo" aria-label={CMS_TITLE}>
      <img src={WORDMARK_SRC} alt={BRAND_NAME} />
    </div>
  );
}

export function AdminIcon() {
  return (
    <span className="zyl-admin-icon" aria-hidden="true">
      众
    </span>
  );
}

export function AdminNavBrand({ compact = false }: AdminBrandProps) {
  return (
    <div
      className={
        compact ? "zyl-admin-nav-brand compact" : "zyl-admin-nav-brand"
      }
    >
      <AdminIcon />
      <div>
        <strong>{CMS_TITLE}</strong>
        <span>产品、新闻与询盘管理</span>
      </div>
    </div>
  );
}

export function AdminLoginIntro() {
  return (
    <div className="zyl-admin-login-intro">
      <p>{BRAND_NAME}官网后台</p>
      <span>管理产品目录、新闻内容、媒体素材和客户询盘。</span>
    </div>
  );
}
