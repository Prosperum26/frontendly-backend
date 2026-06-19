import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as path from 'path';

// Import schemas from the project
import { ExerciseTag } from '../src/editor/db_schemas/exercise.enum'; // Điều chỉnh lại đường dẫn này nếu cần
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

// 🔥 Thêm Import Enums từ dự án của ông

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
    let levelTag: ExerciseTag;

    if (i <= 4) {
      level = 'easy';
      levelTag = ExerciseTag.EASY;
    } else if (i <= 8) {
      level = 'medium';
      levelTag = ExerciseTag.MEDIUM;
    } else {
      level = 'hard';
      levelTag = ExerciseTag.HARD;
    }

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
      target_design: {
        deviceType: 'desktop',
        width: 1024,
        height: 768,
      },
      code_test: null,
      test_script: null,
      restrictions: [],
      tags: [levelTag, ExerciseTag.REACTJS],
      requirements: [],
      navigation: {
        prev: i > 1 ? { type: 'practice', id: `exercise_s${i - 1}` } : null,
        next: i < 12 ? { type: 'practice', id: `exercise_s${i + 1}` } : null,
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (stageId === 's1') {
      /* Giữ nguyên s1 -> s5 của ông */
    }

    // 🎨 BÀI TEST VISUAL 1: HTML & CSS THUẦN
    else if (stageId === 's6') {
      exerciseObj.title = 'Visual Match: CSS Box Model';
      exerciseObj.description =
        'Tạo một thẻ Box nằm giữa màn hình. Hãy viết code sao cho ra giao diện giống hệt mẫu (Pixel-perfect). Dù bạn dùng thẻ HTML hay class name nào cũng được, miễn là nhìn bằng mắt giống 100%.';
      exerciseObj.evaluation_config.visual = true;
      exerciseObj.evaluation_config.requirements = false;
      exerciseObj.target_design = {
        deviceType: 'desktop',
        width: 1920,
        height: 1080,
      };

      // Data chuẩn của Giảng viên (Dùng thẻ div, mã màu HEX, class)
      exerciseObj.code_test = {
        html: `<div class="target-card">\n  <h2>Visual Match</h2>\n</div>`,
        css: `body {\n  margin: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  background: #e9ecef;\n}\n.target-card {\n  background: #ffffff;\n  width: 300px;\n  height: 150px;\n  border: 3px solid #212529;\n  border-radius: 10px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  box-shadow: 5px 5px 0px #adb5bd;\n}\nh2 {\n  color: #e63946;\n  font-family: sans-serif;\n  margin: 0;\n}`,
        js: '',
        jsx: '',
      };

      exerciseObj.html_content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  <div id="my-box">\n    \n  </div>\n</body>\n</html>`;
    }

    // 🎨 BÀI TEST VISUAL 2: REACT JSX
    else if (stageId === 's7') {
      exerciseObj.title = 'Visual Match: React Alert Component';
      exerciseObj.description =
        'Tạo một component AlertBox bằng React. Yêu cầu giao diện phải khớp 100% với bản thiết kế mẫu.';
      exerciseObj.evaluation_config.visual = true;
      exerciseObj.evaluation_config.requirements = false;
      exerciseObj.target_design = {
        deviceType: 'desktop',
        width: 800,
        height: 600,
      };

      // Data chuẩn của Giảng viên - phải match với user code pattern
      exerciseObj.code_test = {
        html: '<div id="root"></div>',
        css: `.alert-success {\n  padding: 20px;\n  background-color: #e0f7fa;\n  color: #006064;\n  border-left: 6px solid #00acc1;\n  font-family: Arial, sans-serif;\n  max-width: 400px;\n  margin: 20px auto;\n}\n\n.alert-title {\n  display: block;\n  margin-bottom: 8px;\n  font-size: 18px;\n  font-weight: bold;\n}`,
        js: '',
        jsx: `import React from 'react';\n\nexport default function AlertBox() {\n  return (\n    <div className="alert-success">\n      <strong className="alert-title">Success!</strong>\n      <span>Your visual test passed perfectly.</span>\n    </div>\n  );\n}`,
      };

      exerciseObj.html_content = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`;

      exerciseObj.jsx_content = `import React from 'react';\nimport './style.css';\n\nexport default function AlertBox() {\n  return (\n    <section>\n      {/* Code giao diện của bạn */}\n    </section>\n  );\n}`;
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
