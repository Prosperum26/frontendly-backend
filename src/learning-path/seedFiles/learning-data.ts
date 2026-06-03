const ROADMAPS = [
  {
    skillId: 'javascript',
    skillTitle: 'Frontend Learning Path',
    milestoneIds: ['m1', 'm2', 'm3'],
  },
];

const MILESTONES = [
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
];

const THEORIES: Record<string, object> = {
  s1: {
    stageId: 's1',
    title: 'Semantic HTML',
    videoUrl: '',
    contentHtml:
      '<h1>Semantic HTML</h1><p>Semantic HTML uses meaningful tags to describe content structure.</p><h2>Key Tags</h2><ul><li>&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;footer&gt;</li><li>&lt;article&gt;, &lt;section&gt;, &lt;aside&gt;</li></ul>',
    proTips: 'Use semantic tags to improve accessibility and SEO.',
    referenceLinks: [
      {
        title: 'MDN: Semantic HTML',
        url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
        type: 'doc',
      },
    ],
  },
  s2: {
    stageId: 's2',
    title: 'CSS Selectors',
    videoUrl: '',
    contentHtml:
      '<h1>CSS Selectors</h1><p>Selectors are used to select HTML elements to style.</p><h2>Types</h2><ul><li>Class selectors (.class)</li><li>ID selectors (#id)</li><li>Attribute selectors ([attr])</li></ul>',
    proTips:
      'Use class selectors for reusable styles and ID selectors for unique elements.',
    referenceLinks: [
      {
        title: 'MDN: CSS Selectors',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors',
        type: 'doc',
      },
    ],
  },
  s3: {
    stageId: 's3',
    title: 'The Box Model',
    videoUrl: '',
    contentHtml:
      '<h1>The Box Model</h1><p>Every HTML element is a box with content, padding, border, and margin.</p><h2>Components</h2><ul><li>Content: The actual content</li><li>Padding: Space around content</li><li>Border: Around padding</li><li>Margin: Space outside border</li></ul>',
    proTips: 'Use box-sizing: border-box for easier layout calculations.',
    referenceLinks: [
      {
        title: 'MDN: Box Model',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model',
        type: 'doc',
      },
    ],
  },
  s4: {
    stageId: 's4',
    title: 'Flexbox Layout',
    videoUrl: '',
    contentHtml:
      '<h1>Flexbox Layout</h1><p>Flexbox is a one-dimensional layout method for arranging items.</p><h2>Key Properties</h2><ul><li>display: flex</li><li>flex-direction</li><li>justify-content</li><li>align-items</li></ul>',
    proTips:
      'Use flexbox for one-dimensional layouts and grid for two-dimensional layouts.',
    referenceLinks: [
      {
        title: 'MDN: Flexbox',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout',
        type: 'doc',
      },
    ],
  },
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
  s7: {
    stageId: 's7',
    title: 'CSS Transitions & Animations',
    videoUrl: '',
    contentHtml:
      '<h1>CSS Transitions & Animations</h1><p>Create smooth visual effects with CSS transitions and keyframe animations.</p><h2>Transitions</h2><ul><li>transition-property</li><li>transition-duration</li><li>transition-timing-function</li></ul>',
    proTips:
      'Use transitions for simple state changes and animations for complex sequences.',
    referenceLinks: [
      {
        title: 'MDN: CSS Transitions',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions',
        type: 'doc',
      },
    ],
  },
  s8: {
    stageId: 's8',
    title: 'Responsive Design',
    videoUrl: '',
    contentHtml:
      '<h1>Responsive Design</h1><p>Responsive design ensures your website looks good on all devices.</p><h2>Key Techniques</h2><ul><li>Media queries</li><li>Flexible units (rem, em, %)</li><li>Flexible images</li></ul>',
    proTips: 'Design mobile-first for better performance and simpler code.',
    referenceLinks: [
      {
        title: 'MDN: Responsive Design',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
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
  s10: {
    stageId: 's10',
    title: 'Event Handling',
    videoUrl: '',
    contentHtml:
      '<h1>Event Handling</h1><p>Events are actions that occur in the browser, like clicks or key presses.</p><h2>Event Listeners</h2><ul><li>addEventListener()</li><li>Event object properties</li><li>Event delegation</li></ul>',
    proTips:
      'Use event delegation for dynamically added elements to improve performance.',
    referenceLinks: [
      {
        title: 'MDN: Event Reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Events',
        type: 'doc',
      },
    ],
  },
  s11: {
    stageId: 's11',
    title: 'DOM Manipulation',
    videoUrl: '',
    contentHtml:
      '<h1>DOM Manipulation</h1><p>JavaScript can dynamically change HTML elements, attributes, and styles.</p><h2>Key Methods</h2><ul><li>createElement()</li><li>appendChild()</li><li>remove()</li><li>cloneNode()</li></ul>',
    proTips: 'Use template literals for cleaner HTML string construction.',
    referenceLinks: [
      {
        title: 'MDN: DOM Manipulation',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents',
        type: 'doc',
      },
    ],
  },
  s12: {
    stageId: 's12',
    title: 'Async JavaScript',
    videoUrl: '',
    contentHtml:
      '<h1>Async JavaScript</h1><p>Handle asynchronous operations with Promises, async/await, and the Fetch API.</p><h2>Key Concepts</h2><ul><li>Promise</li><li>async/await</li><li>Fetch API</li><li>Error handling</li></ul>',
    proTips: 'Always use try/catch with async/await for proper error handling.',
    referenceLinks: [
      {
        title: 'MDN: Async JavaScript',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
        type: 'doc',
      },
    ],
  },
};

const PRACTICES: Record<string, object> = {};

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
  videoIntro: 50,
};

export {
  ROADMAPS,
  MILESTONES,
  THEORIES,
  PRACTICES,
  XP_REWARDS,
  userProgressStore,
  getUserProgress,
};
