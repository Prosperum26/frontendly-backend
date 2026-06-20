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
import { EntranceTestQuestionSchema } from '../src/entrance-test/db_schemas/entrance-test.schema';
import { ChallengeExerciseSchema } from '../src/challenge/db_schemas/challenge.schema';

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
const EntranceTestQuestion = mongoose.model('EntranceTestQuestion', EntranceTestQuestionSchema);
const ChallengeExercise = mongoose.model('ChallengeExercise', ChallengeExerciseSchema);

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

const ENTRANCE_TEST_QUESTIONS_DATA = [
  {
    id: 'etq1',
    question: 'HTML là viết tắt của từ gì?',
    type: 'multiple-choice',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
    correctAnswer: 'Hyper Text Markup Language',
    starterCode: '',
  },
  {
    id: 'etq2',
    question: 'Thẻ nào dùng để tạo liên kết trong HTML?',
    type: 'multiple-choice',
    options: ['<link>', '<a>', '<href>', '<url>'],
    correctAnswer: '<a>',
    starterCode: '',
  },
  {
    id: 'etq3',
    question: 'CSS dùng để làm gì?',
    type: 'multiple-choice',
    options: ['Lưu trữ dữ liệu', 'Định dạng và trang trí trang web', 'Thực hiện logic tính toán', 'Kết nối cơ sở dữ liệu'],
    correctAnswer: 'Định dạng và trang trí trang web',
    starterCode: '',
  },
  {
    id: 'etq4',
    question: 'JavaScript là ngôn ngữ biên dịch hay thông dịch?',
    type: 'multiple-choice',
    options: ['Biên dịch', 'Thông dịch', 'Cả hai', 'Không phải hai loại trên'],
    correctAnswer: 'Thông dịch',
    starterCode: '',
  },
  {
    id: 'etq5',
    question: 'DOM là viết tắt của Document Object Model.',
    type: 'true-false',
    options: ['Đúng', 'Sai'],
    correctAnswer: 'Đúng',
    starterCode: '',
  },
];

const CHALLENGE_EXERCISES_DATA = [
  {
    id: 'ce1',
    title: 'Landing Page đơn giản',
    description: 'Tạo một trang landing page đẹp mắt với HTML và CSS cơ bản',
    difficulty: 'beginner',
    tags: ['HTML', 'CSS'],
    previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  },
  {
    id: 'ce2',
    title: 'Todo App với JS',
    description: 'Xây dựng ứng dụng quản lý công việc với JavaScript vanilla',
    difficulty: 'intermediate',
    tags: ['JavaScript', 'DOM'],
    previewImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
  },
  {
    id: 'ce3',
    title: 'Responsive Dashboard',
    description: 'Tạo một bảng điều khiển hoàn chỉnh với responsive design',
    difficulty: 'advanced',
    tags: ['HTML', 'CSS', 'Flexbox', 'Grid'],
    previewImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38e37?w=400&h=300&fit=crop',
  },
  {
    id: 'ce4',
    title: 'Weather App',
    description: 'Xây dựng ứng dụng xem thời tiết sử dụng API',
    difficulty: 'intermediate',
    tags: ['JavaScript', 'API'],
    previewImage: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop',
  },
  {
    id: 'ce5',
    title: 'Blog Template',
    description: 'Thiết kế một template blog hiện đại',
    difficulty: 'intermediate',
    tags: ['HTML', 'CSS', 'Design'],
    previewImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
  },
  {
    id: 'ce6',
    title: 'E-Commerce Product Card',
    description: 'Tạo thẻ sản phẩm cho trang thương mại điện tử',
    difficulty: 'beginner',
    tags: ['HTML', 'CSS'],
    previewImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
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
    if (i <= 4) {
      level = 'easy';
    } else if (i <= 8) {
      level = 'medium';
    } else {
      level = 'hard';
    }
    const evaluationConfig = {
      lint: true,
      requirements: true,
      visual: false,
    };
    let targetDesigns: Array<{
      deviceType: string;
      width: number;
      height: number;
      url: string;
    }> = [];

    // Bài từ s8 trở đi (hard) cần visual check
    if (level === 'hard') {
      evaluationConfig.visual = true;
      targetDesigns = [
        {
          deviceType: 'desktop',
          width: 1280,
          height: 720,
          url: 'https://via.placeholder.com/1280x720',
        },
      ];
    }

    // Ví dụ bài s1 siêu đơn giản
    if (stageId === 's1') {
      evaluationConfig.requirements = true;
      evaluationConfig.lint = true;
      evaluationConfig.visual = false;
    }

    // Ví dụ bài tự do (s12 có thể tự do hơn)
    if (stageId === 's12') {
      evaluationConfig.lint = false;
      evaluationConfig.requirements = false;
      evaluationConfig.visual = false;
    }

    exercises.push({
      id: `exercise_${stageId}`,
      module: `Milestone ${Math.ceil(i / 4)}`,
      title: `Thực hành Coding Workspace ${stageId}`,
      level,
      description: `Đây là bài tập lớn cuối stage ${stageId}. Hãy sử dụng trình soạn thảo code để hoàn thành thử thách này.`,
      target_designs: targetDesigns,
      evaluation_config: evaluationConfig,
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
      Badge.deleteMany({}),
      EntranceTestQuestion.deleteMany({}),
      ChallengeExercise.deleteMany({}),
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

    // 10. Seed Entrance Test Questions
    console.log('🌱 Seeding Entrance Test Questions...');
    await EntranceTestQuestion.insertMany(ENTRANCE_TEST_QUESTIONS_DATA);
    console.log(`✅ Upserted ${ENTRANCE_TEST_QUESTIONS_DATA.length} entrance test questions.`);

    // 11. Seed Challenge Exercises
    console.log('🌱 Seeding Challenge Exercises...');
    await ChallengeExercise.insertMany(CHALLENGE_EXERCISES_DATA);
    console.log(`✅ Upserted ${CHALLENGE_EXERCISES_DATA.length} challenge exercises.`);

    console.log('\n✨ Seeding complete! Project is ready for testing.');
    process.exit(0);
  } catch (err: unknown) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

void seed();
