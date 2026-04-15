#!/bin/bash

# 道衍 - GitHub 发布脚本
# 使用方法：bash publish-to-github.sh

set -e  # 遇到错误立即退出

echo "🚀 道衍 - GitHub 发布脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub 仓库信息
GITHUB_ORG="daoApps"
REPO_NAME="dao-yan"
GITHUB_URL="https://github.com/${GITHUB_ORG}/${REPO_NAME}.git"

echo "📋 发布信息："
echo "  组织/用户: ${GITHUB_ORG}"
echo "  仓库名称: ${REPO_NAME}"
echo "  仓库地址: ${GITHUB_URL}"
echo ""

# Step 1: 检查 Git 状态
echo "📝 Step 1: 检查 Git 状态..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  警告: 存在未提交的更改${NC}"
    git status -s
    echo ""
    read -p "是否继续？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 发布已取消"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 工作区干净${NC}"
fi
echo ""

# Step 2: 检查远程仓库
echo "📡 Step 2: 配置远程仓库..."
if git remote | grep -q "^github$"; then
    echo "  移除现有的 github 远程仓库..."
    git remote remove github
fi

echo "  添加 GitHub 远程仓库: github"
git remote add github "${GITHUB_URL}"
echo -e "${GREEN}✅ 远程仓库配置完成${NC}"
echo ""

# Step 3: 显示将要推送的内容
echo "📦 Step 3: 准备推送的内容..."
echo "  当前分支: $(git branch --show-current)"
echo "  提交数量: $(git rev-list --count HEAD)"
echo "  最新提交: $(git log -1 --oneline)"
echo "  标签: $(git tag -l)"
echo ""

# Step 4: 推送确认
echo -e "${YELLOW}⚠️  即将推送到 ${GITHUB_URL}${NC}"
echo ""
read -p "确认推送？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 发布已取消"
    exit 1
fi

# Step 5: 推送主分支
echo ""
echo "⬆️  Step 4: 推送主分支到 GitHub..."
if git push -u github main; then
    echo -e "${GREEN}✅ 主分支推送成功${NC}"
else
    echo -e "${RED}❌ 主分支推送失败${NC}"
    echo "请检查："
    echo "  1. GitHub 仓库是否已创建？"
    echo "  2. 是否有推送权限？"
    echo "  3. 网络连接是否正常？"
    exit 1
fi
echo ""

# Step 6: 推送标签
echo "🏷️  Step 5: 推送版本标签..."
if git push github --tags; then
    echo -e "${GREEN}✅ 标签推送成功${NC}"
else
    echo -e "${YELLOW}⚠️  标签推送失败（可能没有标签）${NC}"
fi
echo ""

# Step 7: 完成
echo "================================"
echo -e "${GREEN}🎉 发布完成！${NC}"
echo ""
echo "📍 下一步："
echo "  1. 访问 https://github.com/${GITHUB_ORG}/${REPO_NAME}"
echo "  2. 配置仓库描述和 Topics"
echo "  3. 启用 Issues 和 Discussions"
echo "  4. 创建首个 Release (v1.0.0)"
echo ""
echo "🌟 项目链接: https://github.com/${GITHUB_ORG}/${REPO_NAME}"
echo ""
