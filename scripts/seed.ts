import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose, { Schema } from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI =
  process.env.DB_URI ?? 'mongodb://localhost:27017/frontendly';

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

const Milestone = mongoose.model('Milestone', MilestoneSchema);
const Roadmap = mongoose.model('Roadmap', RoadmapSchema);

// ── Seed data ─────────────────────────────────────────────────────────────────

const MILESTONES = [
  {
    id: 'milestone-js-001',
    title: 'JavaScript Fundamentals',
    status: 'in_progress',
    icon: 'foundation',
    stages: [
      { id: 'stage-js-001', title: '1. Variables & Data Types', icon: 'foundation', isCompleted: false, earnedStars: 0 },
      { id: 'stage-js-002', title: '2. Operators & Expressions', icon: 'foundation', isCompleted: false, earnedStars: 0 },
      { id: 'stage-js-003', title: '3. Control Flow', icon: 'foundation', isCompleted: false, earnedStars: 0 },
    ],
  },
  {
    id: 'milestone-js-002',
    title: 'Functions & Scope',
    status: 'locked',
    icon: 'code',
    stages: [
      { id: 'stage-js-004', title: '1. Function Declarations', icon: 'code', isCompleted: false, earnedStars: 0 },
      { id: 'stage-js-005', title: '2. Arrow Functions', icon: 'code', isCompleted: false, earnedStars: 0 },
      { id: 'stage-js-006', title: '3. Closures & Scope', icon: 'code', isCompleted: false, earnedStars: 0 },
    ],
  },
  {
    id: 'milestone-js-003',
    title: 'Arrays & Objects',
    status: 'locked',
    icon: 'array',
    stages: [
      { id: 'stage-js-007', title: '1. Array Methods', icon: 'array', isCompleted: false, earnedStars: 0 },
      { id: 'stage-js-008', title: '2. Object Destructuring', icon: 'array', isCompleted: false, earnedStars: 0 },
    ],
  },
];

const ROADMAP = {
  skillId: 'javascript',
  skillTitle: 'JavaScript',
  milestoneIds: MILESTONES.map((m) => m.id),
};

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log(`Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // Upsert milestones
  for (const data of MILESTONES) {
    await Milestone.findOneAndUpdate({ id: data.id }, data, {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    });
    console.log(`  ✓ Milestone "${data.title}" (${data.id})`);
  }

  // Upsert roadmap
  await Roadmap.findOneAndUpdate({ skillId: ROADMAP.skillId }, ROADMAP, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
  });
  console.log(`  ✓ Roadmap skillId="${ROADMAP.skillId}"`);

  console.log('\nSeeding complete.');
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
