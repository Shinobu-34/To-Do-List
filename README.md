# Task-Do: The Gamified Productivity Command Center

Task-Do is a premium, highly-interactive, and gamified productivity web application. Designed to blend modern glassmorphic aesthetics with deep RPG mechanics, it turns your daily task management into an addictive game where you earn XP, level up, and purchase custom rewards. 

Built with React, Tailwind CSS, and Vite, this application is lightweight, blindingly fast, and heavily localized.

## ✨ Features

- **🎮 RPG Leveling System:** Turn productivity into a game. Completing tasks earns you XP and Coins based on priority (High = 50, Medium = 30, Low = 10). Overdue tasks will deduct your XP! Level up to trigger beautiful confetti explosions.
- **🧘 Zen Mode Pomodoro Timer:** Click the 'Play' icon on any urgent task to lock yourself into a beautiful, immersive, full-screen deep work overlay complete with built-in ambient audio (Lo-Fi, Rain, Typing). Finish the 25-minute block for +100 bonus XP.
- **🛍️ Dopamine Market (Self-Rewards):** Spend your hard-earned Coins to "purchase" custom real-life rewards you've set up (e.g., 30 Minutes of Video Games, Coffee Break, Watch an Episode).
- **🤖 VibeBuddy AI Assistant:** Your witty, slightly sarcastic AI coach (powered by OpenRouter/Gemini). It can understand natural language to add, update, and organize tasks. Hit "Generate Weekly Review" to get praised for your wins and playfully roasted for your procrastinations.
- **⚡ Quick Wins Carousel:** The most urgent, high-priority, or overdue tasks are instantly surfaced in a carousel at the top of your dashboard.
- **💫 Interactive Micro-Animations:** Every time you expand a task to read its details, a GPU-accelerated micro-animation fires randomly (Flip3D, Circle Ripple, Elastic Pop, etc.) to keep interactions fresh and visually stunning.
- **📈 Accountability Matrix:** View all your data through an ultra-modern spreadsheet layout and a 35-day Consistency Heatmap that adapts flawlessly to Light and Dark modes.
- **📁 Smart Spaces:** Organize your life into Spaces (like 'Work', 'Fitness', 'Personal'). Spaces automatically get assigned smart emoji icons.
- **🌙 Dark/Light Mode & Glassmorphism:** A breathtaking UI engineered with deep `backdrop-blur` layers, glowing borders, and seamless theme switching.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm or yarn
- An OpenRouter API Key (for VibeBuddy AI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/task-do.git
   cd task-do
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Rename `.env.example` to `.env` and add your OpenRouter API key.
   ```bash
   VITE_OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🧠 Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + custom CSS animations (`@keyframes`)
- **Icons:** Lucide React
- **AI Integration:** OpenRouter API (Gemini-3.5-flash by default)
- **Data Persistence:** Client-side `localStorage` (No database required, fully private)

## 🎯 How to Use

When you open the app, click the **"❓ Take a Tour"** button in the top right corner for a guided 5-step onboarding experience walking you through the RPG mechanics, Quick Wins, the Matrix, and the Market!

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
