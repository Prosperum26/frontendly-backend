import { Practice } from '@/learning-path/types/learning-path.types';

export const PRACTICES: Record<string, Practice> = {
  s1: {
    stageId: 's1',
    exercises: [
      {
        id: 'ex_s1_1',
        level: 'easy',
        title: 'Create Semantic Structure',
        instruction:
          'Create a semantic HTML structure for a blog post with header, main, article, and footer.',
        boilerplateCode: {
          html: '<div>\n  <h1>My Blog</h1>\n  <div>Content here</div>\n</div>',
          js: '',
        },
      },
      {
        id: 'ex_s1_2',
        level: 'medium',
        title: 'Build Navigation',
        instruction:
          'Create a semantic navigation menu using <nav> and <ul> elements.',
        boilerplateCode: {
          html: '<div>\n  <a href="#">Home</a>\n  <a href="#">About</a>\n</div>',
          js: '',
        },
      },
      {
        id: 'ex_s1_3',
        level: 'hard',
        title: 'Complete Article Page',
        instruction:
          'Build a complete article page with proper semantic tags including header, nav, main, article, section, aside, and footer.',
        boilerplateCode: {
          html: '<div>\n  <h1>Article Title</h1>\n  <p>Content</p>\n</div>',
          js: '',
        },
      },
    ],
  },
  s2: {
    stageId: 's2',
    exercises: [
      {
        id: 'ex_s2_1',
        level: 'easy',
        title: 'Select by Class',
        instruction:
          'Select all elements with class "card" and change their background color.',
        boilerplateCode: {
          html: '<div class="card">Card 1</div>\n<div class="card">Card 2</div>',
          js: '// Select elements with class "card"',
        },
      },
      {
        id: 'ex_s2_2',
        level: 'medium',
        title: 'Attribute Selectors',
        instruction:
          'Select all input elements with type "email" and add a border.',
        boilerplateCode: {
          html: '<input type="email">\n<input type="text">',
          js: '// Select email inputs',
        },
      },
      {
        id: 'ex_s2_3',
        level: 'hard',
        title: 'Complex Selector',
        instruction:
          'Select all list items inside an ordered list with class "features" and change their color.',
        boilerplateCode: {
          html: '<ol class="features">\n  <li>Feature 1</li>\n  <li>Feature 2</li>\n</ol>',
          js: '// Select list items',
        },
      },
    ],
  },
  s3: {
    stageId: 's3',
    exercises: [
      {
        id: 'ex_s3_1',
        level: 'easy',
        title: 'Box Model Basics',
        instruction: 'Set padding of 20px and margin of 10px on a div.',
        boilerplateCode: {
          html: '<div class="box">Content</div>',
          js: '',
        },
      },
      {
        id: 'ex_s3_2',
        level: 'medium',
        title: 'Border Box',
        instruction:
          'Apply box-sizing: border-box to an element with width, padding, and border.',
        boilerplateCode: {
          html: '<div class="container">Content</div>',
          js: '',
        },
      },
      {
        id: 'ex_s3_3',
        level: 'hard',
        title: 'Layout Calculation',
        instruction:
          'Calculate and set the exact width of an element considering padding, border, and margin.',
        boilerplateCode: {
          html: '<div class="element">Content</div>',
          js: '',
        },
      },
    ],
  },
  s4: {
    stageId: 's4',
    exercises: [
      {
        id: 'ex_s4_1',
        level: 'easy',
        title: 'Basic Flexbox',
        instruction:
          'Create a flex container with 3 items aligned horizontally.',
        boilerplateCode: {
          html: '<div class="container">\n  <div>Item 1</div>\n  <div>Item 2</div>\n  <div>Item 3</div>\n</div>',
          js: '',
        },
      },
      {
        id: 'ex_s4_2',
        level: 'medium',
        title: 'Flex Direction',
        instruction: 'Create a flex container with items arranged vertically.',
        boilerplateCode: {
          html: '<div class="container">\n  <div>Item 1</div>\n  <div>Item 2</div>\n</div>',
          js: '',
        },
      },
      {
        id: 'ex_s4_3',
        level: 'hard',
        title: 'Flexbox Layout',
        instruction:
          'Create a responsive card layout using flexbox that wraps on smaller screens.',
        boilerplateCode: {
          html: '<div class="card-container">\n  <div class="card">Card 1</div>\n  <div class="card">Card 2</div>\n  <div class="card">Card 3</div>\n</div>',
          js: '',
        },
      },
    ],
  },
};
