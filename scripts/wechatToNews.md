# WeChat to News Draft

把一个微信公众号文章链接转成 4 语言（zh/en/es/ar）的 Payload News 草稿，图片会自动下载并上传到 R2。

## 适用场景

用户提供 `https://mp.weixin.qq.com/s/...` 形式的微信文章链接，并要求把它改写成官网新闻动态草稿。

这个流程不是逐字翻译。脚本会重写正文，去掉公众号生态内容，例如扫码关注、阅读原文、公众号署名和二维码图。

## 命令

第一次先 dry-run，看标题、图片清单、封面选择和过滤结果：

```bash
node --env-file=.env.local scripts/wechatToNews.mjs --url <wechat-url>
```

确认图片后再写入数据库：

```bash
node --env-file=.env.local scripts/wechatToNews.mjs --url <wechat-url> --apply
```

常用参数：

| 参数 | 必填 | 默认 | 说明 |
|---|---:|---|---|
| `--url` | 是 | - | 微信公众号文章完整 URL |
| `--apply` | 否 | `false` | 不加只 dry-run，加了才写库 |
| `--slug` | 否 | LLM 生成 / 拼音回落 | 自定义文章 URL slug |
| `--category` | 否 | `industry` | `company` / `industry` / `exhibition` / `product` |
| `--provider` | 否 | 从 `--model` 推断，默认 `gemini` | `gemini` / `openai`（openai 走 `WECHAT_OPENAI_BASE_URL` 指定的 OpenAI 兼容端点） |
| `--model` | 否 | gemini: `gemini-3.1-flash-lite`；openai: `gpt-5.5` | 模型 id；`gpt-*` / `o1|o3|o4` / `chatgpt-*` 自动推断为 openai |
| `--skip-images` | 否 | - | 逗号分隔的 1-based 图片索引，例如 `"2,11"` |
| `--debug-dir` | 否 | - | 保存原 HTML 和解析后的 blocks JSON |

## 工作流

1. 跑 dry-run。
2. 查看输出里的 KEEP 图片 URL、大小、格式和自动选定封面。
3. 如果头部海报、尾部二维码、微信生态截图不适合进官网，用 `--skip-images` 跳过。
4. 重新 dry-run 确认封面和保留图片。
5. 用户确认后加 `--apply`。
6. 去 Payload admin 检查草稿的 zh/en/es/ar 标题、摘要、正文、封面和图片顺序。

`--apply` 会重新跑全流程，包括重新调用一次 LLM。它会创建 media 记录和 news 草稿；失败时不会自动清理已经上传的图片，所以不要跳过 dry-run。

## 输出与状态

脚本会创建 News 文档草稿，并写入 4 个语言版本：

- zh：创建主文档，写 slug、publishedAt、category、coverImage、title、excerpt、body。
- en/es/ar：更新同一文档的对应 locale 字段。
- 图片：上传到 Payload `media`，`category=other`。
- 封面：使用第一张未过滤、未跳过且上传成功的图片。

前台新闻查询只展示 `_status=published` 的文章。要在前台完整检查排版，可以先在 admin 发布，检查完成后再改回草稿。

也可以用状态脚本切换：

```bash
node --env-file=.env.local scripts/setNewsStatus.mjs --id <uuid> --status published
node --env-file=.env.local scripts/setNewsStatus.mjs --id <uuid> --status draft
```

## 常见失败

| 错误 | 原因 | 处理 |
|---|---|---|
| `WeChat returned a verification page` | 微信要求验证或链接被限流 | 先在浏览器打开链接，再重试 |
| `Could not find #js_content` | 不是标准公众号文章页 | 换文章链接 |
| `This article has no images` | 全文无图，无法自动选封面 | 换有图文章，或手工在 admin 创建 |
| `News slug "..." already exists` | 同 slug 已存在 | 用 `--slug <different-slug>` 重跑 |
| `Gemini HTTP 4xx/5xx` | `GEMINI_API_KEY` 无效或限流 | 检查 key，或改走 `--provider openai` |
| `OpenAI HTTP 401` | `WECHAT_OPENAI_API_KEY` 无效或端点错误 | 检查 `WECHAT_OPENAI_API_KEY` / `WECHAT_OPENAI_BASE_URL` |
| `OpenAI response was truncated (finish_reason=length)` | 文章过长超出补全预算 | 换更短文章或更大上下文的模型 |
| `... response was not valid JSON` | 模型没有按 JSON 输出 | 换更强模型或重跑 |
| 图片下载失败 | 微信图片 CDN 或 Referer 问题 | 脚本会跳过失败图片；如果没有可用封面会中止 |

## 图片检查重点

公众号文章的第 1-2 张图常常是带原标题的海报。如果标题已经被改写，海报做封面会让前台标题和图片文字不一致。dry-run 时先看头部 KEEP 图片，必要时用 `--skip-images` 跳过。

文章末尾常有二维码、关注卡片或协会宣传图。这类图不适合企业官网正文，也应该跳过。

## 相关文件

- 主脚本：`scripts/wechatToNews.mjs`
- Lexical 构建器：`scripts/seoArticles/lexical.mjs`
- 状态切换：`scripts/setNewsStatus.mjs`
- News collection schema：`src/payload/collections/News.ts`
- Media collection schema：`src/payload/collections/Media.ts`
