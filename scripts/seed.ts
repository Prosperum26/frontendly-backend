import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as path from 'path';

// Import schemas from the project
import { ExerciseSchema } from '../src/editor/db_schemas/exercise_schema';
import { SubmissionSchema } from '../src/editor/db_schemas/submission_schema';
import {
  RoadmapSchema,
  LpExerciseSchema,
} from '../src/learning-path/db_schemas/learning_path_schemas';
import { MilestoneSchema } from '../src/learning-path/db_schemas/milestone_schema';
import { TheorySchema } from '../src/learning-path/db_schemas/theory_schema';
import { ActivityLogSchema } from '../src/users/schemas/activity-log.schema';
import { BadgeSchema } from '../src/users/schemas/badge.schema';
import { UserSchema } from '../src/users/schemas/user.schema';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.DB_URI;
if (!MONGO_URI) {
  console.error('DB_URI is not defined in .env');
  process.exit(1);
}

// ── Models ──────────────────────────────────────────────────────────────────

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
const Milestone = mongoose.model('Milestone', MilestoneSchema);
const LpExercise = mongoose.model('LpExercise', LpExerciseSchema);
const Theory = mongoose.model('Theory', TheorySchema);
const Exercise = mongoose.model('Exercise', ExerciseSchema);
const Submission = mongoose.model('Submission', SubmissionSchema);
const User = mongoose.model('User', UserSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
const Badge = mongoose.model('Badge', BadgeSchema);

// ── Data ────────────────────────────────────────────────────────────────────

const BADGES_DATA = [
  {
    name: 'First Step',
    icon: '🚀',
    description: 'Complete your first exercise',
    category: 'beginner',
    unlockCondition: { type: 'stages_completed', value: 1 },
  },
  {
    name: 'Streak Starter',
    icon: '🔥',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    unlockCondition: { type: 'streak_days', value: 7 },
  },
  {
    name: 'Learning Path Explorer',
    icon: '📚',
    description: 'Complete 5 exercises',
    category: 'learning',
    unlockCondition: { type: 'stages_completed', value: 5 },
  },
  {
    name: 'XP Hunter',
    icon: '⭐',
    description: 'Earn 1000 XP',
    category: 'xp',
    unlockCondition: { type: 'xp_amount', value: 1000 },
  },
  {
    name: 'Streak Champion',
    icon: '🏆',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    unlockCondition: { type: 'streak_days', value: 30 },
  },
];

const MILESTONES_DATA = [
  {
    id: 'm1',
    title: 'HTML Fundamentals',
    icon: 'html5',
    status: 'in_progress',
    stages: [
      {
        id: 's1',
        title: 'Introduction to HTML',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's2',
        title: 'HTML Tags & Attributes',
        isCompleted: false,
        earnedStars: 0,
      },
      { id: 's3', title: 'Lists & Tables', isCompleted: false, earnedStars: 0 },
      { id: 's4', title: 'Forms & Inputs', isCompleted: false, earnedStars: 0 },
    ],
  },
  {
    id: 'm2',
    title: 'CSS Styling',
    icon: 'css3',
    status: 'locked',
    stages: [
      { id: 's5', title: 'CSS Selectors', isCompleted: false, earnedStars: 0 },
      { id: 's6', title: 'The Box Model', isCompleted: false, earnedStars: 0 },
      { id: 's7', title: 'Flexbox Layout', isCompleted: false, earnedStars: 0 },
      { id: 's8', title: 'Grid Layout', isCompleted: false, earnedStars: 0 },
    ],
  },
  {
    id: 'm3',
    title: 'JavaScript Interactivity',
    icon: 'javascript',
    status: 'locked',
    stages: [
      {
        id: 's9',
        title: 'JS Variables & Data Types',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's10',
        title: 'DOM Manipulation',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's11',
        title: 'Event Handling',
        isCompleted: false,
        earnedStars: 0,
      },
      { id: 's12', title: 'Async & Fetch', isCompleted: false, earnedStars: 0 },
    ],
  },
];

const ROADMAP_DATA = [
  {
    skillId: 'frontend',
    skillTitle: 'Frontend Developer Path',
    milestoneIds: ['m1', 'm2', 'm3'],
  },
];

// Helper to generate Theories
const generateTheories = (): any[] => {
  const theories: any[] = [];
  for (let i = 1; i <= 12; i++) {
    const stageId = `s${i}`;
    theories.push({
      stageId,
      title: `Lý thuyết bài học ${stageId}`,
      contentHtml: `<h1>Chào mừng tới bài học ${stageId}</h1><p>Đây là nội dung lý thuyết chi tiết cho bài học này. Bạn sẽ học về các kiến thức nền tảng của Frontend.</p>`,
      proTips: `Mẹo nhỏ cho bài ${stageId}: Hãy thực hành thật nhiều!`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      referenceLinks: [
        {
          title: 'MDN Documentation',
          url: 'https://developer.mozilla.org',
          type: 'doc',
        },
      ],
    });
  }
  return theories;
};

// Helper to generate LpExercise data (3 per stage)
const generateLpExercises = (): any[] => {
  const exercises: any[] = [];
  for (let i = 1; i <= 12; i++) {
    const stageId = `s${i}`;
    ['easy', 'medium', 'hard'].forEach((level, idx) => {
      exercises.push({
        id: `lp_ex_${stageId}_${idx + 1}`,
        stageId,
        level,
        title: `Bài tập ${level} cho ${stageId}`,
        instruction: `Hãy thực hiện yêu cầu của bài tập ${level} này để củng cố kiến thức.`,
        boilerplateCode: {
          html: idx === 0 ? '<div></div>' : '',
          js: idx === 1 ? 'console.log("Hello");' : '',
        },
      });
    });
  }
  return exercises;
};

// Helper to generate main Editor Exercises (1 per stage)
const generateEditorExercises = (): any[] => {
  const exercises: any[] = [];
  for (let i = 1; i <= 12; i++) {
    const stageId = `s${i}`;
    let level: 'easy' | 'medium' | 'hard';
    if (i <= 4) level = 'easy';
    else if (i <= 8) level = 'medium';
    else level = 'hard';

    const exerciseObj: any = {
      id: `exercise_${stageId}`,
      module: `Milestone ${Math.ceil(i / 4)}`,
      title: `Thực hành Coding Workspace ${stageId}`,
      level,
      description: `Bài tập thực hành mặc định cho stage ${stageId}.`,
      evaluation_config: {
        lint: true,
        requirements: true,
        visual: false,
        behavior: false,
      },
      html_content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`,
      css_content: '',
      js_content: '',
      jsx_content: '',
      test_script: null,
      requirements: [],
      navigation: {
        prev: i > 1 ? { type: 'practice', id: `exercise_s${i - 1}` } : null,
        next: i < 12 ? { type: 'practice', id: `exercise_s${i + 1}` } : null,
      },
    };
    if (stageId === 's1') {
      exerciseObj.title = 'Test React 1: JSX Elements & Props';
      exerciseObj.description =
        'Tạo component có thẻ h1 nội dung "Hello React" và thẻ img bắt buộc có prop alt.';
      exerciseObj.jsx_content = `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="container">\n      {/* Viết code vào đây */}\n    </div>\n  );\n}`;
      exerciseObj.evaluation_config.behavior = true;
      exerciseObj.requirements = [
        {
          id: `req_s1_1`,
          text: 'Phải có thẻ <h1>',
          type_check: 'others',
          selector: 'h1',
          type: 'exist',
        },
        {
          id: `req_s1_2`,
          text: 'Thẻ img phải có prop alt',
          type_check: 'others',
          selector: 'alt',
          type: 'prop',
        },
        // 🔥 Test bằng Jest:
        {
          id: `req_s1_3`,
          text: 'Hiển thị chính xác chuỗi "Hello React" ra màn hình',
          type_check: 'behavior',
        },
      ];
      exerciseObj.test_script = `import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport UserApp from './UserCode.jsx';\n\ndescribe('Behavior - Render JSX', () => {\n  test('Component phải render chữ "Hello React"', () => {\n    render(<UserApp />);\n    expect(screen.getByText('Hello React')).toBeInTheDocument();\n  });\n});`;
    } else if (stageId === 's2') {
      exerciseObj.title = 'Test React 2: Hooks & Events';
      exerciseObj.description =
        'Sử dụng useState để tạo state đếm số, bắt đầu bằng 0. Khi bấm vào thẻ button, số sẽ tăng lên 1 và hiển thị ngay trên nút.';
      exerciseObj.jsx_content = `import React, { useState } from 'react';\n\nexport default function Counter() {\n  return (\n    <div>\n      {/* Thêm button vào đây */}\n    </div>\n  );\n}`;
      exerciseObj.evaluation_config.behavior = true;
      exerciseObj.requirements = [
        {
          id: `req_s2_1`,
          text: 'Dùng hook useState',
          type_check: 'others',
          selector: 'useState',
          type: 'hook',
        },
        // 🔥 Test bằng Jest:
        {
          id: `req_s2_2`,
          text: 'Mặc định hiển thị số 0 và tăng lên 1 khi bấm nút',
          type_check: 'behavior',
        },
      ];
      exerciseObj.test_script = `import React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport UserApp from './UserCode.jsx';\n\ndescribe('Behavior - Logic Click', () => {\n  test('Nút bấm bắt đầu bằng 0', () => {\n    render(<UserApp />);\n    expect(screen.getByRole('button').textContent).toBe('0');\n  });\n  test('Tăng lên 1 khi bấm nút', () => {\n    render(<UserApp />);\n    const btn = screen.getByRole('button');\n    fireEvent.click(btn);\n    expect(btn.textContent).toBe('1');\n  });\n});`;
    } else if (stageId === 's3') {
      exerciseObj.title = 'Test React 3: List Rendering & Map';
      exerciseObj.description =
        'Map mảng TABS ra danh sách TabButton. Đảm bảo prop `key` phải nằm ở component được map trong parent file.';
      exerciseObj.jsx_content = `import React from 'react';\n\nconst TABS = [{ id: 't1', label: 'Home' }];\n\nfunction TabButton({ id, label }) {\n  return <button id={id}>{label}</button>;\n}\n\nexport default function App() {\n  return <nav></nav>;\n}`;
      exerciseObj.evaluation_config.behavior = true;
      exerciseObj.requirements = [
        {
          id: `req_s3_1`,
          text: 'Bắt buộc cung cấp prop "key" khi map',
          type_check: 'others',
          selector: 'key',
          type: 'prop',
        },
        // 🔥 Test bằng Jest:
        {
          id: `req_s3_2`,
          text: 'Phải render đủ các tab ra màn hình',
          type_check: 'behavior',
        },
      ];
      exerciseObj.test_script = `import React from 'react';\nimport { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport UserApp from './UserCode.jsx';\n\ndescribe('Behavior - Render Vòng Lặp', () => {\n  test('Phải render đủ tab', () => {\n    render(<UserApp />);\n    expect(screen.getByText('Home')).toBeInTheDocument();\n  });\n});`;
    } else if (stageId === 's4') {
      exerciseObj.title = 'Test React 4: Controlled Input';
      exerciseObj.description =
        'Tạo một ô input (textbox) và một thẻ <p> có role="status". Trạng thái của input phải được lưu vào state. Bất cứ chữ gì gõ vào input đều phải hiển thị ngay lập tức ra thẻ <p>.';
      exerciseObj.jsx_content = `import React, { useState } from 'react';\n\nexport default function Form() {\n  const [text, setText] = useState('');\n  return (\n    <div>\n      {/* Tạo thẻ input và thẻ p role="status" ở đây */}\n    </div>\n  );\n}`;
      exerciseObj.evaluation_config.behavior = true;
      exerciseObj.requirements = [
        {
          id: `req_s4_1`,
          text: 'Dùng hook useState',
          type_check: 'others',
          selector: 'useState',
          type: 'hook',
        },
        {
          id: `req_s4_2`,
          text: 'Có thẻ input',
          type_check: 'others',
          selector: 'input',
          type: 'exist',
        },
        // 🔥 Test bằng Jest:
        {
          id: `req_s4_3`,
          text: 'Gõ vào input phải cập nhật text ra thẻ p ngay lập tức',
          type_check: 'behavior',
        },
      ];
      exerciseObj.test_script = `import React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport UserApp from './UserCode.jsx';\n\ndescribe('Behavior - Form Controlled Input', () => {\n  test('Gõ vào input phải cập nhật thẻ p', () => {\n    render(<UserApp />);\n    const input = screen.getByRole('textbox');\n    const display = screen.getByRole('status');\n    \n    fireEvent.change(input, { target: { value: 'Frontendly' } });\n    expect(display.textContent).toBe('Frontendly');\n  });\n});`;
    } else if (stageId === 's5') {
      exerciseObj.title = 'Test React 5: Conditional Rendering';
      exerciseObj.description =
        'Tạo một button có tên "Toggle" và một thẻ <div> chứa chữ "Secret". Mặc định chữ Secret bị ẩn (không render ra DOM). Bấm Toggle lần 1 -> Hiện Secret. Bấm Toggle lần 2 -> Ẩn Secret.';
      exerciseObj.jsx_content = `import React, { useState } from 'react';\n\nexport default function ToggleSecret() {\n  const [show, setShow] = useState(false);\n  return (\n    <div>\n      {/* Code logic ẩn/hiện ở đây */}\n    </div>\n  );\n}`;
      exerciseObj.evaluation_config.behavior = true;
      exerciseObj.requirements = [
        {
          id: `req_s5_1`,
          text: 'Có nút Toggle',
          type_check: 'others',
          selector: 'button',
          type: 'exist',
        },
        // 🔥 Test bằng Jest:
        {
          id: `req_s5_2`,
          text: 'Ẩn/Hiện div Secret chính xác khi bấm nút Toggle',
          type_check: 'behavior',
        },
      ];
      exerciseObj.test_script = `import React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\nimport UserApp from './UserCode.jsx';\n\ndescribe('Behavior - Conditional Rendering', () => {\n  test('Ẩn/Hiện div khi bấm nút', () => {\n    render(<UserApp />);\n    const btn = screen.getByRole('button', { name: /toggle/i });\n    \n    expect(screen.queryByText('Secret')).not.toBeInTheDocument();\n    \n    fireEvent.click(btn);\n    expect(screen.getByText('Secret')).toBeInTheDocument();\n    \n    fireEvent.click(btn);\n    expect(screen.queryByText('Secret')).not.toBeInTheDocument();\n  });\n});`;
    }
    // Fallback
    else {
      exerciseObj.requirements = [
        {
          id: `req_${stageId}_1`,
          text: 'Phải có thẻ <h1>',
          type_check: 'others',
          selector: 'h1',
          type: 'exist',
        },
      ];
    }
    exercises.push(exerciseObj);
  }
  return exercises;
};

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  try {
    console.log(`🚀 Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI!);
    console.log('✅ Connected.\n');

    // 1. Clear existing data
    console.log('🧹 Cleaning up old data...');
    await Promise.all([
      Roadmap.deleteMany({}),
      Milestone.deleteMany({}),
      LpExercise.deleteMany({}),
      Theory.deleteMany({}),
      Exercise.deleteMany({}),
      Submission.deleteMany({}),
      Badge.deleteMany({}),
    ]);
    console.log('✅ Cleanup complete.\n');

    // 2. Seed Badges
    console.log('🌱 Seeding Badges...');
    await Badge.insertMany(BADGES_DATA);
    console.log(`✅ Upserted ${BADGES_DATA.length} badges.\n`);

    // 3. Seed Test User
    console.log('🌱 Seeding Test User...');
    let testUser = await User.findOne({ email: 'test@frontendly.com' });
    if (!testUser) {
      testUser = await User.create({
        email: 'test@frontendly.com',
        username: 'testuser',
        name: 'Test User',
        avatarUrl:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        level: 5,
        xp: 2500,
        skills: [
          { name: 'HTML', level: 8, earnedAt: new Date() },
          { name: 'CSS', level: 6, earnedAt: new Date() },
          { name: 'JS', level: 4, earnedAt: new Date() },
          { name: 'JSX', level: 2, earnedAt: new Date() },
        ],
        stats: {
          totalLearningTime: 1200,
          coursesCompleted: 2,
          streakDays: 7,
          lastActiveAt: new Date(),
        },
      });
      console.log(`✅ Created test user: ${testUser.email}`);
    } else {
      console.log(`✅ Test user already exists: ${testUser.email}`);
    }

    // 4. Seed Activity Logs for test user only if none exist
    console.log('🌱 Seeding Activity Logs...');
    const existingTestUserLogsCount = await ActivityLog.countDocuments({
      userId: testUser._id.toString(),
    });
    if (existingTestUserLogsCount === 0) {
      const logs = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        // eslint-disable-next-line sonarjs/pseudo-random
        if (Math.random() > 0.3) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          logs.push({
            userId: testUser._id.toString(),
            type: 'lesson_completed',
            description: `Completed lesson on ${date.toDateString()}`,
            timestamp: date,
          });
        }
      }
      if (logs.length > 0) {
        await ActivityLog.insertMany(logs);
        console.log(`✅ Inserted ${logs.length} activity logs.`);
      }
    } else {
      console.log(
        `✅ Activity logs already exist for test user (${existingTestUserLogsCount} entries).`,
      );
    }

    // 5. Seed Roadmap
    console.log('🌱 Seeding Roadmaps...');
    await Roadmap.insertMany(ROADMAP_DATA);
    console.log(`✅ Upserted ${ROADMAP_DATA.length} roadmaps.`);

    // 6. Seed Milestones
    console.log('🌱 Seeding Milestones...');
    await Milestone.insertMany(MILESTONES_DATA);
    console.log(`✅ Upserted ${MILESTONES_DATA.length} milestones.`);

    // 7. Seed Theories
    console.log('🌱 Seeding Theories...');
    const theories = generateTheories();
    await Theory.insertMany(theories);
    console.log(`✅ Upserted ${theories.length} theories.`);

    // 8. Seed LpExercises
    console.log('🌱 Seeding LpExercises...');
    const lpExercises = generateLpExercises();
    await LpExercise.insertMany(lpExercises);
    console.log(`✅ Upserted ${lpExercises.length} learning path exercises.`);

    // 9. Seed Editor Exercises
    console.log('🌱 Seeding Editor Exercises...');
    const editorExercises = generateEditorExercises();
    await Exercise.insertMany(editorExercises);
    console.log(
      `✅ Upserted ${editorExercises.length} coding workspace exercises.`,
    );

    console.log('\n✨ Seeding complete! Project is ready for testing.');
    process.exit(0);
  } catch (err: unknown) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

void seed();
