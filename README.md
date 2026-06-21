# Frontendly Backend

Backend NestJS cho Frontendly, nền tảng học React/frontend theo hướng gamified. Service này phụ trách auth, learning path, editor evaluation, gamification, profile, leaderboard, realtime và observability.

Frontend repo tương ứng nằm ở `../frontendly-frontend` trong workspace local hiện tại, nhưng hai folder được xem như hai repo riêng.

## Chạy local

```bash
yarn install
docker compose -f docker/local/infra.yml up
yarn seed
yarn start:dev
```

Backend mặc định chạy ở `http://localhost:3000`.

- API base: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`
- Metrics: `http://localhost:3000/metrics`

## Tech stack

- NestJS 11, TypeScript, SWC build
- MongoDB/Mongoose, Socket.IO
- Passport/JWT, bcrypt, Google Auth, Nodemailer
- Swagger, Terminus health checks, Prometheus metrics
- Jest, ESLint, Docker Compose cho MongoDB local

## Env

Tạo `.env` trong folder này:

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

# Optional: password reset email
MAIL_HOST=
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM=no-reply@frontendly.local

# Optional: avatar upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Backend validate env lúc khởi động. Nếu thiếu `NODE_ENV`, `PORT`, `DB_URI`, `CORS_ORIGINS`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, hoặc `O11Y_HEAP_THRESHOLD_BYTES`, app có thể fail ngay khi boot.

## Scripts

```bash
yarn start:dev
yarn build
yarn lint:check
yarn test
yarn test:integration
yarn test:e2e
yarn seed
yarn infra
```

## Module chính

- `auth`: đăng ký, đăng nhập, Google login, refresh token, logout, session.
- `users`: profile, avatar, progress, badge, streak, activity, leaderboard.
- `learning-path`: roadmap, milestone, stage, theory, video progress, practice.
- `editor`: lấy exercise, submit code, lint/requirement/behavior/visual evaluator.
- `common/observability`: health check, metrics.

## API surface chính

Tất cả route versioned nằm dưới `/api/v1`, trừ `/health`, `/metrics`, `/api-docs`, `/swagger/yaml`.

- Auth: `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh-token`, `/auth/logout`, `/auth/logout-all`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/sessions`.
- Users/profile: `/users/me`, `/users/me/password`, `/users/me/avatar`, `/users/progress`, `/users/badges`, `/users/activity`, `/users/activity/stats`, `/users/streak`, `/users/learning-progress`.
- Learning path: `/roadmaps/:skillId`, `/stages/:stageId/theory`, `/stages/:stageId/complete`, `/stages/:stageId/unlock-practice`, `/stages/:stageId/practices`, `/learning-content/skills`, `/learning-content/progress/summary`.
- Exercises: `/exercises/:exerciseId/:userId`, `/exercises/:exerciseId/:userId/submit`, `/lp-exercises/:exerciseId/submit`.
- Leaderboard: `/leaderboard`, `/leaderboard/:userId/rank`.

## Trạng thái kiểm tra

Lần kiểm tra gần nhất trong workspace ngày 2026-06-21:

- `yarn lint:check`: pass.
- `yarn build`: pass.
- `yarn test`: fail do Jest chưa xử lý ESM dependency từ `jsdom/@exodus/bytes` và lỗi type ở `src/auth/services/token.service.ts:239`.

## Điểm cần cải thiện

- Test backend chưa xanh, làm CI khó đáng tin. Cần xử lý Jest transform cho ESM dependency hoặc mock evaluator liên quan `jsdom`, đồng thời sửa kiểu `getUserSessions`.
- Sửa Jest config hoặc mock evaluator để unit test chạy được.
- Sửa return type `getUserSessions` khi dùng `.lean()`.
- Chuẩn hóa lại encoding tiếng Việt trong log/message/Swagger.
- Giảm `any` ở auth, editor evaluator và service layer.
- Hợp nhất các file Docker Compose MongoDB local.
- Backend package name đang là `ai-service`, chưa khớp tên dự án.
- Nên thêm `.env.example` để onboarding bớt phụ thuộc vào README.
