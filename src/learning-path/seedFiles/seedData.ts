import 'dotenv/config';
import mongoose from 'mongoose';

import { ROADMAPS, MILESTONES, THEORIES } from './learning-data';

interface RoadmapData {
  skillId: string;
  skillTitle: string;
  milestoneIds: string[];
}

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

const Roadmap = mongoose.model('Roadmap', RoadmapSchema, 'roadmaps');
const Milestone = mongoose.model('Milestone', MilestoneSchema, 'milestones');
const Theory = mongoose.model('Theory', TheorySchema, 'theories');

async function seed(): Promise<void> {
  const uri = process.env.DB_URI || 'mongodb://localhost:27017/frontendly';

  // eslint-disable-next-line no-console
  console.log(`Connecting to MongoDB at ${uri} …`);
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log('Connected.\n');

  let roadmapCount = 0;
  for (const roadmap of <RoadmapData[]>ROADMAPS) {
    await Roadmap.updateOne(
      { skillId: roadmap.skillId },
      {
        $set: {
          skillId: roadmap.skillId,
          skillTitle: roadmap.skillTitle,
          milestoneIds: roadmap.milestoneIds,
        },
      },
      { upsert: true },
    );
    roadmapCount += 1;
    // eslint-disable-next-line no-console
    console.log(
      `Roadmap "${roadmap.skillId}" — milestoneIds: ${roadmap.milestoneIds.join(', ')}`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(`Roadmaps — upserted ${roadmapCount} documents\n`);

  let milestoneCount = 0;
  for (const m of MILESTONES) {
    const stages = m.stages.map((s: any) => ({
      id: s.id,
      title: s.title,
      isCompleted: s.isCompleted,
      earnedStars: s.earnedStars,
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

  const theories = Object.values(THEORIES);
  let theoryCount = 0;
  for (const t of <any[]>theories) {
    await Theory.updateOne(
      { stageId: t.stageId },
      { $set: t },
      { upsert: true },
    );
    theoryCount += 1;
    // eslint-disable-next-line no-console
    console.log(`Theory "${t.stageId}" — "${t.title}"`);
  }
  // eslint-disable-next-line no-console
  console.log(`Theories  — upserted ${theoryCount} documents\n`);

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
