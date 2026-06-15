import { Theory } from '@/learning-path/types/learning-path.types';

export const THEORIES: Record<string, Theory> = {
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
