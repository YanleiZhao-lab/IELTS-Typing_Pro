
<p align="center">
  <h1 align="center">🌊 IELTS-Typing_Pro</h1>
</p>

<p align="center">
  <strong>AI 驱动的雅思备考与打字练习平台</strong><br>
  <em>将肌肉记忆与语言习得完美结合。</em>
</p>

<p align="center">
  <a href="./README.md">English Docs</a> •
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-致谢">致谢</a>
</p>

---

## 📖 简介

**IELTS-Typing_Pro** 是一个专为英语学习者（特别是雅思考生）打造的现代化 Web 应用。它融合了 [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) 令人上瘾的打字练习机制，以及由 Google **Gemini AI** 驱动的全套雅思模拟功能（听、说、读、写）。

IELTS-Typing_Pro 不仅帮助你通过“肌肉记忆”掌握高频词汇，还能为你的写作和口语练习提供即时的 AI 评分与反馈。

## ✨ 功能特性

### ⌨️ 词汇与打字训练 (Qwerty 风格)
- **肌肉记忆训练**：通过键盘输入单词来加深记忆，包含音标和中文翻译展示。
- **多词库支持**：内置雅思 (IELTS)、四级 (CET-4)、六级 (CET-6) 及程序员常用词汇库。
- **自定义导入**：支持上传自定义 JSON 或 Excel 格式的词书。
- **沉浸式音效**：模拟机械键盘打字音效及错误提示音（基于 Web Audio API，无需额外资源文件）。
- **数据统计**：实时追踪 WPM (每分钟打字数) 和准确率。

### 🤖 AI 驱动的雅思模块
- **写作 (Writing Task 1 & 2)**：
  - 模拟真实机考界面。
  - **Gemini AI 评分**：即时获得雅思分数段 (Band Score)、详细的改判反馈以及 AI 重写的“高分范文”。
- **口语 (Speaking Part 1, 2 & 3)**：
  - 使用 Web Speech API 进行语音录入。
  - **AI 考官**：将语音转为文字，并从流利度、词汇资源、语法等维度进行评估。
- **阅读 (Reading)**：
  - 交互式阅读文章，支持选择题、判断题 (T/F/NG)。
  - 自动判分功能。
- **听力 (Listening)**：
  - 模拟音频播放器与分段式题目。

### 🛠 实用工具
- **深色/浅色模式**：基于 Tailwind CSS 的全响应式设计，保护视力。
- **双语 UI**：一键切换中文/英文界面。
- **资源导航**：精选的第三方雅思备考工具与模考网站链接。

## 🚀 快速开始

### 前置要求
- Node.js (v18 或更高版本)
- 一个 Google Gemini API Key (点击 [这里](https://aistudio.google.com/) 获取)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/IELTS-Typing_Pro.git
   cd IELTS-Typing_Pro
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   复制示例配置文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```
   打开 `.env` 文件并填入你的 API Key：
   ```env
   API_KEY=你的_Google_Gemini_Key
   ```

4. **启动本地服务器**
   ```bash
   npm run dev
   ```
   在浏览器中打开 `http://localhost:5173` 即可使用。

## 📦 部署

### 方式一：Vercel (一键部署)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YanleiZhao-lab/IELTS-Typing_Pro&env=API_KEY)

1. 点击上方的 **Deploy with Vercel** 按钮。
2. Vercel 会自动克隆本仓库，并提示配置环境变量。
3. 在 `API_KEY` 栏填入你的 Google Gemini API Key。
4. 点击 **Deploy** 等待完成。

### 方式二：GitHub Pages (通过 Actions 自动部署)

本项目包含一个 GitHub Action (`.github/workflows/deploy.yml`)，当你推送到 `main` 分支时会自动构建并部署到 GitHub Pages。

1. 进入仓库 **Settings** -> **Pages**。
2. 确保 **Build and deployment** 来源设置为 "Deploy from a branch" (无需手动选择分支，Action 会自动处理)。
3. Action 会自动构建并将代码推送到 `gh-pages` 分支。
4. **重要**：为了让在线站点的 AI 功能正常工作，你必须将 API Key 添加到 GitHub Secrets：
   * 进入 **Settings** -> **Secrets and variables** -> **Actions**。
   * 点击 **New repository secret**。
   * **Name**: `API_KEY`
   * **Value**: 你的 Gemini API Key。

## 🛠 技术栈

- **框架**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **语言**: TypeScript
- **样式**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **AI 模型**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **音频**: Native Web Audio API & Web Speech API

## 🤝 致谢与灵感

本项目的灵感来源于并集成了以下优秀的开源项目概念：

*   **[Qwerty Learner](https://github.com/RealKai42/qwerty-learner)** by RealKai42 - 感谢其将打字练习与词汇记忆结合的绝妙创意。
*   **[My-IELTS](https://github.com/hefengxian/my-ielts)** by hefengxian - 提供了雅思练习模块的结构参考。
*   **[IELTS Liz](https://ieltsliz.com/)** - 提供了极具价值的备考技巧与策略参考。

## 📄 许可证 (License)

GPL-3.0 License © 2025 IELTS-Typing_Pro
