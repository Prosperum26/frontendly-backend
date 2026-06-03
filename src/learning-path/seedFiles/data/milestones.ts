import { Milestone } from '@/learning-path/types/learning-path.types';

export const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'Frontend Mastery Foundations',
    icon: 'foundation',
    status: 'completed',
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
    status: 'in_progress',
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
    status: 'locked',
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
  {
    id: 'bm1',
    title: 'Backend Foundations',
    icon: 'server',
    status: 'completed',
    stages: [
      {
        id: 'bs1',
        title: '1. Node.js Basics',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 'bs2',
        title: '2. npm & Package Management',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 'bs3',
        title: '3. CommonJS Modules',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 'bs4',
        title: '4. Event Loop',
        isCompleted: true,
        earnedStars: 3,
      },
    ],
  },
  {
    id: 'bm2',
    title: 'Express Framework',
    icon: 'express',
    status: 'in_progress',
    stages: [
      {
        id: 'bs5',
        title: '1. Express Setup & Routing',
        isCompleted: true,
        earnedStars: 2,
      },
      {
        id: 'bs6',
        title: '2. Middleware',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs7',
        title: '3. Request & Response',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs8',
        title: '4. Error Handling',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'bm3',
    title: 'Database Integration',
    icon: 'database',
    status: 'locked',
    stages: [
      {
        id: 'bs9',
        title: '1. MongoDB Basics',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs10',
        title: '2. Mongoose ODM',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs11',
        title: '3. CRUD Operations',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs12',
        title: '4. Data Validation',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'bm4',
    title: 'Authentication & Security',
    icon: 'security',
    status: 'locked',
    stages: [
      {
        id: 'bs13',
        title: '1. JWT Authentication',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs14',
        title: '2. Password Hashing',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs15',
        title: '3. Authorization',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 'bs16',
        title: '4. Security Best Practices',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
];
