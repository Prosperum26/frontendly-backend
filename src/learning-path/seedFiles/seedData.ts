import mongoose from 'mongoose';

import {
  DUMMY_ROADMAP,
  DUMMY_THEORIES,
  DUMMY_PRACTICES,
} from '../learning_path_service/dummy-data';

const StageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    earnedStars: { type: Number, default: 0 },
  },
  { _id: false },
);

const MilestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'completed'],
      default: 'locked',
    },
    icon: { type: String, default: '' },
    stages: { type: [StageSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const RoadmapSchema = new mongoose.Schema(
  {
    skillId: { type: String, required: true, unique: true },
    skillTitle: { type: String, required: true },
    milestoneIds: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const ReferenceLinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['doc', 'video'], default: 'doc' },
  },
  { _id: false },
);

const TheorySchema = new mongoose.Schema(
  {
    stageId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    contentHtml: { type: String, required: true },
    proTips: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    referenceLinks: { type: [ReferenceLinkSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const BoilerplateCodeSchema = new mongoose.Schema(
  {
    html: { type: String, default: '' },
    js: { type: String, default: '' },
  },
  { _id: false },
);

const LpExerciseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    stageId: { type: String, required: true },
    level: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    boilerplateCode: { type: BoilerplateCodeSchema, default: {} },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const Roadmap = mongoose.model('Roadmap', RoadmapSchema, 'roadmaps');
const Milestone = mongoose.model('Milestone', MilestoneSchema, 'milestones');
const Theory = mongoose.model('Theory', TheorySchema, 'theories');
const LpExercise = mongoose.model(
  'LpExercise',
  LpExerciseSchema,
  'lpexercises',
);

async function seed(): Promise<void> {
  const uri = process.env.DB_URI || 'mongodb://localhost:27017/frontendly';

  // eslint-disable-next-line no-console
  console.log(`Connecting to MongoDB at ${uri} …`);
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log('Connected.\n');

  const milestoneIds = DUMMY_ROADMAP.milestones.map(m => m.id);

  await Roadmap.updateOne(
    { skillId: 'frontend' },
    {
      $set: {
        skillId: 'frontend',
        skillTitle: 'Frontend Learning Path',
        milestoneIds,
      },
    },
    { upsert: true },
  );
  // eslint-disable-next-line no-console
  console.log(
    `Roadmap  — upserted 1 document  (milestoneIds: ${milestoneIds.join(', ')})`,
  );

  let milestoneCount = 0;
  for (const m of DUMMY_ROADMAP.milestones) {
    const stages = m.stages.map(s => ({
      id: s.id,
      title: s.title,
      isCompleted: false,
      earnedStars: 0,
    }));

    await Milestone.updateOne(
      { id: m.id },
      {
        $set: {
          id: m.id,
          title: m.title,
          status: m.status,
          stages,
        },
      },
      { upsert: true },
    );
    milestoneCount += 1;
    // eslint-disable-next-line no-console
    console.log(`Milestone "${m.id}" — ${stages.length} stages`);
  }
  // eslint-disable-next-line no-console
  console.log(`Milestones — upserted ${milestoneCount} documents\n`);

  // 3. Seed theories ────────────────────────────────────────────────────────
  const theories = Object.values(DUMMY_THEORIES);
  let theoryCount = 0;
  for (const t of <any[]>theories) {
    await Theory.updateOne(
      { stageId: t.stageId },
      { $set: t },
      { upsert: true },
    );
    theoryCount += 1;
    // eslint-disable-next-line no-console
    console.log(`  📖 Theory "${t.stageId}" — "${t.title}"`);
  }
  // eslint-disable-next-line no-console
  console.log(`📌 Theories  — upserted ${theoryCount} documents\n`);

  // 4. Seed exercises ───────────────────────────────────────────────────────
  let exerciseCount = 0;
  for (const [stageId, practice] of Object.entries(DUMMY_PRACTICES)) {
    const exercises = (<any>practice).exercises ?? [];
    for (const ex of exercises) {
      await LpExercise.updateOne(
        { id: ex.id },
        {
          $set: {
            id: ex.id,
            stageId,
            level: ex.level,
            title: ex.title,
            instruction: ex.instruction,
            boilerplateCode: ex.boilerplateCode ?? {},
          },
        },
        { upsert: true },
      );
      exerciseCount += 1;
      // eslint-disable-next-line no-console
      console.log(`Exercise "${ex.id}" (${stageId} / ${ex.level})`);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Exercises — upserted ${exerciseCount} documents\n`);

  // eslint-disable-next-line no-console
  console.log('Seeding complete!');
  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log('Disconnected from MongoDB.');
  process.exit(0);
}

seed().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
