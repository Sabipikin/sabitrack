# SabiTrack

AI-powered accountability platform that turns goals into daily execution habits.

## 🎯 What it does

- Create and manage multiple goals
- Generate AI-powered roadmaps with yearly, quarterly, monthly, weekly, and daily targets
- Track daily task completion and progress
- Switch between goals from the dashboard
- Toggle app background between light and dark mode
- See live Supabase database connectivity status in the dashboard

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Backend**: Supabase
- **Styling**: Custom CSS with inline styling and `app/globals.css`
- **Data**: Supabase tables for users, goals, roadmaps, and tasks

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase project with a `users`, `goals`, `roadmaps`, and `tasks` schema

### Environment Variables
Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_public_key
```

### Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🔧 Key Files

- `app/page.tsx` — main app UI and logic
- `app/layout.tsx` — root layout and global metadata
- `app/globals.css` — global styling and animations
- `utils/supabase/client.ts` — Supabase browser client setup
- `middleware.ts` — Supabase auth session middleware

## 🚀 Usage

1. Open the app and sign up with your name, email, and WhatsApp number.
2. Create a goal using the onboarding wizard.
3. View your generated roadmap and daily moves.
4. Approve the roadmap to enter the dashboard.
5. Switch goals or create a new one from the top selector.
6. Toggle between light and dark backgrounds from the dashboard header.

## ✅ Notes

- The dashboard shows a live DB connection status badge.
- Goal edits use the same wizard flow for preview and regeneration.
- The app is currently wired to Supabase and supports multiple user goals.

## 📦 License

MIT

---

**SabiTrack** - Execute your goals with clarity and momentum.
