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
  bs1: {
    stageId: 'bs1',
    title: 'Node.js Basics',
    videoUrl: '',
    contentHtml:
      "<h1>Node.js Basics</h1><p>Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.</p><h2>Key Concepts</h2><ul><li>Event-driven architecture</li><li>Non-blocking I/O</li><li>REPL environment</li><li>File system operations</li></ul>",
    proTips:
      'Use async/await for file operations to avoid blocking the event loop.',
    referenceLinks: [
      {
        title: 'Node.js Documentation',
        url: 'https://nodejs.org/en/docs/',
        type: 'doc',
      },
    ],
  },
  bs2: {
    stageId: 'bs2',
    title: 'npm & Package Management',
    videoUrl: '',
    contentHtml:
      "<h1>npm & Package Management</h1><p>npm is the package manager for Node.js and the world's largest software registry.</p><h2>Key Commands</h2><ul><li>npm init</li><li>npm install</li><li>package.json</li><li>Dependencies vs DevDependencies</li></ul>",
    proTips:
      'Use --save-exact for production dependencies to ensure version consistency.',
    referenceLinks: [
      {
        title: 'npm Documentation',
        url: 'https://docs.npmjs.com/',
        type: 'doc',
      },
    ],
  },
  bs3: {
    stageId: 'bs3',
    title: 'CommonJS Modules',
    videoUrl: '',
    contentHtml:
      '<h1>CommonJS Modules</h1><p>CommonJS is the module system used by Node.js before ES6 modules.</p><h2>Key Concepts</h2><ul><li>require()</li><li>module.exports</li><li>__dirname and __filename</li></ul>',
    proTips: 'Use ES6 modules (import/export) for new projects when possible.',
    referenceLinks: [
      {
        title: 'Node.js Modules',
        url: 'https://nodejs.org/api/modules.html',
        type: 'doc',
      },
    ],
  },
  bs4: {
    stageId: 'bs4',
    title: 'Event Loop',
    videoUrl: '',
    contentHtml:
      '<h1>Event Loop</h1><p>The Node.js event loop enables asynchronous, non-blocking I/O operations.</p><h2>Phases</h2><ul><li>Timers</li><li>Pending callbacks</li><li>Idle, prepare</li><li>Poll</li><li>Check</li><li>Close callbacks</li></ul>',
    proTips: 'Avoid blocking the event loop with CPU-intensive tasks.',
    referenceLinks: [
      {
        title: 'Node.js Event Loop',
        url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/',
        type: 'doc',
      },
    ],
  },
  bs5: {
    stageId: 'bs5',
    title: 'Express Setup & Routing',
    videoUrl: '',
    contentHtml:
      '<h1>Express Setup & Routing</h1><p>Express is a minimal and flexible Node.js web application framework.</p><h2>Key Concepts</h2><ul><li>Express application setup</li><li>Route handlers</li><li>HTTP methods (GET, POST, PUT, DELETE)</li><li>Route parameters</li></ul>',
    proTips: 'Use express.Router() to organize routes into separate modules.',
    referenceLinks: [
      {
        title: 'Express Documentation',
        url: 'https://expressjs.com/en/guide/routing.html',
        type: 'doc',
      },
    ],
  },
  bs6: {
    stageId: 'bs6',
    title: 'Middleware',
    videoUrl: '',
    contentHtml:
      '<h1>Middleware</h1><p>Middleware functions have access to the request object, response object, and next middleware function.</p><h2>Types</h2><ul><li>Application-level middleware</li><li>Router-level middleware</li><li>Error-handling middleware</li><li>Built-in middleware</li></ul>',
    proTips:
      'Always call next() to pass control to the next middleware function.',
    referenceLinks: [
      {
        title: 'Express Middleware',
        url: 'https://expressjs.com/en/guide/writing-middleware.html',
        type: 'doc',
      },
    ],
  },
  bs7: {
    stageId: 'bs7',
    title: 'Request & Response',
    videoUrl: '',
    contentHtml:
      '<h1>Request & Response</h1><p>Understanding how to handle HTTP requests and send responses in Express.</p><h2>Key Concepts</h2><ul><li>req.body, req.params, req.query</li><li>res.send(), res.json(), res.status()</li><li>Request headers</li><li>Response headers</li></ul>',
    proTips: 'Use body-parser middleware to parse JSON request bodies.',
    referenceLinks: [
      {
        title: 'Express Request & Response',
        url: 'https://expressjs.com/en/4x/api.html#req',
        type: 'doc',
      },
    ],
  },
  bs8: {
    stageId: 'bs8',
    title: 'Error Handling',
    videoUrl: '',
    contentHtml:
      '<h1>Error Handling</h1><p>Proper error handling is crucial for building robust Express applications.</p><h2>Key Concepts</h2><ul><li>Error-handling middleware</li><li>try/catch blocks</li><li>Async error handling</li><li>Error logging</li></ul>',
    proTips:
      'Always have a catch-all error handler at the end of your middleware chain.',
    referenceLinks: [
      {
        title: 'Express Error Handling',
        url: 'https://expressjs.com/en/guide/error-handling.html',
        type: 'doc',
      },
    ],
  },
  bs9: {
    stageId: 'bs9',
    title: 'MongoDB Basics',
    videoUrl: '',
    contentHtml:
      '<h1>MongoDB Basics</h1><p>MongoDB is a document-oriented NoSQL database designed for ease of development and scaling.</p><h2>Key Concepts</h2><ul><li>Documents and Collections</li><li>BSON data format</li><li>CRUD operations</li><li>Query operators</li></ul>',
    proTips: 'Use indexes to improve query performance on large collections.',
    referenceLinks: [
      {
        title: 'MongoDB Documentation',
        url: 'https://docs.mongodb.com/manual/',
        type: 'doc',
      },
    ],
  },
  bs10: {
    stageId: 'bs10',
    title: 'Mongoose ODM',
    videoUrl: '',
    contentHtml:
      '<h1>Mongoose ODM</h1><p>Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.</p><h2>Key Concepts</h2><ul><li>Schemas and Models</li><li>Validation</li><li>Middleware</li><li>Population</li></ul>',
    proTips: 'Define schemas with validation rules to ensure data integrity.',
    referenceLinks: [
      {
        title: 'Mongoose Documentation',
        url: 'https://mongoosejs.com/docs/',
        type: 'doc',
      },
    ],
  },
  bs11: {
    stageId: 'bs11',
    title: 'CRUD Operations',
    videoUrl: '',
    contentHtml:
      '<h1>CRUD Operations</h1><p>CRUD stands for Create, Read, Update, and Delete - the basic operations for data persistence.</p><h2>Operations</h2><ul><li>create() and save()</li><li>find() and findOne()</li><li>findByIdAndUpdate()</li><li>findByIdAndDelete()</li></ul>',
    proTips: 'Use async/await for all database operations.',
    referenceLinks: [
      {
        title: 'Mongoose CRUD',
        url: 'https://mongoosejs.com/docs/documents.html',
        type: 'doc',
      },
    ],
  },
  bs12: {
    stageId: 'bs12',
    title: 'Data Validation',
    videoUrl: '',
    contentHtml:
      '<h1>Data Validation</h1><p>Validation ensures data integrity before saving to the database.</p><h2>Types</h2><ul><li>Built-in validators</li><li>Custom validators</li><li>Async validators</li><li>Schema validation</li></ul>',
    proTips:
      'Use both schema validation and application-level validation for robust data integrity.',
    referenceLinks: [
      {
        title: 'Mongoose Validation',
        url: 'https://mongoosejs.com/docs/validation.html',
        type: 'doc',
      },
    ],
  },
  bs13: {
    stageId: 'bs13',
    title: 'JWT Authentication',
    videoUrl: '',
    contentHtml:
      '<h1>JWT Authentication</h1><p>JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties.</p><h2>Key Concepts</h2><ul><li>JWT structure (header, payload, signature)</li><li>Signing and verification</li><li>Token expiration</li><li>Refresh tokens</li></ul>',
    proTips: 'Store JWTs in HTTP-only cookies for better security.',
    referenceLinks: [
      {
        title: 'JWT Introduction',
        url: 'https://jwt.io/introduction',
        type: 'doc',
      },
    ],
  },
  bs14: {
    stageId: 'bs14',
    title: 'Password Hashing',
    videoUrl: '',
    contentHtml:
      '<h1>Password Hashing</h1><p>Password hashing is a one-way function that transforms passwords into secure hashes.</p><h2>Key Concepts</h2><ul><li>Bcrypt hashing</li><li>Salt rounds</li><li>Hash comparison</li><li>Security best practices</li></ul>',
    proTips: 'Use bcrypt with at least 10 salt rounds for production.',
    referenceLinks: [
      {
        title: 'Bcrypt Documentation',
        url: 'https://github.com/kelektiv/node.bcrypt.js',
        type: 'doc',
      },
    ],
  },
  bs15: {
    stageId: 'bs15',
    title: 'Authorization',
    videoUrl: '',
    contentHtml:
      '<h1>Authorization</h1><p>Authorization determines what resources an authenticated user can access.</p><h2>Key Concepts</h2><ul><li>Role-based access control (RBAC)</li><li>Permission checks</li><li>Middleware guards</li><li>Resource ownership</li></ul>',
    proTips: 'Implement authorization at both the route and resource level.',
    referenceLinks: [
      {
        title: 'Authorization Best Practices',
        url: 'https://owasp.org/www-community/Authorization_Cheat_Sheet',
        type: 'doc',
      },
    ],
  },
  bs16: {
    stageId: 'bs16',
    title: 'Security Best Practices',
    videoUrl: '',
    contentHtml:
      '<h1>Security Best Practices</h1><p>Implementing security best practices to protect your application from common vulnerabilities.</p><h2>Key Practices</h2><ul><li>Input validation and sanitization</li><li>Rate limiting</li><li>CORS configuration</li><li>Helmet middleware</li><li>Environment variables</li></ul>',
    proTips: 'Never commit sensitive data like API keys to version control.',
    referenceLinks: [
      {
        title: 'OWASP Top 10',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'doc',
      },
    ],
  },
};
