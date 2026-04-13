<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 国际化开发策略

## 当前阶段：中文优先开发

- `defaultLocale` 已设为 `"zh"`，所有页面默认中文
- **专注开发中文页面**，不要处理任何其他语言的翻译或国际化适配
- 客户提供的资料均为中文，直接使用中文内容填充页面
- 新增页面、组件、数据时，只需要写中文内容，不需要同时维护 en/es/ar/ru 翻译
- 翻译文件（`src/messages/*.json`）和多语言数据（`src/data/siteCopy.ts`）中的其他语言字段暂不更新
- 等全部中文页面开发完成后，再统一处理国际化翻译

## 后续阶段（当前不执行）

- 批量翻译中文内容到英文及其他语言
- 将 `defaultLocale` 切回 `"en"` 以适配海外 SEO
- 补全所有语言的翻译文件
