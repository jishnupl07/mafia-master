# 🎭 Mafia Master (Moderator Console)

A premium, mobile-first web application designed for **Mafia / Werewolf** party game moderators to secretly assign, reveal, and track player roles and round actions with ease.

Built with **React**, **TypeScript**, **TanStack Start (Router + SSR)**, **Tailwind CSS**, **Framer Motion**, and **Capacitor** for Android app wrapper support.

---

## ✨ Features

- **🛡️ Custom Game Setup**: Easily add, edit, or delete player names. Configure role counts for Mafia, Doctors, Police, and automatically calculate Civilians.
- **👁️ Secret Role Reveal**: Fisher-Yates shuffled role assignment. Tap-to-reveal interface ensures only the intended player sees their secret role.
- **🌙 Interactive Night/Day Rounds**:
  - Track **Mafia** targets.
  - Track **Doctor** saves.
  - Track **Police** investigations.
  - Track **Voted Out** players during the day.
- **🎙️ Narrator Guide & SFX**: Integrated sound effects (`sfx.ts`) and narrative helper scripts for the moderator.
- **📊 Real-time Stats & Victory Detection**: Auto-detects Mafia or Civilian wins instantly. Features a full game history log.


## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, TanStack Start, TanStack Router.
- **Styling**: Tailwind CSS, Lucide React (icons), Framer Motion (smooth transition animations).
- **Backend / Deployment**: Nitro (presets for Vercel/Cloudflare).

## 🚀 Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jishnupl07/mafia-master.git
   cd mafia-master
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

### Building for Production

Compile the webapp and generate the Nitro/Vercel server output:
```bash
npm run build
```

## 📝 License

This project is licensed under the MIT License. Feel free to use and customize it!
