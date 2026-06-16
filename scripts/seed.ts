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
  {
    name: 'HTML Master',
    icon: '🎯',
    description: 'Complete Milestone 1: HTML Fundamentals',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'm1',
    },
  },
  {
    name: 'CSS Architect',
    icon: '🎨',
    description: 'Complete Milestone 2: CSS Styling',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'm2',
    },
  },
  {
    name: 'JS Warrior',
    icon: '⚡',
    description: 'Complete Milestone 3: JavaScript Interactivity',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'm3',
    },
  },
  {
    name: 'Course Graduate',
    icon: '🎓',
    description: 'Complete all 3 milestones',
    category: 'special',
    unlockCondition: { type: 'milestone_completed', value: 3 },
  },
  {
    name: 'React Pioneer',
    icon: '🌱',
    description: 'Complete Milestone 1: React Foundations',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'rm1',
    },
  },
  {
    name: 'Component Architect',
    icon: '🧩',
    description: 'Complete Milestone 2: React Components & Props',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'rm2',
    },
  },
  {
    name: 'Hooks Wizard',
    icon: '🪝',
    description: 'Complete Milestone 3: React Hooks & Advanced Patterns',
    category: 'learning',
    unlockCondition: {
      type: 'milestone_completed',
      value: 1,
      milestoneId: 'rm3',
    },
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

const REACT_MILESTONES_DATA = [
  {
    id: 'rm1',
    title: 'React Foundations',
    icon: 'react',
    status: 'in_progress',
    stages: [
      {
        id: 'rs1',
        title: 'Introduction to React',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'rs2',
        title: 'Rendering HTML with React',
        isCompleted: false,
        earnedStars: 0,
      },
      { id: 'rs3', title: 'JSX Syntax', isCompleted: false, earnedStars: 0 },
      {
        id: 'rs4',
        title: 'Expressions in JSX',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'rm2',
    title: 'Components & Props',
    icon: 'components',
    status: 'locked',
    stages: [
      {
        id: 'rs5',
        title: 'Functional Components',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'rs6',
        title: 'Props & Data Flow',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'rs7',
        title: 'State with useState',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'rs8',
        title: 'Event Handling in React',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'rm3',
    title: 'Hooks & Advanced Patterns',
    icon: 'hooks',
    status: 'locked',
    stages: [
      {
        id: 'rs9',
        title: 'useEffect Hook',
        isCompleted: false,
        earnedStars: 0,
      },
      { id: 'rs10', title: 'Lists & Keys', isCompleted: false, earnedStars: 0 },
      { id: 'rs11', title: 'useContext', isCompleted: false, earnedStars: 0 },
      { id: 'rs12', title: 'Custom Hooks', isCompleted: false, earnedStars: 0 },
    ],
  },
];

const ROADMAP_DATA = [
  {
    skillId: 'frontend',
    skillTitle: 'Frontend Developer Path',
    milestoneIds: ['m1', 'm2', 'm3'],
  },
  {
    skillId: 'react',
    skillTitle: 'React.js Developer Path',
    milestoneIds: ['rm1', 'rm2', 'rm3'],
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

const REACT_STAGES: Array<{ id: string; title: string }> = [
  { id: 'rs1', title: 'Introduction to React' },
  { id: 'rs2', title: 'Rendering HTML with React' },
  { id: 'rs3', title: 'JSX Syntax' },
  { id: 'rs4', title: 'Expressions in JSX' },
  { id: 'rs5', title: 'Functional Components' },
  { id: 'rs6', title: 'Props & Data Flow' },
  { id: 'rs7', title: 'State with useState' },
  { id: 'rs8', title: 'Event Handling in React' },
  { id: 'rs9', title: 'useEffect Hook' },
  { id: 'rs10', title: 'Lists & Keys' },
  { id: 'rs11', title: 'useContext' },
  { id: 'rs12', title: 'Custom Hooks' },
];

const generateReactTheories = (): any[] =>
  REACT_STAGES.map(stage => ({
    stageId: stage.id,
    title: stage.title,
    contentHtml: `<h1>${stage.title}</h1><p>Welcome to <strong>${stage.title}</strong>. This lesson covers essential React concepts to build modern frontends.</p>`,
    proTips: `Tip: Experiment with ${stage.title} in a CodeSandbox to learn by doing!`,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    referenceLinks: [
      { title: 'React Official Docs', url: 'https://react.dev', type: 'doc' },
    ],
  }));

const generateReactLpExercises = (): any[] => {
  const exercises: any[] = [];
  REACT_STAGES.forEach(stage => {
    ['easy', 'medium', 'hard'].forEach((level, diffIdx) => {
      exercises.push({
        id: `lp_ex_${stage.id}_${diffIdx + 1}`,
        stageId: stage.id,
        level,
        title: `${level.charAt(0).toUpperCase()}${level.slice(1)} exercise for ${stage.title}`,
        instruction: `Complete this ${level} exercise to practice ${stage.title}.`,
        boilerplateCode: {
          html: diffIdx === 0 ? '<div id="root"></div>' : '',
          js: diffIdx === 1 ? `// ${stage.title}\nconsole.log("React!");` : '',
        },
      });
    });
  });
  return exercises;
};

const generateReactEditorExercises = (): any[] =>
  REACT_STAGES.map((stage, idx) => {
    const i = idx + 1;
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
      visual: level === 'hard',
    };
    const targetDesigns =
      level === 'hard'
        ? [
            {
              deviceType: 'desktop',
              width: 1280,
              height: 720,
              url: 'https://via.placeholder.com/1280x720',
            },
          ]
        : [];

    return {
      id: `exercise_${stage.id}`,
      module: `Milestone ${Math.ceil(i / 4)}`,
      title: `React Practice: ${stage.title}`,
      level,
      description: `Build a React component demonstrating ${stage.title}.`,
      target_designs: targetDesigns,
      evaluation_config: evaluationConfig,
      html_content: '<div id="root"></div>',
      css_content: `/* Styles for ${stage.title} */\nbody { font-family: sans-serif; }`,
      js_content: `// ${stage.title}\nconst root = document.getElementById('root');\nroot.innerHTML = '<h1>Hello React!</h1>';`,
      requirements: [
        {
          id: `req_${stage.id}_1`,
          text: 'Must have a root element',
          selector: '#root',
          type: 'exist',
        },
      ],
      navigation: {
        prev: i > 1 ? { type: 'practice', id: `exercise_rs${i - 1}` } : null,
        next: i < 12 ? { type: 'practice', id: `exercise_rs${i + 1}` } : null,
      },
    };
  });

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

    // 6. Seed Milestones (frontend + react)
    console.log('🌱 Seeding Milestones...');
    const allMilestones = [...MILESTONES_DATA, ...REACT_MILESTONES_DATA];
    await Milestone.insertMany(allMilestones);
    console.log(`✅ Upserted ${allMilestones.length} milestones.`);

    // 7. Seed Theories (frontend + react)
    console.log('🌱 Seeding Theories...');
    const theories = [...generateTheories(), ...generateReactTheories()];
    await Theory.insertMany(theories);
    console.log(`✅ Upserted ${theories.length} theories.`);

    // 8. Seed LpExercises (frontend + react)
    console.log('🌱 Seeding LpExercises...');
    const lpExercises = [
      ...generateLpExercises(),
      ...generateReactLpExercises(),
    ];
    await LpExercise.insertMany(lpExercises);
    console.log(`✅ Upserted ${lpExercises.length} learning path exercises.`);

    // 9. Seed Editor Exercises (frontend + react)
    console.log('🌱 Seeding Editor Exercises...');
    const editorExercises = [
      ...generateEditorExercises(),
      ...generateReactEditorExercises(),
    ];
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
