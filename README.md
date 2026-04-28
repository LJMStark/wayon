# ZYL Stone Web (wayon-web)

ZYL Stone 多语言企业官网：Next.js 16 + Sanity CMS 驱动的产品目录、新闻、解决方案与询盘站点。支持中 / 英 / 西 / 阿 / 俄 五种语言，默认中文（zh）。

## 技术栈

- **Next.js 16.2.1** (App Router, React Server Components)
- **React 19.2**
- **Sanity CMS 5** (嵌入式 Studio，路径 `/studio`)
- **next-intl** 多语言路由与文案
- **Tailwind CSS 4**
- **Resend** 询盘邮件投递
- **Vercel Analytics** + **Speed Insights**
- **Vitest** 单元测试 / **Playwright** E2E

## Quick Start

```bash
git clone <repo-url> wayon
cd wayon
cp .env.example .env.local   # 按下方表格填写
npm install
npm run dev                  # http://localhost:3000
```

Studio 在开发服务器启动后访问 `http://localhost:3000/studio` 使用。

## 环境变量

以下 key 必须在 `.env.local` 中配置。缺失时构建或运行会直接抛错，不存在回退值。

| Key | 说明 | 获取方式 |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity 项目 ID | Sanity 控制台 → Project Settings |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity 数据集名（通常 `production`） | Sanity 控制台 → Datasets |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API 版本（如 `2026-04-03`） | 使用当前日期或项目约定版本 |
| `SANITY_API_TOKEN` | Sanity 写入令牌 | Sanity 控制台 → API → Tokens（需 Editor 及以上） |
| `RESEND_API_KEY` | Resend 邮件服务 API Key | Resend 控制台 → API Keys |
| `RESEND_FROM_EMAIL` | 询盘邮件发信地址 | 已在 Resend 验证过的域名邮箱 |
| `INQUIRY_NOTIFY_TO` | 询盘通知收件地址 | 团队内部指定邮箱 |

**安全提示**：永远不要把 `.env.local` 提交到 Git；所有密钥通过各服务控制台获取，不在仓库中保存示例值。

## 常用命令

```bash
npm run dev                  # 启动开发服务器
npm run build                # 生产构建
npm run start                # 启动生产服务器
npm run lint                 # ESLint 静态检查
npm run typecheck            # TypeScript 类型检查
npm test                     # 运行 Vitest 单测
npm run test:watch           # Vitest 监听模式
npm run test:e2e             # Playwright E2E（需先 npm run dev）
npm run import:trade-catalog # 导入 trade 目录数据到 Sanity
npm run generate:product-copy # 生成产品级四语文案草稿（默认 dry-run）
```

## 项目结构

```
src/
  app/             # Next.js App Router：[locale] 路由、Sanity Studio、Server Actions
  components/      # 跨页面共用 UI（layout / landing / products ...）
  features/        # 功能模块（home / products / news / shared），按 model + lib + components 组织
  sanity/          # Sanity client、GROQ 查询、schema 定义
  i18n/            # next-intl routing 与 request 配置
  data/            # 静态 JSON 数据与站点文案
  messages/        # 各 locale 翻译 JSON
```

详细约定见 [CLAUDE.md](./CLAUDE.md)。

## 部署

部署目标为 Vercel：

1. 在 Vercel 导入本仓库
2. 在 Project Settings → Environment Variables 中补齐上文所有 key
3. 每次推送 `main` 触发自动部署；PR 会生成预览环境
4. Sanity Studio 随站点部署，访问 `/studio`

## Sanity Studio 用法

- 本地：`npm run dev` 后打开 `/studio`
- 部署后：访问生产域名下的 `/studio`
- Schema 修改位于 `src/sanity/schemaTypes/`；改动后无需手动部署 schema（Studio 随应用构建打包）

## 贡献规范

提交 PR 前请本地通过以下命令：

```bash
npm run lint
npm run typecheck
npm test
```

- Commit 消息遵循 Conventional Commits（`feat:` / `fix:` / `refactor:` / `docs:` 等）
- 一个 PR 只做一件事，附带必要的测试
- 涉及 UI 变更时，同步在 PR 描述中贴截图或录屏

## 许可证

私有项目，未经授权不得分发。
