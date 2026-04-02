# Wayon Homepage Final Polish Design

**Date:** 2026-04-01
**Source:** `https://www.wayon.com/`
**Target:** `/Users/demon/vibecoding/wayon/wayon-web`

## Goal

在现有高保真首页基础上，继续压最后 5% 的视觉细节，使其在用户第一眼的观感、版式节奏、细部交互和构图上更接近源站。

## Scope

- 只做首页与全局头尾的视觉参数微调
- 不调整 section 结构、不改数据模型、不新增功能
- 优先处理“肉眼最容易看出不像”的细节

## Visual Targets

1. Header
   - Logo 尺寸与留白更接近源站
   - 导航项字重更轻、间距更均匀、选中线更短更精确
   - 右侧图标与语言控件更收敛

2. Hero + About band
   - 首屏下沿与 `ABOUT WAYON STONE` 黑色信息带的衔接更像源站
   - 黑带左右列宽更接近原站，正文最大宽度略收窄
   - CTA 基线与标题层级更统一

3. Product / Solution / Partner
   - Product 卡片更窄、更高，hover 抬升幅度和标题变化更克制
   - Solution 遮罩透明度和 CTA 文案更接近原站
   - Partner 卡片阴影、圆角处理、右上角标签弧度更贴近

4. Footer + Floating Sidebar
   - Footer 列间距、按钮大小、文案灰度继续靠近源站
   - 悬浮侧栏按钮尺寸、边框和贴边距离收敛

## Execution Strategy

- 通过浏览器逐段对照源站与本地，不做凭印象的泛化“美化”
- 只修改样式参数、局部布局比例和少量文案细节
- 每改一轮就做桌面与移动端复验

## Verification

- `cd wayon-web && npm run lint`
- `cd wayon-web && npm run build`
- 浏览器对照源站关键区域：
  - header / hero / about band
  - product / solution / partner
  - footer / floating sidebar
