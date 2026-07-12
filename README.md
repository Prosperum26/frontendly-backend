# Frontendly Backend

**Deploy:** https://frontendly-backend.onrender.com

Backend của Frontendly — nền tảng học React theo hướng gamification (challenges, leaderboard, code evaluation).

## Tech Stack

- **NestJS:** ^11.0.1
- **MongoDB/Mongoose:** ^8.24.0
- **Socket.IO:** ^4.8.1
- **Passport:** ^0.7.0 (Google OAuth)
- **JWT:** @nestjs/jwt ^11.0.2, passport-jwt ^4.0.1
- **Validation:** class-validator ^0.14.1, zod ^3.24.2
- **Testing:** Jest ^30.4.2, @testing-library/react ^16.3.2

## Architecture

| Module | Description |
|--------|-------------|
| `auth` | Register, login, Google OAuth, refresh tokens, sessions, rate limiting |
| `users` | Profile, XP, badges, streak, activity log, leaderboard, gamification |
| `learning-path` | Roadmap, stages, theory content, practice exercises, progress tracking |
| `entrance-test` | Placement test with 20 questions, personalized learning path generation |
| `editor` | Exercise workspace, code evaluation (lint/requirement/visual/behavior) |
| `challenge` | Challenge catalog with 20 exercises across 3 difficulty levels |
| `ai-chat` | AI-powered tutoring with OpenRouter integration, daily quota management |
| `common` | Shared utilities: email, cloudinary, observability, API environment guards |

## Environment Requirements

- **Node Version:** >=22.12.0 (engines in package.json)
- **MongoDB:** Required for data persistence
- **Package Manager:** Yarn (yarn.lock present)

## Installation

```bash
git clone <repository-url>
cd frontendly-backend
yarn install
```

## Environment Variables

Required environment variables (create `.env` file):

```env
NODE_ENV=local
PORT=3000
DB_URI=mongodb://localhost:27017/frontendly
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_BACKUP_API_KEY=your-backup-openrouter-api-key
OPENROUTER_MODEL=tencent/hy3:free
AI_CHAT_DAILY_LIMIT=10
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email
MAIL_PASS=your-email-password
MAIL_FROM=noreply@frontendly.com
ACCESS_TOKEN_EXPIRES_IN=3h
PASSWORD_RESET_EXPIRES_IN_MINUTES=15
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
O11Y_HEAP_THRESHOLD_BYTES=536870912
```

## Running the Project

```bash
yarn start:dev      # Development with watch mode
yarn build          # Production build
yarn start:prod     # Production start
yarn test           # Unit tests
yarn test:watch     # Watch mode tests
yarn test:cov       # Tests with coverage
yarn lint           # ESLint with auto-fix
yarn lint:check     # ESLint check only
yarn seed           # Seed MongoDB from src/data/*.json
```

## API Documentation

**Swagger UI:** http://localhost:3000/api-docs  
**YAML Spec:** http://localhost:3000/swagger/yaml

## Database Schema

| Schema | Description |
|--------|-------------|
| `User` | Email, username, password, Google ID, XP, level, badges, stats, stage progress, activity heatmap |
| `ChatMessage` | AI chat messages with role (user/assistant), content, timestamp |
| `ChatSession` | Chat session with daily quota tracking, message count |
| `Session` | Auth sessions with token, device info, expiration |
| `Token` | Refresh tokens with user association and expiration |
| `ActivityLog` | User activity tracking with type, metadata, timestamp |
| `Badge` | Achievement badges with name, description, icon, requirements |
| `StageProgress` | Learning stage progress with completion status, timestamps |
| `CanonicalMap` | Mapping between milestones, lessons, exercises, and test questions |
| `CourseTheory` | Theory content for lessons with sections, headings, content |
| `EntranceTest` | Placement test questions with options, correct answers |

## Code Evaluation Pipeline

The code evaluation system uses multiple evaluators to assess user submissions:

**Input:** User-submitted HTML, CSS, JavaScript/JSX code

**Evaluation Flow:**

1. **Requirement Evaluator** (`@babel/parser`, `@babel/traverse`)
   - Parses JavaScript/JSX code into AST
   - Validates structural requirements (function definitions, component structure)
   - Checks for specific patterns and syntax requirements

2. **Lint Evaluators**
   - **HTML Linter** (`htmlhint`): Validates HTML structure, disables inline styles/scripts
   - **CSS Linter** (`stylelint`): Checks internal and external CSS for best practices
   - Returns line/column errors with messages

3. **Behavior Evaluator** (Jest, `@babel/preset-react`)
   - Creates temporary test files with user code
   - Runs Jest tests against the code
   - Returns test results: passed/failed counts, error messages

4. **Visual Regression Evaluator** (Puppeteer, pixelmatch)
   - Renders user code in headless browser with React + Babel
   - Compares screenshot against expected output
   - Returns match percentage and diff image URL (Cloudinary)

**Output:** Combined evaluation result with:
- `isCompleted`: Boolean pass/fail
- `match_percentage`: Visual similarity score
- `lint_errors`: Array of linting issues
- `requirementResult`: Array of requirement checks
- `visual_results`: Screenshot comparison data
- `behavior_results`: Jest test execution results

## Realtime Events

**WebSocket Gateway:** `UserGateway`

**Events:**
- `hello`: Simple ping/pong event for connection testing
  - Payload: None
  - Response: "world"

## Deployment

**Platform:** Render (configured via `render.yaml`)

**Render Configuration:**
- Runtime: Node.js
- Region: Singapore
- Plan: Free
- Build Command: `yarn install --frozen-lockfile && yarn build && yarn seed:prod`
- Start Command: `yarn start:prod`
- Health Check: `/health`

**Environment Variables in render.yaml:**
- NODE_ENV, PORT, NODE_VERSION, DB_URI, JWT_SECRET, CORS_ORIGINS, FRONTEND_URL
- Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- AI: OPENROUTER_API_KEY, OPENROUTER_BACKUP_API_KEY
- Observability: O11Y_HEAP_THRESHOLD_BYTES

## Contributing

**Branch Convention:** `feature/`, `bugfix/`, `hotfix/` prefixes

**Commit Convention:** Conventional commits (feat:, fix:, docs:, etc.)

**Team Members:**
- Quoc Hung (truongquochung312@gmail.com)
- Tran Ngoc Dang Khoa (https://github.com/Jamesklein218)
