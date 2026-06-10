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
import { UserSchema } from '../src/users/schemas/user.schema';
import { ActivityLogSchema } from '../src/users/schemas/activity-log.schema';

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

// ── Data ────────────────────────────────────────────────────────────────────

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
    exercises.push({
      id: `exercise_${stageId}`,
      module: `Milestone ${Math.ceil(i / 4)}`,
      title: `Thực hành Coding Workspace ${stageId}`,
      level: i <= 4 ? 'easy' : i <= 8 ? 'medium' : 'hard',
      description: `Đây là bài tập lớn cuối stage ${stageId}. Hãy sử dụng trình soạn thảo code để hoàn thành thử thách này.`,
      target_designs: [
        {
          deviceType: 'desktop',
          width: 1280,
          height: 720,
          url: 'https://via.placeholder.com/1280x720',
        },
      ],
      html_content: '<!-- Viết code HTML của bạn ở đây -->\n<h1></h1>',
      css_content: '/* Viết code CSS của bạn ở đây */\nh1 { color: blue; }',
      js_content: '// Viết code JS của bạn ở đây\nconsole.log("Start!");',
      requirements: [
        {
          id: `req_${stageId}_1`,
          text: 'Phải có thẻ <h1>',
          selector: 'h1',
          type: 'exist',
        },
      ],
      navigation: {
        prev: i > 1 ? { type: 'practice', id: `exercise_s${i - 1}` } : null,
        next: i < 12 ? { type: 'practice', id: `exercise_s${i + 1}` } : null,
      },
    });
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
      User.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);
    console.log('✅ Cleanup complete.\n');

    // 2. Seed Test User
    console.log('🌱 Seeding Test User...');
    const testUser = await User.create({
      email: 'test@frontendly.com',
      username: 'testuser',
      name: 'Test User',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      level: 5,
      xp: 2500,
      skills: [
        { name: 'HTML', level: 8, earnedAt: new Date() },
        { name: 'CSS', level: 6, earnedAt: new Date() },
        { name: 'JS', level: 4, earnedAt: new Date() },
      ],
      stats: {
        totalLearningTime: 1200,
        coursesCompleted: 2,
        streakDays: 7,
        lastActiveAt: new Date(),
      }
    });
    console.log(`✅ Created test user: ${testUser.email}`);

    // 3. Seed Activity Logs for test user
    console.log('🌱 Seeding Activity Logs...');
    const logs = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
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
    await ActivityLog.insertMany(logs);
    console.log(`✅ Inserted ${logs.length} activity logs.`);

    // 4. Seed Roadmap
    console.log('🌱 Seeding Roadmaps...');
    await Roadmap.insertMany(ROADMAP_DATA);
    console.log(`✅ Upserted ${ROADMAP_DATA.length} roadmaps.`);

    // 5. Seed Milestones
    console.log('🌱 Seeding Milestones...');
    await Milestone.insertMany(MILESTONES_DATA);
    console.log(`✅ Upserted ${MILESTONES_DATA.length} milestones.`);

    // 6. Seed Theories
    console.log('🌱 Seeding Theories...');
    const theories = generateTheories();
    await Theory.insertMany(theories);
    console.log(`✅ Upserted ${theories.length} theories.`);

    // 7. Seed LpExercises
    console.log('🌱 Seeding LpExercises...');
    const lpExercises = generateLpExercises();
    await LpExercise.insertMany(lpExercises);
    console.log(`✅ Upserted ${lpExercises.length} learning path exercises.`);

    // 8. Seed Editor Exercises
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
