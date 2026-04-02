# Wayon Homepage Design

**Date:** 2026-04-01
**Source:** `https://www.wayon.com/`
**Target:** `/Users/demon/vibecoding/wayon/wayon-web`

## Goal

将当前 `wayon-web` 首页从“结构相近”的静态复刻，提升到尽可能接近线上站点的高保真实现，优先还原用户可见的布局、资源、交互层级和视觉节奏，不复制埋点与第三方跟踪。

## Scope

- 首页、全局头部、全局页脚、悬浮侧栏
- 首页依赖的数据和静态资源
- 首页元数据、字体、主题 token

不在本轮范围内：

- 第三方统计、聊天脚本、广告跟踪
- 非首页二级页面的完整视觉重做
- CMS 动态化接入

## Source Structure

线上首页结构：

1. Fixed Header
2. Hero banner slider
3. About intro
4. About album slider
5. Product carousel
6. Pre-fabricated solution slider + thumb tabs
7. Engineering case grid
8. Cooperative partner carousel
9. News split layout
10. Social media tabs
11. Footer

## Visual System

### Typography

- 主字体：`Montserrat`
- 主要字重：`300 / 400 / 500 / 700`
- 标题多为大写，字距紧凑，视觉中心偏上
- 目前本地 `Outfit + Inter/Geist` 不符合原站辨识度，应替换

### Color

```css
--theme-color: #002b50;
--theme-accent: #ffd908;
--theme-bg: #ffffff;
--theme-bg-soft: #f7fafd;
--theme-surface: #f6f6f6;
--theme-text: #333333;
--theme-text-muted: #666666;
--theme-text-soft: #999999;
--theme-footer: #111111;
--theme-border: rgba(207, 207, 207, 0.35);
```

### Layout Rhythm

- 主容器宽度：`1140px`
- 宽幅头部 / mega menu：`1400px`
- 区块间距：桌面约 `110px - 140px`
- Header 高度：桌面约 `80px`
- 整体偏硬朗，不靠大圆角建立风格

## Interaction Model

- Header: fixed，桌面 hover 下拉，`Collection` 为复杂 mega menu
- Hero: 两屏轮播，第一屏视频，第二屏图片
- About album: 主轮播 + 缩略图 + 左右箭头
- Product: hover 抬升卡片并展开说明层
- Solution: 主图文轮播 + 底部 thumb tabs
- Case: hover reveal 标题
- Partner: 横向大卡，不是普通网格
- Social: 左平台切换，右内容联动

## Local Architecture

建议将首页从单文件拆分为独立 landing 组件：

- `src/components/landing/Hero.tsx`
- `src/components/landing/AboutIntro.tsx`
- `src/components/landing/AboutAlbum.tsx`
- `src/components/landing/ProductsCarousel.tsx`
- `src/components/landing/SolutionTabs.tsx`
- `src/components/landing/EngineeringCase.tsx`
- `src/components/landing/PartnerCarousel.tsx`
- `src/components/landing/NewsSection.tsx`
- `src/components/landing/SocialTabs.tsx`

保留全局布局组件在：

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/FloatingSidebar.tsx`

数据集中在：

- `src/data/home.ts`
- `src/data/navigation.ts`

## Asset Strategy

将线上关键资源本地化到 `wayon-web/public/assets/`，避免运行时依赖第三方静态源：

- `brand/`
- `hero/`
- `about/`
- `solutions/`
- `partner/`
- `news/`
- `social/`
- `backgrounds/`
- `footer/`
- `icons/social/`

保留已有：

- `categories/`
- `cases/`
- `products/`

## Risks

- 线上首页使用第三方 CSS 和脚本组合，源码结构不适合逐行搬运，需要在 React 中重建
- 原站多个区域是 Swiper 语义，当前项目无对应轮播库，需决定使用依赖或纯 React 实现
- “100% 还原”在字体渲染、第三方脚本、灯箱库层面无法做到绝对像素一致，本轮目标定义为“用户可感知层面高保真”

## Verification

- `cd wayon-web && npm run lint`
- `cd wayon-web && npm run build`
- 浏览器人工对照线上首页和本地首页的布局、资源、交互
