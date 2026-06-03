import { Milestone } from '@/learning-path/types/learning-path.types';

export const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'React Fundamentals',
    icon: 'react',
    status: 'completed',
    stages: [
      {
        id: 's1',
        title: '1. Introduction to React',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 's2',
        title: '2. JSX & Components',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 's3',
        title: '3. Props & State',
        isCompleted: true,
        earnedStars: 3,
      },
      {
        id: 's4',
        title: '4. Event Handling',
        isCompleted: true,
        earnedStars: 3,
      },
    ],
  },
  {
    id: 'm2',
    title: 'React Hooks & State Management',
    icon: 'hooks',
    status: 'in_progress',
    stages: [
      {
        id: 's5',
        title: '1. useState & useEffect',
        isCompleted: true,
        earnedStars: 2,
      },
      {
        id: 's6',
        title: '2. Custom Hooks',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's7',
        title: '3. Context API',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's8',
        title: '4. useReducer',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
  {
    id: 'm3',
    title: 'Advanced React Patterns',
    icon: 'advanced',
    status: 'locked',
    stages: [
      {
        id: 's9',
        title: '1. Component Composition',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's10',
        title: '2. Performance Optimization',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's11',
        title: '3. Custom Patterns',
        isCompleted: false,
        earnedStars: 0,
      },
      {
        id: 's12',
        title: '4. Testing React Components',
        isCompleted: false,
        earnedStars: 0,
      },
    ],
  },
];
