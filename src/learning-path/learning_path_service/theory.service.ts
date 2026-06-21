import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { stageIdToCanonicalLessonId } from './canonical-utils';
import { Exercise } from '../../editor/db_schemas/exercise_schema';
import { CanonicalMap } from '../../entrance-test/db_schemas/canonical-map.schema';
import { CourseTheory } from '../../entrance-test/db_schemas/course-theory.schema';
import {
  TheoryData,
  TheoryLesson,
  TheoryMilestone,
  ExerciseData,
  CanonicalMapData,
} from '../../entrance-test/entrance-test.types';
import { TheoryDocument } from '../db_schemas/theory_schema';

@Injectable()
export class TheoryService {
  constructor(
    @InjectModel(CourseTheory.name)
    private readonly courseTheoryModel: Model<CourseTheory>,
    @InjectModel(CanonicalMap.name)
    private readonly canonicalMapModel: Model<CanonicalMap>,
    @InjectModel('Theory') private readonly theoryModel: Model<TheoryDocument>,
    @InjectModel('Exercise')
    private readonly exerciseModel: Model<typeof Exercise>,
  ) {}

  async getTheory(stageId: string): Promise<{
    stageId: string;
    title: string;
    contentHtml: string;
    proTips: string;
    videoUrl: string;
    referenceLinks: Array<{
      title: string;
      url: string;
      type: 'doc' | 'video';
    }>;
  }> {
    const legacyTheory = await this.theoryModel
      .findOne({ stageId })
      .lean()
      .exec();
    if (legacyTheory) {
      return {
        stageId: legacyTheory.stageId,
        title: legacyTheory.title,
        contentHtml: legacyTheory.contentHtml,
        proTips: legacyTheory.proTips,
        videoUrl: legacyTheory.videoUrl,
        referenceLinks: legacyTheory.referenceLinks,
      };
    }

    const canonicalData = <CanonicalMapData>(
      await this.canonicalMapModel.findOne().lean().exec()
    );
    const canonicalLessonId = stageIdToCanonicalLessonId(
      stageId,
      canonicalData,
    );
    if (!canonicalLessonId) {
      throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    }

    const theoryByLesson = await this.getTheoryByLesson(canonicalLessonId);
    if (!theoryByLesson) {
      throw new NotFoundException(`Theory not found for stage: ${stageId}`);
    }

    const { lesson } = theoryByLesson;
    return {
      stageId,
      title: lesson.title,
      contentHtml: lesson.sections
        .map(
          s => `
          <section>
            <h2>${s.heading}</h2>
            <p>${s.content}</p>
            ${s.code ? `<pre><code>${s.code}</code></pre>` : ''}
          </section>
        `,
        )
        .join(''),
      proTips: lesson.keyTakeaways.join(' • '),
      videoUrl: '',
      referenceLinks: [
        { title: 'React Documentation', url: 'https://react.dev', type: 'doc' },
      ],
    };
  }

  async getTheoryByLesson(lessonId: string): Promise<{
    lesson: TheoryLesson;
    relatedExercises: ExerciseData[];
  } | null> {
    const theoryData = <TheoryData>(
      await this.courseTheoryModel.findOne().lean().exec()
    );
    for (const milestone of theoryData.milestones) {
      for (const lesson of milestone.lessons) {
        if (lesson.lessonId === lessonId) {
          const relatedExercises = <ExerciseData[]>await this.exerciseModel
            .find({ id: { $in: lesson.relatedExerciseIds } })
            .lean()
            .exec();
          return { lesson, relatedExercises };
        }
      }
    }
    return null;
  }

  async getMilestoneOverview(
    milestoneId: string,
  ): Promise<TheoryMilestone | null> {
    const theoryData = <TheoryData>(
      await this.courseTheoryModel.findOne().lean().exec()
    );
    return (
      theoryData.milestones.find(m => m.milestoneId === milestoneId) || null
    );
  }
}
