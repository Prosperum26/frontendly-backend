import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Milestone,
  MilestoneDocument,
} from '../db_schemas/milestone_schema';
import {
  Theory,
  TheoryDocument,
} from '../db_schemas/theory_schema';
import {
  LpExercise,
  LpExerciseDocument,
  Roadmap,
  RoadmapDocument,
  UserLearningProgress,
  UserLearningProgressDocument,
} from '../db_schemas/learning_path_schemas';

// ============================================================
// DUMMY DATA — dùng tạm trước khi có DB thật
// Xóa/comment section này khi chuyển sang DB thực tế
// ============================================================
const DUMMY_ROADMAP = {
  skillId: 'frontend',
  skillTitle: 'Frontend Learning Path',
  userProgress: { currentXp: 2450, streakDays: 12 },
  milestones: [
    {
      id: 'm1',
      title: 'Frontend Mastery Foundations',
      status: 'completed' as const,
      stages: [
        { id: 's1', title: '1. Semantic HTML', isCompleted: true, earnedStars: 3 },
        { id: 's2', title: '2. CSS Selectors', isCompleted: true, earnedStars: 3 },
        { id: 's3', title: '3. The Box Model', isCompleted: true, earnedStars: 3 },
        { id: 's4', title: '4. Layout Flexbox', isCompleted: true, earnedStars: 3 },
      ],
    },
    {
      id: 'm2',
      title: 'Modern UI Architecture',
      status: 'in_progress' as const,
      stages: [
        { id: 's5', title: '1. Advanced CSS Grid', isCompleted: true, earnedStars: 2 },
        { id: 's6', title: '2. Relative Layouts', isCompleted: false, earnedStars: 0 },
        { id: 's7', title: '3. Interaction Motion', isCompleted: false, earnedStars: 0 },
        { id: 's8', title: '4. Responsive Design', isCompleted: false, earnedStars: 0 },
      ],
    },
    {
      id: 'm3',
      title: 'Dynamic DOM Manipulation',
      status: 'locked' as const,
      stages: [
        { id: 's9', title: '1. DOM Tree Access', isCompleted: false, earnedStars: 0 },
        { id: 's10', title: '2. Event Handling', isCompleted: false, earnedStars: 0 },
        { id: 's11', title: '3. Element Creation', isCompleted: false, earnedStars: 0 },
        { id: 's12', title: '4. Async Data Logic', isCompleted: false, earnedStars: 0 },
      ],
    },
  ],
};

const DUMMY_THEORIES: Record<string, object> = {
  s5: {
    stageId: 's5',
    title: 'Advanced CSS Grid',
    contentHtml:
      '<h1>Advanced CSS Grid</h1><p>CSS Grid Layout is a two-dimensional layout system for the web.</p><h2>Key Concepts</h2><ul><li>Grid Container & Grid Items</li><li>grid-template-columns / grid-template-rows</li><li>grid-area & named grid lines</li></ul>',
    proTips:
      'Use grid-template-areas for complex layouts — it makes your CSS much more readable.',
    referenceLinks: [
      {
        title: 'MDN: CSS Grid Layout',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
        type: 'doc',
      },
      { title: 'CSS Grid Garden (Interactive)', url: 'https://cssgridgarden.com/', type: 'doc' },
    ],
  },
  s6: {
    stageId: 's6',
    title: 'Relative Layouts',
    contentHtml:
      '<h1>Relative Layouts</h1><p>Understanding position: relative, absolute, fixed and sticky is crucial for precise element placement.</p>',
    proTips:
      'Always set position: relative on a parent container before using position: absolute on child elements.',
    referenceLinks: [
      {
        title: 'MDN: CSS Position',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position',
        type: 'doc',
      },
    ],
  },
  s9: {
    stageId: 's9',
    title: 'DOM Tree Access',
    contentHtml:
      '<h1>DOM Selector</h1><p>The Document Object Model (DOM) is a programming interface for web documents.</p>',
    proTips: 'Use querySelectorAll instead of getElementsByClassName for more flexibility.',
    referenceLinks: [
      {
        title: 'MDN: Introduction to the DOM',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction',
        type: 'doc',
      },
    ],
  },
};

const DUMMY_PRACTICES: Record<string, object> = {
  s5: {
    stageId: 's5',
    exercises: [
      {
        id: 'ex_s5_1',
        level: 'easy',
        title: 'Create a simple grid',
        instruction: 'Use display: grid and grid-template-columns to create a 3-column layout.',
        boilerplateCode: {
          html: '<div class="grid-container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
          js: '// No JS needed for this exercise',
        },
      },
      {
        id: 'ex_s5_2',
        level: 'medium',
        title: 'Grid with named areas',
        instruction:
          'Create a page layout using grid-template-areas with header, sidebar, main, and footer.',
        boilerplateCode: {
          html: '<div class="page">\n  <header>Header</header>\n  <nav>Sidebar</nav>\n  <main>Main</main>\n  <footer>Footer</footer>\n</div>',
          js: '// No JS needed for this exercise',
        },
      },
      {
        id: 'ex_s5_3',
        level: 'hard',
        title: 'Responsive grid gallery',
        instruction: 'Build a responsive image gallery using CSS Grid with auto-fill and minmax().',
        boilerplateCode: {
          html: '<div class="gallery">\n  <!-- Add gallery items -->\n</div>',
          js: '// Generate gallery items dynamically\nconst gallery = document.querySelector(".gallery");\n// Your code here',
        },
      },
    ],
  },
};

// Lưu trạng thái unlock trong memory (tạm thời, thay bằng DB sau)
const unlockState: Record<string, boolean> = {
  s1: true, s2: true, s3: true, s4: true,
  s5: true,
  s6: false, s7: false, s8: false,
  s9: false, s10: false, s11: false, s12: false,
};

// ============================================================

@Injectable()
export class LearningPathService {
  constructor(
    @InjectModel('Milestone')
    private readonly milestoneModel: Model<MilestoneDocument>,
    @InjectModel('Theory')
    private readonly theoryModel: Model<TheoryDocument>,
    @InjectModel('LpExercise')
    private readonly lpExerciseModel: Model<LpExerciseDocument>,
    @InjectModel('Roadmap')
    private readonly roadmapModel: Model<RoadmapDocument>,
    @InjectModel('UserLearningProgress')
    private readonly userProgressModel: Model<UserLearningProgressDocument>,
  ) {}

  // -----------------------------------------------------------
  // API 1: GET /api/v1/roadmaps/:skillId
  // -----------------------------------------------------------
  async getRoadmap(skillId: string, page: number = 1, limit: number = 5) {
    // TODO: Khi có DB thật, uncomment đoạn dưới và xóa DUMMY data
    // const roadmap = await this.roadmapModel.findOne({ skillId }).lean();
    // if (!roadmap) throw new NotFoundException(`Roadmap not found: ${skillId}`);
    // ...

    // Dùng dummy data tạm thời
    if (skillId !== 'frontend') {
      throw new NotFoundException(`Roadmap not found for skill: ${skillId}`);
    }

    const allMilestones = DUMMY_ROADMAP.milestones;
    const startIndex = (page - 1) * limit;
    const paginatedMilestones = allMilestones.slice(startIndex, startIndex + limit);

    return {
      skillId: DUMMY_ROADMAP.skillId,
      skillTitle: DUMMY_ROADMAP.skillTitle,
      userProgress: DUMMY_ROADMAP.userProgress,
      milestones: paginatedMilestones,
      pagination: {
        currentPage: page,
        limit,
        totalItems: allMilestones.length,
        totalPages: Math.ceil(allMilestones.length / limit),
      },
    };
  }

  // -----------------------------------------------------------
  // API 2: GET /api/v1/stages/:stageId/theory
  // -----------------------------------------------------------
  async getTheory(stageId: string) {
    // TODO: Khi có DB thật:
    // const theory = await this.theoryModel.findOne({ stageId }).lean();
    // if (!theory) throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    // return theory;

    const theory = DUMMY_THEORIES[stageId];
    if (!theory) {
      throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    }
    return theory;
  }

  // -----------------------------------------------------------
  // API 3: PATCH /api/v1/stages/:stageId/unlock-practice
  // -----------------------------------------------------------
  async unlockPractice(stageId: string) {
    // TODO: Khi có DB thật:
    // await this.userProgressModel.updateOne(
    //   { userId, 'unlockedStages.stageId': stageId },
    //   { $set: { 'unlockedStages.$.isPracticeUnlocked': true } },
    //   { upsert: true },
    // );

    unlockState[stageId] = true;
    return { stageId, isPracticeUnlocked: true };
  }

  // -----------------------------------------------------------
  // API 4: GET /api/v1/stages/:stageId/practices
  // -----------------------------------------------------------
  async getPractices(stageId: string) {
    // TODO: Khi có DB thật:
    // const exercises = await this.lpExerciseModel.find({ stageId }).lean();
    // return { stageId, exercises };

    const practices = DUMMY_PRACTICES[stageId];
    if (!practices) {
      throw new NotFoundException(`Practices not found for stage: ${stageId}`);
    }
    return practices;
  }

  // -----------------------------------------------------------
  // API 5: POST /api/v1/exercises/:exerciseId/submit
  // -----------------------------------------------------------
  async submitCode(
    exerciseId: string,
    submittedCode: { html: string; js: string },
  ) {
    // TODO: Khi có DB thật — chạy judge engine thật
    // Hiện tại: mock luôn trả về passed
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.log(`Received submission for exerciseId=${exerciseId}`, submittedCode);

    return {
      status: 'passed',
      feedback: 'Chính xác! Test case đã vượt qua.',
      xpEarned: 50,
      stageUpdates: {
        stageId: exerciseId.split('_')[1] || 's1',
        totalEarnedStars: 1,
        isStageCompleted: false,
      },
    };
  }
}
