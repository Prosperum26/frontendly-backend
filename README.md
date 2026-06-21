# Frontendly Backend

Frontendly Backend là service NestJS cho nền tảng học frontend theo hướng gamified. Service phụ trách auth, user/profile, learning path, exercise/workspace evaluation, entrance test, challenge catalog, leaderboard, gamification và observability.

Frontend repo tương ứng nằm ở `../frontendly-frontend`. Hai thư mục được xem như hai repo riêng trong workspace local.

## Chạy Local

```bash
yarn install
docker compose -f docker/local/infra.yml up
yarn seed
yarn start:dev
```

Backend mặc định chạy ở `http://localhost:3000`.

- API base: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api-docs`
- Swagger YAML: `http://localhost:3000/swagger/yaml`
- Health: `http://localhost:3000/health`
- Metrics: `http://localhost:3000/metrics`

## Env

Tạo `.env` trong folder backend:

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

Backend validate env lúc khởi động. Nếu thiếu `NODE_ENV`, `PORT`, `DB_URI`, `CORS_ORIGINS`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` hoặc `O11Y_HEAP_THRESHOLD_BYTES`, app có thể fail khi boot.

## Scripts

```bash
yarn start:dev          # Nest watch mode
yarn build              # Nest/SWC build
yarn lint:check         # ESLint check
yarn lint               # ESLint --fix
yarn test               # unit tests
yarn test:integration   # integration tests
yarn test:e2e           # e2e tests
yarn seed               # seed learning content
yarn infra              # start local MongoDB infra
```

## Tech Stack

- NestJS 11, TypeScript, SWC build
- MongoDB/Mongoose
- Passport/JWT, bcrypt, Google Auth
- Nodemailer
- Socket.IO package is installed for realtime-capable modules, but current challenge scope is catalog-only
- Swagger/OpenAPI
- Terminus health checks
- Prometheus metrics
- Jest, ESLint, Docker Compose

## Module Chính

- `auth`: register, login, Google login, refresh token, logout, sessions, password reset.
- `users`: profile, password, avatar, progress, badges, streak, activity, leaderboard, gamification.
- `learning-path`: roadmap, milestone, stage, theory, video progress, practice exercises, progress summary.
- `editor`: exercise schema, get exercise, submit workspace code, lint/requirement/behavior/visual evaluation.
- `entrance-test`: public entrance questions and score/placement result.
- `challenge`: public challenge catalog. Challenge là danh sách bài tập code, không phải battle/matchmaking.
- `common/observability`: health checks, metrics.
- `common/api-env`: environment guards/decorators.

## Auth Và Guards

Routes mặc định đi qua global auth guard. Controller public hoặc guest-friendly dùng `@ConfigureAuth`.

Ví dụ:

- `@ConfigureAuth({ skipAuth: true })`: bỏ qua auth hoàn toàn.
- `@ConfigureAuth({ blockIfUnauthenticated: false })`: cho phép request guest nhưng vẫn parse auth nếu có token.

Các controller public/guest hiện có gồm exercises, entrance test, challenge catalog, health/metrics và các auth endpoint public.

## API Surface Chính

Tất cả route versioned nằm dưới `/api/v1`, trừ `/health`, `/metrics`, `/api-docs`, `/swagger/yaml`.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/sessions`

### Users/Profile/Gamification

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/password`
- `POST /users/me/avatar`
- `GET /users/progress`
- `GET /users/badges`
- `GET /users/activity`
- `GET /users/activity/stats`
- `GET /users/streak`
- `GET /users/learning-progress`
- `GET /leaderboard`
- `GET /leaderboard/:userId/rank`

### Entrance Test

- `GET /entrance-test/questions`
- `POST /entrance-test/submit`

`GET /entrance-test/questions` trả danh sách câu hỏi không kèm đáp án đúng. `POST /entrance-test/submit` nhận:

```json
{
  "answers": {
    "question-id": "answer"
  }
}
```

Response hiện gồm:

```json
{
  "skipToMilestoneId": "m1",
  "skillId": "frontend",
  "score": 2,
  "totalQuestions": 4
}
```

### Challenge Catalog

- `GET /challenge/exercises`

Challenge hiện chỉ là catalog bài tập code để frontend mở vào `/workspace/:exerciseId`. Không có endpoint room, match, battle, live standings hoặc matchmaking.

Response item:

```json
{
  "id": "exercise_s1",
  "title": "Semantic HTML Starter",
  "description": "Build a clear page structure with headings, content sections, and useful labels.",
  "difficulty": "easy",
  "tags": ["HTML", "Semantics"],
  "previewImage": "https://..."
}
```

### Learning Path

- `GET /roadmaps/:skillId`
- `GET /stages/:stageId/theory`
- `POST /stages/:stageId/complete`
- `POST /stages/:stageId/unlock-practice`
- `GET /stages/:stageId/practices`
- `GET /learning-content/skills`
- `GET /learning-content/progress/summary`
- `POST /lp-exercises/:exerciseId/submit`

### Exercises/Workspace

- `GET /exercises/:exerciseId/:userId`
- `POST /exercises/:exerciseId/:userId/submit`

`GET /exercises/:exerciseId/:userId` trả exercise definition và merge lần submit gần nhất của user nếu có. Nếu không tìm thấy exercise, service đang tạo fallback exercise để workspace không chết trong local/dev.

Submit body:

```json
{
  "editorContent": {
    "html": "",
    "css": "",
    "js": "",
    "jsx": ""
  }
}
```

`html`, `css`, `js`, `jsx` đều optional ở DTO để hỗ trợ bài React/JSX-only.

Submit response:

```json
{
  "isCompleted": true,
  "match_percentage": 100,
  "lint_errors": {
    "html_err": [],
    "css_err": [],
    "js_err": [],
    "jsx_err": []
  },
  "requirementResult": [],
  "visual_results": [],
  "behavior_results": null
}
```

## Exercise Schema Và Evaluation

Schema chính: `src/editor/db_schemas/exercise_schema.ts`.

Exercise fields quan trọng:

- `id`: id public, ví dụ `exercise_s1`.
- `module`: module/skill label.
- `title`, `level`, `description`.
- `evaluation_config`: bật/tắt `lint`, `requirements`, `visual`, `behavior`.
- `restrictions`: config restriction cho JSX lint.
- `tags`: enum trong `exercise.enum.ts`.
- `html_content`, `css_content`, `js_content`, `jsx_content`: starter/latest code.
- `target_design`: kích thước target cho visual regression.
- `code_test`: code mẫu cho visual regression.
- `test_script`: script cho behavior evaluator.
- `requirements`: danh sách requirement static/behavior.
- `navigation`: prev/next metadata cho frontend.

Evaluation pipeline trong `EditorService.submitCode`:

1. Load exercise.
2. Chạy lint nếu `evaluation_config.lint = true`.
3. Nếu không có lint error, evaluate static requirements.
4. Nếu bật visual, chạy visual regression.
5. Nếu bật behavior, chạy behavior evaluator với `test_script`.
6. Tính `match_percentage`, `isCompleted`.
7. Lưu submission, giữ tối đa 5 submission gần nhất mỗi user/exercise.

## JSX Restrictions

Enum restriction: `src/editor/db_schemas/exercise.enum.ts`.

Các rule hiện có:

- `banned:hooks`
- `banned:map`
- `banned:create-element`
- `banned-attr:style`
- `banned:ternary`
- `banned:logical-and`
- `banned:if`
- `banned:destructuring`
- `required:destructuring`
- `banned:useeffect`
- `banned:useref`
- `banned:usestate`

Restrictions được map sang ESLint `no-restricted-syntax` trong `src/editor/evaluators/lint/reactJS.evaluator.ts`. Mỗi restriction gồm:

```json
{
  "rule": "banned:usestate",
  "message": "You must not use useState in this practice."
}
```

Nếu `message` rỗng, evaluator dùng default message từ `JsxRestrictionAstMap`.

## Notes

- Challenge không phải battle. Không thêm lại room/matchmaking/live battle nếu không có yêu cầu rõ.
- Khi thêm field exercise mới, cập nhật schema, DTO/response, evaluator nếu cần, frontend type và frontend mapper.
- `EditorContentDto` đang cho phép file rỗng/optional để hỗ trợ bài JSX-only.
- Frontend workspace đang dùng cả `target_design` singular và `target_designs` plural để tương thích contract.
- Backend `EditorService.getExerciseById` có fallback exercise khi DB chưa seed đủ.
- Unit test backend hiện chưa xanh vì lỗi Jest/ESM và type `.lean()` cũ, không phải do entrance/challenge catalog.
- README này có thể dùng làm context cho AI khi làm việc tiếp trong repo.

## Trạng Thái Kiểm Tra

Lần kiểm tra gần nhất trong workspace ngày 2026-06-21:

- `yarn lint:check`: pass.
- `yarn build`: pass.
- `yarn test`: fail do lỗi nền hiện có:
  - Jest chưa xử lý ESM dependency từ `jsdom/@exodus/bytes`.
  - Type error ở `src/auth/services/token.service.ts:239` khi return kết quả `.lean()` như `Session[]`.

## Việc Nên Làm Tiếp

- Sửa Jest transform/mocking cho dependency ESM từ `jsdom`.
- Sửa return type `getUserSessions` trong `src/auth/services/token.service.ts`.
- Chuẩn hóa text tiếng Việt còn mojibake trong log/message/Swagger cũ.
- Giảm `any` ở editor evaluator và service layer.
- Cân nhắc đưa challenge catalog vào DB nếu cần quản trị động thay vì in-memory list.
- Backend package name hiện vẫn là `ai-service`, chưa khớp tên dự án.
