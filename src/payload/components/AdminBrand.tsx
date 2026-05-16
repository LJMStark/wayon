/* eslint-disable @next/next/no-img-element */
import type { ServerProps } from "payload";

const WORDMARK_SRC = "/assets/brand/logo-wayon-stone-group.png";

type AdminBrandProps = Pick<ServerProps, "viewType"> & {
  compact?: boolean;
};

export function AdminLogo() {
  return (
    <div className="wayon-admin-logo" aria-label="Wayon CMS">
      <img src={WORDMARK_SRC} alt="Wayon Stone Group" />
    </div>
  );
}

export function AdminIcon() {
  return (
    <span className="wayon-admin-icon" aria-hidden="true">
      W
    </span>
  );
}

export function AdminNavBrand({ compact = false }: AdminBrandProps) {
  return (
    <div
      className={
        compact ? "wayon-admin-nav-brand compact" : "wayon-admin-nav-brand"
      }
    >
      <AdminIcon />
      <div>
        <strong>Wayon CMS</strong>
        <span>产品、新闻与询盘管理</span>
      </div>
    </div>
  );
}

export function AdminLoginIntro() {
  return (
    <div className="wayon-admin-login-intro">
      <p>岩联岩板官网后台</p>
      <span>管理产品目录、新闻内容、媒体素材和客户询盘。</span>
    </div>
  );
}
