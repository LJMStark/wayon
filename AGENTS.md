<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local Development Credentials

- Payload 后台地址：`http://localhost:3000/admin`
- 开发阶段的后台账号保存在 `.env.local`，读取 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`。
- `.env.local` 被 `.gitignore` 排除，不要把后台密码明文写进可提交文件。
- 如果需要登录后台，先直接读取 `.env.local` 里的这两个变量，再使用该账号密码登录。
