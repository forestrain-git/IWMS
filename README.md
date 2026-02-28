# 智慧垃圾管理仪表板 (IWMS)

## 🚀 部署到 GitHub Pages

### 步骤 1: 创建 GitHub 仓库
1. 在 GitHub 上创建新仓库，仓库名为：`IWMS`
2. 确保仓库是公开的（Public）

### 步骤 2: 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit: 智慧垃圾管理仪表板"
git branch -M main
git remote add origin https://github.com/[你的GitHub用户名]/IWMS.git
git push -u origin main
```

### 步骤 3: 启用 GitHub Pages
1. 进入 GitHub 仓库的 Settings 页面
2. 滚动到 "Pages" 部分
3. 在 "Source" 中选择 "GitHub Actions"

### 步骤 4: 自动部署
- 代码推送到 main 分支后会自动触发部署
- 部署完成后，访问：`https://[你的GitHub用户名].github.io/IWMS`

### 手动部署（可选）
如果需要手动部署：
```bash
npm install gh-pages --save-dev
npm run deploy
```

## 📱 访问地址
部署成功后，你的仪表板可以通过以下链接访问：
```
https://[你的GitHub用户名].github.io/IWMS
```

## 🔧 故障排除

### 如果无法访问，请检查：

1. **GitHub Pages 设置**：
   - 进入仓库 Settings → Pages
   - 确认 Source 选择的是 "GitHub Actions"
   - 查看部署状态是否为绿色勾选

2. **Actions 标签页**：
   - 检查工作流是否成功运行
   - 查看是否有错误信息

3. **重新触发部署**：
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

4. **清除缓存**：
   - 在浏览器中按 Ctrl+F5 强制刷新
   - 或尝试无痕模式访问

## 🎨 功能特性
- **实时数据监控**：车辆、泊位、容器状态实时更新
- **可视化图表**：使用 Recharts 创建交互式数据图表
- **响应式设计**：适配各种屏幕尺寸
- **现代UI**：使用 Tailwind CSS 和渐变效果
- **动画效果**：数字计数器和过渡动画

## 🛠️ 技术栈
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- Recharts 图表库
- Lucide React 图标库
