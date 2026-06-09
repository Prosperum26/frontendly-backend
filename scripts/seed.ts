import * as dotenv from 'dotenv';
import mongoose, { Schema } from 'mongoose';
import * as path from 'path';

import {
  MILESTONES,
  ROADMAPS,
  PRACTICES,
  THEORIES,
} from '../src/learning-path/seedFiles/data';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.DB_URI!;

// ── Lightweight schemas (no NestJS decorators needed) ────────────────────────

const StageSubSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    earnedStars: { type: Number, default: 0 },
  },
  { _id: false },
);

const MilestoneSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'completed'],
      default: 'locked',
    },
    icon: { type: String, default: '' },
    stages: { type: [StageSubSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const RoadmapSchema = new Schema(
  {
    skillId: { type: String, required: true, unique: true },
    skillTitle: { type: String, required: true },
    milestoneIds: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const ExerciseSchema = new Schema(
  {
    id: { type: String, required: true },
    level: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    boilerplateCode: {
      html: { type: String, default: '' },
      js: { type: String, default: '' },
    },
  },
  { _id: false },
);

const LpExerciseSchema = new Schema(
  {
    stageId: { type: String, required: true, unique: true },
    exercises: { type: [ExerciseSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const TheorySchema = new Schema(
  {
    stageId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    videoUrl: { type: String, default: '' },
    contentHtml: { type: String, default: '' },
    proTips: { type: String, default: '' },
    referenceLinks: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'doc' },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

const Milestone = mongoose.model('Milestone', MilestoneSchema);
const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
const LpExercise = mongoose.model('LpExercise', LpExerciseSchema);
const Theory = mongoose.model('Theory', TheorySchema);

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log(`Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // Upsert milestones
  console.log('Seeding Milestones...');
  for (const data of MILESTONES) {
    await Milestone.findOneAndUpdate({ id: data.id }, data, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    });
    console.log(`  ✓ Milestone "${data.title}" (${data.id})`);
  }

  // Upsert roadmap
  console.log('\nSeeding Roadmap...');
  for (const roadmap of ROADMAPS) {
    await Roadmap.findOneAndUpdate({ skillId: roadmap.skillId }, roadmap, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    });
    console.log(`  ✓ Roadmap skillId="${roadmap.skillId}"`);
  }

  // Upsert practices/exercises
  console.log('\nSeeding Practices (LpExercise)...');
  for (const [stageId, practice] of Object.entries(PRACTICES)) {
    await LpExercise.findOneAndUpdate(
      { stageId: practice.stageId },
      { stageId: practice.stageId, exercises: practice.exercises },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    );
    console.log(
      `  ✓ Practice for stage "${stageId}" (${practice.exercises.length} exercises)`,
    );
  }

  // Upsert theories
  console.log('\nSeeding Theories...');
  for (const [stageId, theory] of Object.entries(THEORIES)) {
    await Theory.findOneAndUpdate({ stageId: theory.stageId }, theory, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    });
    console.log(`  ✓ Theory for stage "${stageId}" (${theory.title})`);
  }

  console.log('\nSeeding complete.');
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
