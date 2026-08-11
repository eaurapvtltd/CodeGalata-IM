# CodeGalatta (CGIT Platform)

An integrated college learning management and coding platform built with Next.js App Router, Prisma ORM, and PostgreSQL/Redis.

## Key Features

- **Multi-Tenant College Administration**: Manage branches, batches, students, and faculty with isolated tenant scopes.
- **Problem & Assignment Workspaces**: Problem setter suite, interactive online IDE runner, timed practice sessions, and contest modules.
- **Analytics & Leaderboards**: Dynamic student diagnostic analytics, weekly leaderboard ranks, and activity audit logging.
- **Faculty & Admin Chat**: Real-time context-aware messaging between faculty members and college administrators.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

## Production Build

To test or generate a production build:
```bash
npm run build
npm start
```
