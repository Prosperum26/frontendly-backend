const DUMMY_ROADMAP = {
  skillId: 'frontend',
  skillTitle: 'Frontend Learning Path',
  userProgress: { currentXp: 2450, streakDays: 12 },
  milestones: [
    {
      id: 'm1',
      title: 'Frontend Mastery Foundations',
      icon: 'foundation',
      status: <const>'completed',
      stages: [
        {
          id: 's1',
          title: '1. Semantic HTML',
          isCompleted: true,
          earnedStars: 3,
        },
        {
          id: 's2',
          title: '2. CSS Selectors',
          isCompleted: true,
          earnedStars: 3,
        },
        {
          id: 's3',
          title: '3. The Box Model',
          isCompleted: true,
          earnedStars: 3,
        },
        {
          id: 's4',
          title: '4. Layout Flexbox',
          isCompleted: true,
          earnedStars: 3,
        },
      ],
    },
    {
      id: 'm2',
      title: 'Modern UI Architecture',
      icon: 'architecture',
      status: <const>'in_progress',
      stages: [
        {
          id: 's5',
          title: '1. Advanced CSS Grid',
          isCompleted: true,
          earnedStars: 2,
        },
        {
          id: 's6',
          title: '2. Relative Layouts',
          isCompleted: false,
          earnedStars: 0,
        },
        {
          id: 's7',
          title: '3. Interaction Motion',
          isCompleted: false,
          earnedStars: 0,
        },
        {
          id: 's8',
          title: '4. Responsive Design',
          isCompleted: false,
          earnedStars: 0,
        },
      ],
    },
    {
      id: 'm3',
      title: 'Dynamic DOM Manipulation',
      icon: 'dom',
      status: <const>'locked',
      stages: [
        {
          id: 's9',
          title: '1. DOM Tree Access',
          isCompleted: false,
          earnedStars: 0,
        },
        {
          id: 's10',
          title: '2. Event Handling',
          isCompleted: false,
          earnedStars: 0,
        },
        {
          id: 's11',
          title: '3. Element Creation',
          isCompleted: false,
          earnedStars: 0,
        },
        {
          id: 's12',
          title: '4. Async Data Logic',
          isCompleted: false,
          earnedStars: 0,
        },
      ],
    },
  ],
};

const DUMMY_THEORIES: Record<string, object> = {
  s5: {
    stageId: 's5',
    title: 'Advanced CSS Grid',
    videoUrl: '',
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
      {
        title: 'CSS Grid Garden (Interactive)',
        url: 'https://cssgridgarden.com/',
        type: 'doc',
      },
    ],
  },
  s6: {
    stageId: 's6',
    title: 'Relative Layouts',
    videoUrl: '',
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
    videoUrl: '',
    contentHtml:
      '<h1>DOM Selector</h1><p>The Document Object Model (DOM) is a programming interface for web documents.</p>',
    proTips:
      'Use querySelectorAll instead of getElementsByClassName for more flexibility.',
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
        instruction:
          'Use display: grid and grid-template-columns to create a 3-column layout.',
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
        instruction:
          'Build a responsive image gallery using CSS Grid with auto-fill and minmax().',
        boilerplateCode: {
          html: '<div class="gallery">\n  <!-- Add gallery items -->\n</div>',
          js: '// Generate gallery items dynamically\nconst gallery = document.querySelector(".gallery");\n// Your code here',
        },
      },
    ],
  },
};

// ============================================================
// In-memory progress store (replaces DB when unavailable)
// ============================================================
export interface StageProgress {
  isPracticeUnlocked: boolean;
  earnedStars: number;
  isCompleted: boolean;
  theoryRead: boolean;
  videoWatchPercentage: number;
}

export interface UserProgress {
  currentXp: number;
  streakDays: number;
  lastStreakDate: string | null;
  badges: string[];
  lastActiveStageId: string | null;
  lastActiveMilestoneId: string | null;
  stages: Record<string, StageProgress>;
}

const DEFAULT_PROGRESS: UserProgress = {
  currentXp: 2450,
  streakDays: 12,
  lastStreakDate: null,
  badges: ['s1', 's2', 's3', 's4'],
  lastActiveStageId: 's5',
  lastActiveMilestoneId: 'm2',
  stages: {
    s1: {
      isPracticeUnlocked: true,
      earnedStars: 3,
      isCompleted: true,
      theoryRead: true,
      videoWatchPercentage: 100,
    },
    s2: {
      isPracticeUnlocked: true,
      earnedStars: 3,
      isCompleted: true,
      theoryRead: true,
      videoWatchPercentage: 100,
    },
    s3: {
      isPracticeUnlocked: true,
      earnedStars: 3,
      isCompleted: true,
      theoryRead: true,
      videoWatchPercentage: 100,
    },
    s4: {
      isPracticeUnlocked: true,
      earnedStars: 3,
      isCompleted: true,
      theoryRead: true,
      videoWatchPercentage: 100,
    },
    s5: {
      isPracticeUnlocked: false,
      earnedStars: 0,
      isCompleted: false,
      theoryRead: false,
      videoWatchPercentage: 0,
    },
    s6: {
      isPracticeUnlocked: false,
      earnedStars: 0,
      isCompleted: false,
      theoryRead: false,
      videoWatchPercentage: 0,
    },
    s7: {
      isPracticeUnlocked: false,
      earnedStars: 0,
      isCompleted: false,
      theoryRead: false,
      videoWatchPercentage: 0,
    },
    s8: {
      isPracticeUnlocked: false,
      earnedStars: 0,
      isCompleted: false,
      theoryRead: false,
      videoWatchPercentage: 0,
    },
    s9: {
      isPracticeUnlocked: false,
      earnedStars: 0,
      isCompleted: false,
      theoryRead: false,
      videoWatchPercentage: 0,
    },
  },
};

const userProgressStore = new Map<string, UserProgress>();

function getUserProgress(userId: string): UserProgress {
  if (!userProgressStore.has(userId)) {
    userProgressStore.set(
      userId,
      <UserProgress>JSON.parse(JSON.stringify(DEFAULT_PROGRESS)),
    );
  }
  return userProgressStore.get(userId)!;
}

const XP_REWARDS: Record<string, number> = {
  easy: 30,
  medium: 50,
  hard: 100,
  videoIntro: 20,
};

export {
  DUMMY_ROADMAP,
  DUMMY_THEORIES,
  DUMMY_PRACTICES,
  XP_REWARDS,
  userProgressStore,
  getUserProgress,
};
