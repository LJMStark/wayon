<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Local Development Credentials

- Payload 后台地址：`http://localhost:3000/admin`
- 开发阶段的后台账号保存在 `.env.local`，读取 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`。
- `.env.local` 被 `.gitignore` 排除，不要把后台密码明文写进可提交文件。
- 如果需要登录后台，先直接读取 `.env.local` 里的这两个变量，再使用该账号密码登录。

# Production Deployment Safety

- 这是已经上线的网站。任何会影响 Zeabur 生产启动、构建、数据库或后台管理的改动，都必须先按生产风险处理，不要只按本地开发方便性处理。
- 不要把一次性任务塞进 `npm start`、Zeabur Start Command 或 Web 容器启动路径。包括但不限于：`payload migrate`、数据导入、类型生成、import map 生成、媒体迁移、补数据脚本。生产 Web 进程启动应该只启动服务本身，例如 `next start`。
- 数据库迁移必须作为单独步骤执行。当前项目使用 `npm run migrate`，不要直接用 `npx payload migrate`；Payload 默认 tsx 加载器在 Node 24+ 下可能因为 Lexical 的 ESM 顶层 `await` 报 `ERR_REQUIRE_ASYNC_MODULE`。
- 改 `package.json` 的 `start`、`build`、`installCommand`、`postinstall`、Payload CLI 相关脚本前，必须检查 Zeabur 运行日志和现有部署方式。不能为了让迁移“自动发生”而改变线上启动语义。
- 如果新增 schema/migration，代码提交和迁移执行要分开说明：先提交代码，再明确告诉用户需要在生产环境单独跑哪条迁移命令，以及这条命令会改哪些表/字段。
- 修线上故障时可以先做最小热修，但热修后必须回到根因，撤掉不必要的绕路方案，保留符合长期维护的启动路径和文档。
