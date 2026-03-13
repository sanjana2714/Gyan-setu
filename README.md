# GyanSetu - Digital Learning Platform

GyanSetu is an AI-powered educational platform designed to empower students and teachers in rural communities. It provides a cohesive ecosystem for personalized learning, academic tracking, and real-time communication.

## Core Features

- **Personalized Learning**: AI-driven learning paths tailored to each student's progress and language.
- **Academic Progression**: Persistent quiz scoring and course module tracking.
- **Unified Dashboards**: Separate, data-rich interfaces for Students, Teachers, and Parents.
- **Real-time Communication**: Integrated chat system for parent-teacher engagement.
- **AI Insights**: Automated academic summaries and performance predictors using Gemini 2.0.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **AI Engine**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or later.
- **npm**: v9.x or later.

### 2. Environment Setup
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase Configuration
The application is pre-configured for a demonstration project. To use your own Firebase instance, update the configuration in `src/lib/firebase.ts`.

### 4. Installation & Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be accessible at [http://localhost:9002](http://localhost:9002).

## Production Commands

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

---

*GyanSetu - Bridging the Gap in Digital Education.*
```