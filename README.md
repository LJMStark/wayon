# ZYL Stone Web (wayon-web)

ZYL Stone 多语言企业官网：Next.js 16 + Payload CMS 3 驱动的产品目录、新闻、解决方案与询盘站点。支持中 / 英 / 西 / 阿 四种语言，默认中文（zh）。

## 技术栈

- **Next.js 16.2.4** (App Router, React Server Components)
- **React 19**
- **Payload CMS 3.83**（嵌入式管理后台，路径 `/admin`）
- **PostgreSQL**（通过 `@payloadcms/db-postgres`）
- **Cloudflare R2**（媒体文件存储，S3 兼容）
- **next-intl** 多语言路由与文案
- **Tailwind CSS 4**
- **Resend** 询盘邮件投递
- **Vitest** 单元测试 / **Playwright** E2E

## Quick Start

```bash
git clone <repo-url> wayon
cd wayon
cp .env.example .env.local   # 按下方表格填写
npm install
npm run dev                  # http://localhost:3000
```

管理后台在开发服务器启动后访问 `http://localhost:3000/admin`（需要有效的 `DATABASE_URL`）。

## 环境变量

以下 key 必须在 `.env.local` 中配置。缺失时构建或运行会直接抛错，不存在回退值。

| Key | 说明 | 获取方式 |
| --- | --- | --- |
| `PAYLOAD_SECRET` | Payload CMS 加密密钥（随机长字符串） | 自行生成（如 `openssl rand -hex 32`） |
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host:5432/db` |
| `R2_BUCKET` | Cloudflare R2 存储桶名称 | Cloudflare 控制台 → R2 |
| `R2_ENDPOINT` | R2 S3 兼容端点 | `https://<accountid>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | R2 公开访问域名 | Cloudflare 控制台 → R2 → 自定义域名 |
| `R2_ACCESS_KEY_ID` | R2 API 访问密钥 ID | Cloudflare 控制台 → R2 → API 令牌 |
| `R2_SECRET_ACCESS_KEY` | R2 API 访问密钥 | 同上 |
| `RESEND_API_KEY` | Resend 邮件服务 API Key | Resend 控制台 → API Keys |
| `RESEND_FROM_EMAIL` | 询盘邮件发信地址 | 已在 Resend 验证过的域名邮箱 |
| `INQUIRY_NOTIFY_TO` | 询盘通知收件地址（多个用逗号分隔） | 团队内部指定邮箱 |
| `NEXT_PUBLIC_SITE_URL` | 站点公开域名（可选，有回退值） | 如 `https://zylsinteredstone.com` |
| `OPENAI_API_KEY` | OpenAI API Key（仅 generate:product-copy 脚本使用） | OpenAI 控制台 |

**安全提示**：永远不要把 `.env.local` 提交到 Git；`.gitignore` 已排除该文件。

## 常用命令

```bash
npm run dev                   # 启动开发服务器（http://localhost:3000）
npm run build                 # 生产构建
npm run start                 # 启动生产服务器
npm run lint                  # ESLint 静态检查
npm run typecheck             # 生成 Next 路由类型并执行 TypeScript 检查
npm test                      # 运行 Vitest 单测
npm run test:watch            # Vitest 监听模式
npm run test:e2e              # Playwright E2E（需先 npm run dev）

# Payload CMS
npm run payload               # Payload CLI 直通
npm run generate:types        # 重新生成 src/payload-types.ts（改 schema 后运行）
npm run generate:importmap    # 重新生成 Payload admin import map

# 数据迁移脚本（一次性，详见 CLAUDE.md）
npm run import:422-catalog    # 从 docs/4.22/ 导入产品目录
npm run migrate:existing-media # 将旧 /api/trade-media/* 引用迁移到 R2
npm run generate:product-copy # 生成产品多语言文案草稿（默认 dry-run）
```

## 项目结构

```
src/
  app/
    [locale]/        # 公开路由（zh/en/es/ar），含首页、产品、新闻、联系等
    (payload)/       # Payload 路由组：/admin 后台 + /api REST 端点
    api/             # 自定义 API 路由（trade-media 文件代理）
    actions/         # Server Actions（inquiry.ts 询盘表单）
  components/        # 跨页面共用 UI（layout / landing / products 等）
  features/          # 功能模块（home / products / news / shared）
  payload/           # Payload collection schema、hooks
  data/              # 服务端数据获取（products.ts、news.ts）
  i18n/              # next-intl 路由与 request 配置
  lib/               # 环境变量验证（env.ts、server-env.ts）
  messages/          # 各 locale 翻译 JSON（en/zh/es/ar）
```

详细约定、架构决策与迁移脚本说明见 [CLAUDE.md](./CLAUDE.md)。

## 部署

生产环境部署在 **Zeabur**，域名 `zylsinteredstone.com`。Zeabur 使用 zbpack 自动检测并构建 Next.js 项目。

部署步骤：

1. 在 Zeabur 控制台导入本仓库
2. 在 Service → Variables 中补齐上方所有环境变量
3. 推送 `main` 分支触发自动部署

## 贡献规范

提交 PR 前请本地通过以下命令：

```bash
npm run lint
npm run typecheck
npm test
```

- Commit 消息遵循 Conventional Commits（`feat:` / `fix:` / `refactor:` / `docs:` 等）
- 一个 PR 只做一件事，附带必要的测试
- 涉及 UI 变更时，在 PR 描述中贴截图或录屏

## 许可证

私有项目，未经授权不得分发。
