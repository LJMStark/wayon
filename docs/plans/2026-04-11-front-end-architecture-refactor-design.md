# Wayon Front-End Architecture Refactor Design

**Date:** 2026-04-11
**Project:** `/Users/demon/vibecoding/wayon`

## Goal

在不做视觉重设计的前提下，把首页、产品页、新闻页重构为更适合商业级长期维护的前端结构：

- 路由页只负责参数校验、metadata 和页面装配入口
- feature 层负责页面数据组装与展示模型
- 组件层只接收 props，不直接耦合多处翻译和数据访问
- 静态内容、CMS 数据、展示映射的边界更清晰

## Problems

1. 路由页承担了过多职责  
   `src/app/[locale]/products/page.tsx`、`src/app/[locale]/news/page.tsx` 中混合了 locale 校验、数据读取、展示映射和大段 UI。

2. 首页 section 与数据源强耦合  
   `src/components/landing/*` 中多个组件直接读取 `src/data/home.ts` 和翻译，导致首页组装逻辑分散到各个 section。

3. 展示模型缺少归属  
   新闻列表项、产品详情规格、分类展示块等页面级 view model 都直接散落在路由页或数据文件中。

4. 共享页面模式未被抽象  
   locale 参数校验、页面级装配函数、feature 视图组件缺少统一模式，后续新增页面会继续复制现状。

## Architecture

### 1. Route Layer

保留 `src/app/[locale]/*` 作为 App Router 入口，但每个 route 只做：

- 解析 `params`
- 校验 locale
- 调用 feature server 装配函数
- 渲染 feature page view

### 2. Feature Layer

新增：

- `src/features/home/*`
- `src/features/products/*`
- `src/features/news/*`
- `src/features/shared/*`

每个 feature 分为两类职责：

- `server/`：页面装配、服务端 view model 生成
- `components/` / `model/` / `content/`：纯展示组件、展示映射、静态配置

### 3. Data Layer

保留现有 `src/data/*` 作为原始数据与文案访问层，但收缩职责：

- `src/data/home.ts` 继续作为首页静态内容配置来源
- `src/data/products.ts` / `src/data/news.ts` 继续负责原始数据访问和基础格式化
- 页面级映射不再直接写在 route 或 data 文件中

## Refactor Scope

### Home

- 新增 `getHomePageData(locale)`
- 首页 section 改为 props 驱动
- 新增 `HomePageView`

### Products

- 抽离分类展示配置
- 抽离产品列表页 view model
- 抽离产品详情页规格映射与页面装配
- 新增 `ProductsPageView` 和 `ProductDetailPageView`

### News

- 抽离新闻列表/详情 view model
- 抽离首页新闻 section 数据装配
- 新增 `NewsPageView` 和 `NewsDetailPageView`

### Shared

- 新增 locale 参数校验辅助
- 统一 route page 的进入方式和职责边界

## Non-Goals

- 不做视觉风格重设计
- 不引入新的状态管理库
- 不改 CMS schema
- 不额外扩展业务功能

## Verification

- `npm run lint`
- `npm run build`

验收标准：

- 页面视觉与交互不发生预期外变化
- 首页、产品、新闻 route 代码显著变薄
- 业务组装逻辑从页面组件迁移到 feature server/model 层
