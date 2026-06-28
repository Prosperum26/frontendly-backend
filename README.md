# Frontendly Backend

NestJS API cho nền tảng học frontend gamified: auth, learning path, entrance test, workspace evaluation, gamification, challenge catalog, leaderboard.

Frontend repo: `../frontendly-frontend` (hai repo riêng trong workspace local).

## Chạy local

```bash
yarn install
docker compose -f docker/local/infra.yml up -d
yarn seed
yarn start:dev
```

| Endpoint | URL |
|----------|-----|
| API | `http://localhost:3000/api/v1` |
| Swagger | `http://localhost:3000/api-docs` |
| Health | `http://localhost:3000/health` |

## Env (`.env`)

```env
NODE_ENV=local
PORT=3000
DB_URI=mongodb://localhost:27017/frontendly
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
O11Y_HEAP_THRESHOLD_BYTES=536870912
```

## Scripts

```bash
yarn start:dev      # dev watch
yarn build          # production build
yarn lint:check     # ESLint (CI)
yarn lint           # ESLint --fix
yarn seed           # seed MongoDB từ src/data/*.json
yarn test           # unit tests
```

## Kiến trúc module

| Module | Mô tả |
|--------|--------|
| `auth` | Register, login, Google OAuth, refresh, sessions |
| `users` | Profile, XP, badges, streak, activity, leaderboard |
| `learning-path` | Roadmap, stages, theory, practice, video progress |
| `entrance-test` | Placement test + personalized path |
| `editor` | Exercise workspace, lint/requirement/visual/behavior eval |
| `challenge` | Challenge catalog (không phải battle) |

## Personalized Learning Path

Luồng chính sau entrance test:

```
Entrance Test (20 câu)
  → PlacementService (score, gates, advancement)
  → PathBuilderService (12 lesson: auto_passed | required | locked)
  → sync-placement-test → UserLearningProgress + XP gamification
```

**Source of truth:** `src/data/canonical_map.json` — map `m1_l1` ↔ `exercise_s1` ↔ question IDs.

**Services:**

- `PathBuilderService` — build `learningPath[]` + `studyPlan[]`
- `PlacementService` — scoring, gates, `syncPlacementTest` (cấp XP auto-pass)
- `RoadmapService` — merge personalized status vào roadmap response

**Seed data:** `src/data/entrance_test.json`, `theory.json`, `lessons.json`, `canonical_map.json`

```bash
yarn seed   # bắt buộc sau khi đổi JSON hoặc lần đầu setup
```

## API chính

### Entrance Test

| Method | Route | Mô tả |
|--------|-------|--------|
| GET | `/entrance-test/questions` | 20 câu hỏi (public) |
| POST | `/entrance-test/submit` | Submit + placement result + personalized path |
| POST | `/entrance-test/path/:userId` | Build path cho user |

Submit body:

```json
{ "answers": { "1": "option-a", "2": "option-b" } }
```

Response gồm: `score`, `totalQuestions`, `skipToMilestoneId`, `placementResult`, `personalizedPath`.

### Learning Path

| Method | Route |
|--------|-------|
| GET | `/roadmaps/:skillId` |
| GET | `/stages/:stageId/theory` |
| PATCH | `/stages/:stageId/complete` |
| PATCH | `/stages/:stageId/unlock-practice` |
| GET | `/stages/:stageId/practices` |
| POST | `/learning-content/sync-placement-test` |
| GET | `/learning-content/progress/summary` |
| POST | `/lp-exercises/:exerciseId/submit` |

`sync-placement-test` body:

```json
{
  "skipToMilestoneId": "m2",
  "skillId": "frontend",
  "learningPath": [{ "canonicalLessonId": "m1_l1", "stageId": "s1", "exerciseId": "exercise_s1", "status": "auto_passed" }],
  "studyPlan": ["Next lesson: React Components"]
}
```

### Exercises / Workspace

| Method | Route |
|--------|-------|
| GET | `/exercises/:exerciseId/:userId` |
| POST | `/exercises/:exerciseId/:userId/submit` |

## Gamification

- Global XP: `GamificationService` → `User.xp`, activity log
- Skill XP: `UserLearningProgress.currentXp`
- Auto-pass placement: cấp `LESSON_COMPLETED` + `STAGE_COMPLETED` per stage (dedup)
- XP values: `STAGE_COMPLETED=50`, `LESSON_COMPLETED=25`, `DAILY_LOGIN=10`

## Deploy — Render

### Cách 1: Blueprint

1. Push repo lên GitHub
2. Render Dashboard → **New Blueprint** → chọn repo → dùng `render.yaml`
3. Điền secrets: `DB_URI`, `JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`, Google OAuth

### Cách 2: Web Service thủ công

| Setting | Value |
|---------|-------|
| Build | `yarn install --frozen-lockfile && yarn build` |
| Start | `yarn start:prod` |
| Health | `/health` |

**Sau deploy:** chạy seed một lần (Render Shell hoặc local trỏ DB production):

```bash
yarn seed
```

## CI/CD (GitHub Actions)

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `build-deploy.yml` | push/PR `main`, `develop` | lint → build → deploy Render (main only) |
| `lint-and-test.yml` | PR `main` | lint + unit/integration tests |

**Secret cần thiết:** `RENDER_DEPLOY_HOOK_URL` — lấy từ Render Dashboard → Service → Deploy Hook.

## Trạng thái kiểm tra

```
yarn lint:check  ✅
yarn build       ✅
yarn seed        ✅ (cần MongoDB local)
yarn test        ✅ 28/28 unit tests passed
```

## Tech stack

NestJS 11 · MongoDB/Mongoose · Passport/JWT · Swagger · Prometheus metrics · Docker Compose
