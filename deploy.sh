#!/bin/bash
set -e

echo "========================================="
echo "  en-learning 一键部署脚本"
echo "========================================="

# 进入项目目录
cd /www/wwwroot/101.96.211.198

# 1. 拉取最新代码
echo ""
echo "📥 [1/4] 拉取最新代码..."
git pull

# 2. 安装依赖（如果有新包）
echo ""
echo "📦 [2/4] 安装依赖..."
pnpm install

# 3. 构建
echo ""
echo "🔨 [3/4] 构建项目..."
echo "  → 构建 tracker..."
cd apps/tracker && pnpm build
echo "  → 构建后端 server..."
cd ../../server && npx prisma generate && npx nest build server
echo "  → 构建后端 ai..."
npx nest build ai
echo "  → 构建前端..."
cd ../apps/web && pnpm build

# 4. 重启服务
echo ""
echo "🔄 [4/4] 重启服务..."
pm2 restart all
pm2 save

echo ""
echo "========================================="
echo "  ✅ 部署完成！"
echo "========================================="
echo ""
echo "  访问: http://101.96.211.198"
echo ""
