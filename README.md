
<p align="center">
  <h1 align="center">🌊 IELTS-Typing_Pro</h1>
</p>

<p align="center">
  <strong>An AI-powered IELTS Preparation & Typing Practice Platform</strong><br>
  <em>Combine muscle memory with language acquisition.</em>
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a> •
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-credits">Credits</a>
</p>

---

## 📖 Introduction

**IELTS-Typing_Pro** is a modern web application designed for English learners, specifically targeting IELTS preparation. It fuses the addictive typing practice mechanics of [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) with comprehensive IELTS modules (Listening, Reading, Writing, Speaking) powered by Google's **Gemini AI**.

Instead of rote memorization, IELTS-Typing_Pro helps you build "muscle memory" for high-frequency vocabulary while providing instant, AI-generated feedback on your writing and speaking tasks.

## ✨ Features

### ⌨️ Vocabulary & Typing (Qwerty Style)
- **Muscle Memory Training**: Practice words by typing them. Includes phonetic symbols and translations.
- **Multiple Dictionaries**: Built-in support for IELTS, CET-4, CET-6, and Programmer vocabulary.
- **Import Function**: Support for importing custom JSON/Excel word books.
- **Sound Effects**: Satisfying mechanical keyboard sounds and error feedback (Web Audio API).
- **Stats Tracking**: Real-time WPM (Words Per Minute) and accuracy tracking.

### 🤖 AI-Powered IELTS Modules
- **Writing Task 1 & 2**:
  - Simulate real exam interface.
  - **Gemini AI Grading**: Get instant band scores, detailed feedback, and rewritten "Better Versions" of your essays.
- **Speaking Part 1, 2 & 3**:
  - Voice recording using Web Speech API.
  - **AI Examiner**: Transcribes your speech and evaluates fluency, vocabulary, and grammar.
- **Reading**:
  - Interactive reading passages with multiple-choice and T/F/NG questions.
  - Auto-grading functionality.
- **Listening**:
  - Simulated audio player and section-based questions.

### 🛠 Utilities
- **Dark/Light Mode**: Fully responsive UI based on Tailwind CSS.
- **Bilingual UI**: One-click toggle between English and Chinese interfaces.
- **Resources Hub**: Curated links to external IELTS tools and mock tests.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key (Get it [here](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/IELTS-Typing_Pro.git
   cd IELTS-Typing_Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example environment file to create your local config:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and replace `your_api_key_here` with your actual Google Gemini API Key:
   ```env
   API_KEY=AIzaSy...
   ```

4. **Run Local Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view it in the browser.

## 📦 Deployment

### Option 1: Vercel (One-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YanleiZhao-lab/IELTS-Typing_Pro&env=API_KEY)

1. Click the **Deploy with Vercel** button above.
2. Vercel will clone the repository and ask for Environment Variables.
3. Enter your `API_KEY` (Google Gemini API Key) when prompted.
4. Click **Deploy**.

### Option 2: GitHub Pages (Configured in Actions)

This repository includes a GitHub Action (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages when you push to the `main` branch.

1. Go to your repository **Settings** -> **Pages**.
2. Ensure **Build and deployment** source is set to "Deploy from a branch".
3. The Action will push to a `gh-pages` branch automatically.
4. **Important**: For the AI features to work on the live site, you must add your API Key to GitHub Secrets:
   * Go to **Settings** -> **Secrets and variables** -> **Actions**.
   * Click **New repository secret**.
   * Name: `API_KEY`
   * Value: Your Gemini API Key.

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI Model**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Audio**: Native Web Audio API & Web Speech API

## 🤝 Credits & Inspiration

This project is heavily inspired by and integrates concepts from these amazing open-source projects:

*   **[Qwerty Learner](https://github.com/RealKai42/qwerty-learner)** by RealKai42 - For the brilliant idea of combining typing practice with vocabulary learning.
*   **[My-IELTS](https://github.com/hefengxian/my-ielts)** by hefengxian - For the structure of IELTS practice modules.
*   **[IELTS Liz](https://ieltsliz.com/)** - For excellent pedagogical tips and strategy references.

## 📄 License

GPL-3.0 License © 2025 IELTS-Typing_Pro
