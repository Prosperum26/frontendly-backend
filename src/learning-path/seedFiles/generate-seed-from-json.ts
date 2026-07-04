import * as fs from 'fs';
import * as path from 'path';

interface Topic {
  title: string;
  content: string;
  code: string;
}

interface Lesson {
  lesson_no: number;
  title: string;
  topics: Topic[];
}

interface MilestoneJson {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseJson {
  course_name: string;
  milestones: MilestoneJson[];
}

const MILESTONE_ICONS = <const>['react', 'layout', 'hooks'];
const MILESTONE_STATUS = <const>['in_progress', 'locked', 'locked'];
const PRACTICE_FOCUS: Record<number, string> = {
  1: 'what React is and how it renders UI',
  2: 'createRoot and rendering into a DOM container',
  3: 'JSX syntax, expressions, and element rules',
  4: 'JavaScript expressions inside JSX markup',
  5: 'JSX attributes such as className and style',
  6: 'inline styles and external CSS in React',
  7: 'locally scoped CSS Modules in React',
  8: 'conditional rendering with if/ternary patterns',
  9: 'function components and component composition',
  10: 'passing and reading props in components',
  11: 'destructuring props and default values',
  12: 'useState for reactive component state',
};

const MEDIUM_BOILERPLATE_JS = [
  "import { useState } from 'react';",
  '',
  'function App() {',
  '  const [active, setActive] = useState(false);',
  '',
  '  return (',
  '    <button type="button" onClick={() => setActive(!active)}>',
  "      {active ? 'Active' : 'Inactive'}",
  '    </button>',
  '  );',
  '}',
  '',
  'export default App;',
].join('\n');

const HARD_BOILERPLATE_JS = [
  "const items = ['Learn', 'Practice', 'Complete'];",
  '',
  'function App() {',
  '  return (',
  '    <main>',
  '      {items.map((item) => (',
  '        <article key={item}>{item}</article>',
  '      ))}',
  '    </main>',
  '  );',
  '}',
  '',
  'export default App;',
].join('\n');

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildContentHtml(lessonTitle: string, topics: Topic[]): string {
  const sections = topics
    .map(topic => {
      let block = `<h2>${escapeHtml(topic.title)}</h2><p>${escapeHtml(topic.content)}</p>`;
      if (topic.code?.trim()) {
        block += `<pre><code>${escapeHtml(topic.code.trim())}</code></pre>`;
      }
      return block;
    })
    .join('');

  return `<h1>${escapeHtml(lessonTitle)}</h1>${sections}`;
}

function buildProTips(lessonTitle: string, topics: Topic[]): string {
  const first = topics[0]?.title ?? lessonTitle;
  return `Focus on "${first}" before moving to practice — apply each concept in a small React component.`;
}

function reactDocLinks(
  lessonTitle: string,
): Array<{ title: string; url: string; type: string }> {
  return [
    {
      title: 'React Documentation',
      url: 'https://react.dev/learn',
      type: 'doc',
    },
    {
      title: `MDN: ${lessonTitle}`,
      url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started',
      type: 'doc',
    },
  ];
}

function serializeValue(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const innerItems = value
      .map(item => `${padInner}${serializeValue(item, indent + 1)},`)
      .join('\n');
    return `[\n${innerItems}\n${pad}]`;
  }
  const entries = Object.entries(<Record<string, unknown>>value);
  if (entries.length === 0) return '{}';
  return `{\n${entries
    .map(([key, val]) => {
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : JSON.stringify(key);
      return `${padInner}${keyStr}: ${serializeValue(val, indent + 1)},`;
    })
    .join('\n')}\n${pad}}`;
}

function main(): void {
  const dataDir = path.join(__dirname, 'data');
  const jsonPath = path.join(dataDir, 'learning-path-data.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const course = <CourseJson>JSON.parse(raw);

  let stageCounter = 0;
  const milestones: object[] = [];
  const theories: Record<string, object> = {};
  const practices: Record<string, object> = {};

  course.milestones.forEach((milestone, mIndex) => {
    const milestoneId = `m${milestone.id}`;
    const stages = milestone.lessons.map(lesson => {
      stageCounter += 1;
      const stageId = `s${stageCounter}`;

      theories[stageId] = {
        stageId,
        title: lesson.title,
        videoUrl: '',
        contentHtml: buildContentHtml(lesson.title, lesson.topics),
        proTips: buildProTips(lesson.title, lesson.topics),
        referenceLinks: reactDocLinks(lesson.title),
      };

      const focus = PRACTICE_FOCUS[stageCounter] ?? lesson.title.toLowerCase();
      practices[stageId] = {
        stageId,
        exercises: [
          {
            id: `ex_${stageId}_1`,
            level: 'easy',
            title: `${lesson.title} Starter`,
            instruction: `Create a small React component that demonstrates ${focus}.`,
            boilerplateCode: {
              html: '<div id="root"></div>',
              js: `function App() {\n  return (\n    <section>\n      <h1>${lesson.title}</h1>\n      <p>Practice: ${focus}</p>\n    </section>\n  );\n}\n\nexport default App;`,
            },
          },
          {
            id: `ex_${stageId}_2`,
            level: 'medium',
            title: `${lesson.title} Interaction`,
            instruction: `Extend the component with a realistic UI interaction related to ${focus}.`,
            boilerplateCode: {
              html: '<div id="root"></div>',
              js: MEDIUM_BOILERPLATE_JS,
            },
          },
          {
            id: `ex_${stageId}_3`,
            level: 'hard',
            title: `${lesson.title} Mini Feature`,
            instruction: `Build a polished mini feature combining ${focus} with reusable React structure.`,
            boilerplateCode: {
              html: '<div id="root"></div>',
              js: HARD_BOILERPLATE_JS,
            },
          },
        ],
      };

      return {
        id: stageId,
        title: `${lesson.lesson_no}. ${lesson.title}`,
        isCompleted: false,
        earnedStars: 0,
      };
    });

    milestones.push({
      id: milestoneId,
      title: milestone.title,
      icon: MILESTONE_ICONS[mIndex] ?? 'react',
      status: MILESTONE_STATUS[mIndex] ?? 'locked',
      stages,
    });
  });

  const roadmaps = [
    {
      skillId: 'react',
      skillTitle: course.course_name,
      milestoneIds: course.milestones.map(m => `m${m.id}`),
    },
  ];

  fs.writeFileSync(
    path.join(dataDir, 'roadmaps.ts'),
    `import { Roadmap } from '@/learning-path/types/learning-path.types';\n\nexport const ROADMAPS: Roadmap[] = ${serializeValue(roadmaps)};\n`,
    'utf-8',
  );

  fs.writeFileSync(
    path.join(dataDir, 'milestones.ts'),
    `import { Milestone } from '@/learning-path/types/learning-path.types';\n\nexport const MILESTONES: Milestone[] = ${serializeValue(milestones)};\n`,
    'utf-8',
  );

  const theoryEntries = Object.entries(theories)
    .map(([key, value]) => `  ${key}: ${serializeValue(value, 1)},`)
    .join('\n');

  fs.writeFileSync(
    path.join(dataDir, 'theories.ts'),
    `import { Theory } from '@/learning-path/types/learning-path.types';\n\nexport const THEORIES: Record<string, Theory> = {\n${theoryEntries}\n};\n`,
    'utf-8',
  );

  const practiceEntries = Object.entries(practices)
    .map(([key, value]) => `  ${key}: ${serializeValue(value, 1)},`)
    .join('\n');

  fs.writeFileSync(
    path.join(dataDir, 'practices.ts'),
    `import { Practice } from '@/learning-path/types/learning-path.types';\n\nexport const PRACTICES: Record<string, Practice> = {\n${practiceEntries}\n};\n`,
    'utf-8',
  );

  // eslint-disable-next-line no-console
  console.log(
    `Generated ${milestones.length} milestones, ${Object.keys(theories).length} theories, ${Object.keys(practices).length} practices.`,
  );
}

main();
