import type { Payload, Where, WidgetServerProps } from "payload";

type CountValue = {
  totalDocs: number;
};

type CollectionCount = {
  collection: "products" | "news" | "media" | "inquiries";
  where?: Where;
};

type LatestInquiry = {
  company: string;
  country: string;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  status: "pending" | "contacted" | "resolved" | "spam";
};

type LatestNews = {
  createdAt: string;
  id: string;
  publishedAt: string;
  slug: string;
  title: string;
  _status?: "draft" | "published" | null;
};

const ADMIN_BASE = "/admin";

const statusLabel: Record<LatestInquiry["status"], string> = {
  contacted: "已联系",
  pending: "待处理",
  resolved: "已解决",
  spam: "垃圾信息",
};

function toCount(payload: Promise<CountValue>): Promise<number> {
  return payload.then((result) => result.totalDocs).catch(() => 0);
}

function count(payload: Payload, args: CollectionCount): Promise<number> {
  return toCount(
    payload.count({
      collection: args.collection,
      overrideAccess: false,
      where: args.where,
    }),
  );
}

async function findLatestInquiries(payload: Payload): Promise<LatestInquiry[]> {
  const result = await payload.find({
    collection: "inquiries",
    depth: 0,
    limit: 4,
    overrideAccess: false,
    select: {
      company: true,
      country: true,
      createdAt: true,
      email: true,
      name: true,
      status: true,
    },
    sort: "-createdAt",
  });

  return result.docs.map((doc) => ({
    company: doc.company,
    country: doc.country,
    createdAt: doc.createdAt,
    email: doc.email,
    id: doc.id,
    name: doc.name,
    status: doc.status,
  }));
}

async function findLatestNews(payload: Payload): Promise<LatestNews[]> {
  const result = await payload.find({
    collection: "news",
    depth: 0,
    draft: true,
    limit: 4,
    overrideAccess: false,
    select: {
      createdAt: true,
      publishedAt: true,
      slug: true,
      title: true,
      _status: true,
    },
    sort: "-updatedAt",
  });

  return result.docs.map((doc) => ({
    createdAt: doc.createdAt,
    id: doc.id,
    publishedAt: doc.publishedAt,
    slug: doc.slug,
    title: doc.title,
    _status: doc._status,
  }));
}

export async function AdminOverviewWidget({ req }: WidgetServerProps) {
  const payload = req.payload;

  const [
    totalProducts,
    publishedProducts,
    totalNews,
    draftNews,
    pendingInquiries,
    totalMedia,
  ] = await Promise.all([
    count(payload, { collection: "products" }),
    count(payload, {
      collection: "products",
      where: { published: { equals: true } },
    }),
    count(payload, { collection: "news" }),
    count(payload, {
      collection: "news",
      where: { _status: { equals: "draft" } },
    }),
    count(payload, {
      collection: "inquiries",
      where: { status: { equals: "pending" } },
    }),
    count(payload, { collection: "media" }),
  ]);

  const stats = [
    {
      href: `${ADMIN_BASE}/collections/products`,
      label: "产品总数",
      value: totalProducts,
      meta: `${publishedProducts} 个已发布`,
    },
    {
      href: `${ADMIN_BASE}/collections/news`,
      label: "新闻文章",
      value: totalNews,
      meta: `${draftNews} 篇草稿`,
    },
    {
      href: `${ADMIN_BASE}/collections/inquiries?where[status][equals]=pending`,
      label: "待处理询盘",
      value: pendingInquiries,
      meta: "需要销售跟进",
      urgent: pendingInquiries > 0,
    },
    {
      href: `${ADMIN_BASE}/collections/media`,
      label: "媒体素材",
      value: totalMedia,
      meta: "R2 存储",
    },
  ];

  return (
    <section className="wayon-admin-overview">
      <div className="wayon-admin-overview__header">
        <div>
          <p>运营概览</p>
          <h2>今天先看这些</h2>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          查看官网
        </a>
      </div>
      <div className="wayon-admin-stats">
        {stats.map((item) => (
          <a
            className={
              item.urgent ? "wayon-admin-stat urgent" : "wayon-admin-stat"
            }
            href={item.href}
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString("zh-CN")}</strong>
            <small>{item.meta}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

export function AdminQuickActionsWidget() {
  const actions = [
    {
      description: "新建或整理产品目录",
      href: `${ADMIN_BASE}/collections/products`,
      label: "产品",
    },
    {
      description: "发布公司新闻和展会动态",
      href: `${ADMIN_BASE}/collections/news`,
      label: "新闻",
    },
    {
      description: "查看客户留言和处理状态",
      href: `${ADMIN_BASE}/collections/inquiries`,
      label: "询盘",
    },
    {
      description: "上传产品图、展厅图和证书",
      href: `${ADMIN_BASE}/collections/media`,
      label: "媒体",
    },
  ];

  return (
    <section className="wayon-admin-widget wayon-admin-quick-actions">
      <div className="wayon-admin-widget__header">
        <span>常用入口</span>
      </div>
      <div className="wayon-admin-action-list">
        {actions.map((action) => (
          <a href={action.href} key={action.href}>
            <strong>{action.label}</strong>
            <span>{action.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export async function AdminLatestInquiriesWidget({ req }: WidgetServerProps) {
  const inquiries = await findLatestInquiries(req.payload).catch(() => []);

  return (
    <section className="wayon-admin-widget">
      <div className="wayon-admin-widget__header">
        <span>最新询盘</span>
        <a href={`${ADMIN_BASE}/collections/inquiries`}>全部</a>
      </div>
      {inquiries.length > 0 ? (
        <div className="wayon-admin-feed">
          {inquiries.map((item) => (
            <a
              href={`${ADMIN_BASE}/collections/inquiries/${item.id}`}
              key={item.id}
            >
              <div>
                <strong>{item.company || item.name}</strong>
                <span>
                  {item.name} / {item.country}
                </span>
              </div>
              <small data-status={item.status}>
                {statusLabel[item.status]}
              </small>
            </a>
          ))}
        </div>
      ) : (
        <p className="wayon-admin-empty">暂无询盘。</p>
      )}
    </section>
  );
}

export async function AdminLatestNewsWidget({ req }: WidgetServerProps) {
  const news = await findLatestNews(req.payload).catch(() => []);

  return (
    <section className="wayon-admin-widget">
      <div className="wayon-admin-widget__header">
        <span>最近新闻</span>
        <a href={`${ADMIN_BASE}/collections/news`}>全部</a>
      </div>
      {news.length > 0 ? (
        <div className="wayon-admin-feed">
          {news.map((item) => (
            <a href={`${ADMIN_BASE}/collections/news/${item.id}`} key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.slug}</span>
              </div>
              <small data-status={item._status ?? "draft"}>
                {item._status === "published" ? "已发布" : "草稿"}
              </small>
            </a>
          ))}
        </div>
      ) : (
        <p className="wayon-admin-empty">暂无新闻。</p>
      )}
    </section>
  );
}

export function AdminWorkflowWidget() {
  const steps = [
    "先上传媒体素材，并补齐替代文本。",
    "新增产品或新闻，先填写中文内容并保存草稿。",
    "页面右上角切换语言（中文 / English / Español / العربية），分别录入 4 个语种的内容。每次切换保存只会保存当前语言。",
    "确认 4 个语种内容齐全后再发布。某语种留空时前台会自动回落显示英文；英文也为空时该语种页面会显示空白。",
  ];

  return (
    <section className="wayon-admin-widget wayon-admin-workflow">
      <div className="wayon-admin-widget__header">
        <span>编辑顺序</span>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
