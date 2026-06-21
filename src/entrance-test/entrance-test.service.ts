import { Injectable } from '@nestjs/common';

import {
  EntranceTestQuestion,
  EntranceTestResult,
} from './entrance-test.types';

interface ScoredEntranceTestQuestion extends EntranceTestQuestion {
  correctAnswer: string | string[];
}

const QUESTIONS: ScoredEntranceTestQuestion[] = [
  {
    id: 'html-semantics',
    question: 'Which element should wrap the primary page navigation?',
    type: 'single-choice',
    options: ['nav', 'section', 'article', 'aside'],
    correctAnswer: 'nav',
  },
  {
    id: 'css-layout',
    question:
      'Which CSS feature is best suited for a two-dimensional page layout?',
    type: 'single-choice',
    options: ['CSS Grid', 'line-height', 'z-index', 'text-transform'],
    correctAnswer: 'CSS Grid',
  },
  {
    id: 'js-state',
    question:
      'Which array method returns a new array after transforming every item?',
    type: 'single-choice',
    options: ['map', 'push', 'splice', 'sort'],
    correctAnswer: 'map',
  },
  {
    id: 'react-props',
    question:
      'In React, what is the usual way to pass data from a parent to a child component?',
    type: 'single-choice',
    options: ['Props', 'Cookies', 'LocalStorage', 'DOM attributes only'],
    correctAnswer: 'Props',
  },
];

@Injectable()
export class EntranceTestService {
  getQuestions(): EntranceTestQuestion[] {
    return QUESTIONS.map(question => ({
      id: question.id,
      question: question.question,
      type: question.type,
      options: question.options,
      starterCode: question.starterCode,
    }));
  }

  submit(answers: Record<string, unknown>): EntranceTestResult {
    const score = QUESTIONS.reduce((total, question) => {
      const answer = answers[question.id];
      if (Array.isArray(question.correctAnswer)) {
        return question.correctAnswer.includes(String(answer))
          ? total + 1
          : total;
      }
      return answer === question.correctAnswer ? total + 1 : total;
    }, 0);

    return {
      skipToMilestoneId: score / QUESTIONS.length >= 0.75 ? 'm2' : 'm1',
      skillId: 'frontend',
      score,
      totalQuestions: QUESTIONS.length,
    };
  }
}
