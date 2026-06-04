import { Practice } from '@/learning-path/types/learning-path.types';

const createReactPractice = (
  stageId: string,
  title: string,
  focus: string,
): Practice => ({
  stageId,
  exercises: [
    {
      id: `ex_${stageId}_1`,
      level: 'easy',
      title: `${title} Starter`,
      instruction: `Create a small React component that demonstrates ${focus}.`,
      boilerplateCode: {
        html: '<div id="root"></div>',
        js: `function App() {\n  return <section>\n    <h1>${title}</h1>\n    <p>Practice ${focus}</p>\n  </section>;\n}\n\nexport default App;`,
      },
    },
    {
      id: `ex_${stageId}_2`,
      level: 'medium',
      title: `${title} Interaction`,
      instruction: `Extend the component with a realistic UI interaction using ${focus}.`,
      boilerplateCode: {
        html: '<div id="root"></div>',
        js: `import { useState } from 'react';\n\nfunction App() {\n  const [active, setActive] = useState(false);\n\n  return <button onClick={() => setActive(!active)}>\n    {active ? 'Active' : 'Inactive'}\n  </button>;\n}\n\nexport default App;`,
      },
    },
    {
      id: `ex_${stageId}_3`,
      level: 'hard',
      title: `${title} Mini Feature`,
      instruction: `Build a polished mini feature that combines ${focus} with reusable React structure.`,
      boilerplateCode: {
        html: '<div id="root"></div>',
        js: `const items = ['Learn', 'Practice', 'Complete'];\n\nfunction App() {\n  return <main>\n    {items.map((item) => <article key={item}>{item}</article>)}\n  </main>;\n}\n\nexport default App;`,
      },
    },
  ],
});

export const PRACTICES: Record<string, Practice> = {
  s1: createReactPractice('s1', 'Introduction to React', 'React components'),
  s2: createReactPractice(
    's2',
    'JSX & Components',
    'JSX and component composition',
  ),
  s3: createReactPractice('s3', 'Props & State', 'props and local state'),
  s4: createReactPractice('s4', 'Event Handling', 'React event handlers'),
  s5: createReactPractice('s5', 'useState & useEffect', 'state and effects'),
  s6: createReactPractice('s6', 'Custom Hooks', 'custom hook extraction'),
  s7: createReactPractice('s7', 'Context API', 'shared context state'),
  s8: createReactPractice('s8', 'useReducer', 'reducer-based state updates'),
  s9: createReactPractice(
    's9',
    'Component Composition',
    'composable React layouts',
  ),
  s10: createReactPractice(
    's10',
    'Performance Optimization',
    'memoization and render control',
  ),
  s11: createReactPractice('s11', 'Custom Patterns', 'reusable React patterns'),
  s12: createReactPractice(
    's12',
    'Testing React Components',
    'testable component design',
  ),
};
