# en-learning 部署备忘

## 服务器信息

| 项目 | 信息 |
|------|------|
| IP | 101.96.211.198 |
| 系统 | Ubuntu 24.04 |
| 面板 | 宝塔面板，端口 **28100** |
| 项目路径 | `/www/wwwroot/101.96.211.198/` |

## NestJS 构建产物路径（注意嵌套深！）

NestJS monorepo 构建后 dist 目录结构有额外嵌套，正确路径：

| 服务 | 启动路径 | PM2 名称 |
|------|----------|----------|
| en-server | `dist/apps/server/apps/server/src/main.js` | en-server |
| en-ai | `dist/apps/ai/apps/ai/src/main.js` | en-ai |

```
server/dist/
└── apps/
    ├── ai/
    │   └── apps/ai/src/main.js       ← 嵌套了两层 apps/ai
    └── server/
        └── apps/server/src/main.js   ← 嵌套了两层 apps/server
```

## 启动/重启命令

```bash
cd /www/wwwroot/101.96.211.198/server
pm2 delete all && pm2 save --force
pm2 start dist/apps/server/apps/server/src/main.js --name en-server -i max
pm2 start dist/apps/ai/apps/ai/src/main.js --name en-ai -i max
pm2 save && pm2 startup
```

## 一键部署

```bash
bash /www/wwwroot/101.96.211.198/deploy.sh
```

## 常用运维命令

```bash
pm2 status                              # 查看服务状态
pm2 logs en-server --lines 20           # 查看日志
netstat -tlnp | grep 3000               # 确认后端端口
systemctl status nginx redis            # 检查基础服务
```

## 敏感信息

`.env` 文件在 `server/.env`，**不要提交到 Git**。包含：数据库密码、JWT密钥、MinIO凭证、DeepSeek API Key、支付宝密钥、邮箱密码。
