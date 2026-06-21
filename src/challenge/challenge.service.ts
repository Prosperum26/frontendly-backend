import { Injectable } from '@nestjs/common';

import { ChallengeExercise } from './challenge.types';

const CHALLENGES: ChallengeExercise[] = [
  {
    id: 'exercise_s1',
    title: 'Semantic HTML Starter',
    description:
      'Build a clear page structure with headings, content sections, and useful labels.',
    difficulty: 'easy',
    tags: ['HTML', 'Semantics'],
    previewImage:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=520&fit=crop',
  },
  {
    id: 'exercise_s3',
    title: 'Responsive Card Layout',
    description:
      'Create a responsive card grid using modern CSS layout primitives.',
    difficulty: 'medium',
    tags: ['CSS', 'Grid', 'Responsive'],
    previewImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=520&fit=crop',
  },
  {
    id: 'exercise_s7',
    title: 'Interactive React Component',
    description:
      'Practice JSX, props, and state with a reusable interactive component.',
    difficulty: 'hard',
    tags: ['React', 'JSX', 'State'],
    previewImage:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=520&fit=crop',
  },
];

@Injectable()
export class ChallengeService {
  getExercises(): ChallengeExercise[] {
    return CHALLENGES;
  }
}
