# SabiTrack

AI-powered accountability SaaS that turns long-term personal and professional goals into structured daily actions.

## 🎯 Core Features

- **Goal Definition** - Users define one major goal with a timeline
- **AI Roadmap Generation** - Intelligent breakdown into yearly, quarterly, monthly, weekly, and daily targets
- **WhatsApp Accountability** - Primary channel for:
  - Daily task reminders
  - Task completion updates
  - Carryover of unfinished tasks
  - Weekly progress reviews
- **Progress Tracking** - Visual progress and completion metrics
- **Execution Discipline** - Minimize friction and focus on consistent daily action

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Linting**: ESLint

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
SabiTrack/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
├── public/                 # Static assets
├── .eslintrc.json         # ESLint configuration
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## 🔄 Development Workflow

1. Create components in `/components`
2. Add pages in `/app`
3. Use TypeScript for type safety
4. Run `npm run lint` to check code quality
5. Commit changes with descriptive messages

## 🚀 Planned Features

- WhatsApp bot integration
- AI-powered goal analysis
- Goal progress dashboard
- Weekly review analytics
- Goal templates
- Mobile app

## 📝 License

MIT

---

**SabiTrack** - Execution Discipline for Your Goals
