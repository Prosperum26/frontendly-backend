import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose from 'mongoose';
import * as path from 'path';

// Import schemas from the project
import {
  ExerciseTag,
  JsxRestriction,
} from '../src/editor/db_schemas/exercise.enum';
import { ExerciseSchema } from '../src/editor/db_schemas/exercise_schema';
import { CanonicalMapSchema } from '../src/entrance-test/db_schemas/canonical-map.schema';
import { CourseTheorySchema } from '../src/entrance-test/db_schemas/course-theory.schema';
import { EntranceTestSchema } from '../src/entrance-test/db_schemas/entrance-test.schema';
import {
  RoadmapSchema,
  LpExerciseSchema,
} from '../src/learning-path/db_schemas/learning_path_schemas';
import { MilestoneSchema } from '../src/learning-path/db_schemas/milestone_schema';
import { TheorySchema } from '../src/learning-path/db_schemas/theory_schema';
import { BadgeSchema } from '../src/users/schemas/badge.schema';

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
const Badge = mongoose.model('Badge', BadgeSchema);
const EntranceTest = mongoose.model('EntranceTest', EntranceTestSchema);
const CanonicalMap = mongoose.model('CanonicalMap', CanonicalMapSchema);
const CourseTheory = mongoose.model('CourseTheory', CourseTheorySchema);

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
    title: 'React Fundamentals',
    icon: 'reactjs',
    status: 'in_progress',
    stages: [
      {
        id: 's1',
        title: 'My First React Component',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's2',
        title: 'Rendering HTML in React',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's3',
        title: 'React CSS Modules & className',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's4',
        title: 'JSX Expressions with Variables',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'm2',
    title: 'React Styling & Interactivity',
    icon: 'css3',
    status: 'locked',
    stages: [
      {
        id: 's5',
        title: 'Interactive Profile Card',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's6',
        title: 'Styling with JS Style Objects',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's7',
        title: 'React CSS Modules',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's8',
        title: 'React JSX Conditional Statements',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'm3',
    title: 'React Components & State',
    icon: 'javascript',
    status: 'locked',
    stages: [
      {
        id: 's9',
        title: 'React Component',
        isCompleted: false,
        earnedStars: 0,
      },
      { id: 's10', title: 'Passing Props', isCompleted: false, earnedStars: 0 },
      {
        id: 's11',
        title: 'Destructuring Props - Default Values',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's12',
        title: 'Stateful Counter Component',
        isCompleted: false,
        earnedStars: 0,
      },
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

// ── Helpers to load real data ────────────────────────────────────────────────

const basePath = path.resolve(__dirname, '../src/data');
const entranceTestData = JSON.parse(
  fs.readFileSync(path.join(basePath, 'entrance_test.json'), 'utf-8'),
);
const canonicalMapData = JSON.parse(
  fs.readFileSync(path.join(basePath, 'canonical_map.json'), 'utf-8'),
);
const lessonsData = JSON.parse(
  fs.readFileSync(path.join(basePath, 'lessons.json'), 'utf-8'),
);
const theoryData = JSON.parse(
  fs.readFileSync(path.join(basePath, 'theory.json'), 'utf-8'),
);

const RESTRICTION_KEY_MAP: Record<string, JsxRestriction> = {
  BANNED_INLINE_STYLE: JsxRestriction.BANNED_INLINE_STYLE,
  BANNED_USE_STATE: JsxRestriction.BANNED_USE_STATE,
  BANNED_USE_EFFECT: JsxRestriction.BANNED_USE_EFFECT,
  BANNED_USE_REF: JsxRestriction.BANNED_USE_REF,
  BANNED_ALL_HOOKS: JsxRestriction.BANNED_ALL_HOOKS,
  BANNED_MAP: JsxRestriction.BANNED_MAP,
  BANNED_CREATE_ELEMENT: JsxRestriction.BANNED_CREATE_ELEMENT,
  BANNED_TERNARY: JsxRestriction.BANNED_TERNARY,
  BANNED_LOGICAL_AND: JsxRestriction.BANNED_LOGICAL_AND,
  BANNED_IF_STATEMENT: JsxRestriction.BANNED_IF_STATEMENT,
  BANNED_PROPS_DESTRUCTURING: JsxRestriction.BANNED_PROPS_DESTRUCTURING,
  REQUIRED_PROPS_DESTRUCTURING: JsxRestriction.REQUIRED_PROPS_DESTRUCTURING,
};

const generateEditorExercises = (): any[] => {
  return lessonsData.lessons.map((lesson: any) => {
    const data = lesson.data;
    let levelTag: ExerciseTag;
    if (data.level === 'easy') levelTag = ExerciseTag.EASY;
    else if (data.level === 'medium') levelTag = ExerciseTag.MEDIUM;
    else levelTag = ExerciseTag.HARD;

    const restrictions = (data.restrictions || [])
      .map((item: string | { rule: string; message?: string }) => {
        const rawRule = typeof item === 'string' ? item : item.rule;
        const rule = RESTRICTION_KEY_MAP[rawRule] ?? <JsxRestriction>rawRule;
        return {
          rule,
          message:
            (typeof item === 'object' && item.message) ||
            `Restriction: ${rawRule}`,
        };
      })
      .filter((r: { rule: JsxRestriction }) =>
        Object.values(JsxRestriction).includes(r.rule),
      );

    return {
      id: data.id,
      module: data.module,
      title: data.title,
      level: data.level,
      description: data.description,
      evaluation_config: data.evaluation_config,
      restrictions,
      tags: [levelTag, ExerciseTag.REACTJS],
      html_content: data.html_content,
      css_content: data.css_content,
      js_content: data.js_content,
      jsx_content: data.jsx_content,
      target_design: data.target_design,
      code_test: data.code_test,
      test_script: data.test_script,
      requirements: data.requirements.map((req: any) => ({
        id: req.id,
        text: req.text,
        type: req.type,
        selector: req.selector,
        type_check: req.type_check,
        expectedValue: req.expectedValue,
      })),
      navigation: data.navigation,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
};

const generateTheories = (): any[] => {
  const theories: any[] = [];
  for (const milestone of theoryData.milestones) {
    for (const lesson of milestone.lessons) {
      const canonicalIndex = canonicalMapData.order.indexOf(lesson.lessonId);
      const stageId =
        canonicalIndex >= 0 ? `s${canonicalIndex + 1}` : lesson.lessonId;
      theories.push({
        stageId,
        title: lesson.title,
        contentHtml: lesson.sections
          .map(
            (s: any) => `
          <section>
            <h2>${s.heading}</h2>
            <p>${s.content}</p>
            ${s.code ? `<pre><code>${s.code}</code></pre>` : ''}
          </section>
        `,
          )
          .join(''),
        proTips: lesson.keyTakeaways.join(' • '),
        videoUrl: '',
        referenceLinks: [
          {
            title: 'React Documentation',
            url: 'https://react.dev',
            type: 'doc',
          },
        ],
      });
    }
  }
  return theories;
};

const generateLpExercises = (): any[] => {
  const exercises: any[] = [];

  canonicalMapData.order.forEach((canonicalId: string, index: number) => {
    const stageId = `s${index + 1}`;
    const mapEntry = canonicalMapData.map[canonicalId];
    const lessonFromTheory = theoryData.milestones
      .flatMap((m: any) => m.lessons)
      .find((l: any) => l.lessonId === canonicalId);
    const exerciseFromLessons = lessonsData.lessons.find(
      (l: any) => l.data.id === mapEntry?.exerciseId,
    );

    const baseTitle =
      lessonFromTheory?.title ||
      exerciseFromLessons?.data.title ||
      mapEntry?.title ||
      `Lesson ${index + 1}`;

    ['easy', 'medium', 'hard'].forEach((level, idx) => {
      exercises.push({
        id: `lp_ex_${stageId}_${idx + 1}`,
        stageId,
        level,
        title: `${baseTitle} - ${level.charAt(0).toUpperCase() + level.slice(1)} Practice`,
        instruction: `Thực hành bài ${level} cho ${baseTitle}`,
        boilerplateCode: { html: '', css: '', js: '', jsx: '' },
      });
    });
  });
  return exercises;
};

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  try {
    console.log(`🚀 Connecting to MongoDB...`);
    await mongoose.connect(MONGO_URI!);
    console.log('✅ Connected.\n');

    console.log('🔄 Upserting data (keeping user data)...\n');

    console.log('🌱 Upserting Entrance Test Data...');
    await EntranceTest.deleteMany({}); // Xóa và tạo lại vì đây là dữ liệu test cố định
    await EntranceTest.create(entranceTestData);
    console.log('✅ Upserted entrance test data.\n');

    console.log('🌱 Upserting Canonical Map Data...');
    await CanonicalMap.deleteMany({}); // Xóa và tạo lại vì đây là dữ liệu cố định
    await CanonicalMap.create(canonicalMapData);
    console.log('✅ Upserted canonical map data.\n');

    console.log('🌱 Upserting Course Theory Data...');
    await CourseTheory.deleteMany({}); // Xóa và tạo lại vì đây là dữ liệu cố định
    await CourseTheory.create(theoryData);
    console.log('✅ Upserted course theory data.\n');

    console.log('🌱 Upserting Badges...');
    for (const badge of BADGES_DATA) {
      await Badge.updateOne(
        { name: badge.name }, // Tìm badge theo tên
        { $set: badge }, // Cập nhật nếu tìm thấy
        { upsert: true }, // Tạo mới nếu không tìm thấy
      );
    }
    console.log(`✅ Upserted ${BADGES_DATA.length} badges.\n`);

    console.log('🌱 Upserting Roadmaps...');
    for (const roadmap of ROADMAP_DATA) {
      await Roadmap.updateOne(
        { skillId: roadmap.skillId },
        { $set: roadmap },
        { upsert: true },
      );
    }
    console.log(`✅ Upserted ${ROADMAP_DATA.length} roadmaps.`);

    console.log('🌱 Upserting Milestones...');
    for (const milestone of MILESTONES_DATA) {
      await Milestone.updateOne(
        { id: milestone.id },
        { $set: milestone },
        { upsert: true },
      );
    }
    console.log(`✅ Upserted ${MILESTONES_DATA.length} milestones.`);

    console.log('🌱 Upserting Theories...');
    const theories = generateTheories();
    for (const theory of theories) {
      await Theory.updateOne(
        { stageId: theory.stageId },
        { $set: theory },
        { upsert: true },
      );
    }
    console.log(`✅ Upserted ${theories.length} theories.`);

    console.log('🌱 Upserting LpExercises...');
    const lpExercises = generateLpExercises();
    for (const exercise of lpExercises) {
      await LpExercise.updateOne(
        { id: exercise.id },
        { $set: exercise },
        { upsert: true },
      );
    }
    console.log(`✅ Upserted ${lpExercises.length} learning path exercises.`);

    console.log('🌱 Upserting Editor Exercises...');
    const editorExercises = generateEditorExercises();
    for (const exercise of editorExercises) {
      const update = {
        ...exercise,
        target_url: '',
      };
      await Exercise.updateOne(
        { id: exercise.id },
        { $set: update },
        { upsert: true },
      );
    }
    console.log(
      `✅ Upserted ${editorExercises.length} coding workspace exercises.`,
    );

    console.log('\n✨ Seeding complete! Project is ready for production.');
    process.exit(0);
  } catch (err: unknown) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

void seed();
