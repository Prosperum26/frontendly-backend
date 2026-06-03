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
  bs1: {
    stageId: 'bs1',
    exercises: [
      {
        id: 'ex_bs1_1',
        level: 'easy',
        title: 'Hello World Server',
        instruction:
          'Create a simple Node.js server that responds with "Hello World" on port 3000.',
        boilerplateCode: {
          html: '',
          js: 'const http = require("http");\n\n// Create server here',
        },
      },
      {
        id: 'ex_bs1_2',
        level: 'medium',
        title: 'File System Read',
        instruction:
          'Read a file asynchronously using fs.readFile and log its contents.',
        boilerplateCode: {
          html: '',
          js: 'const fs = require("fs");\n\n// Read file asynchronously',
        },
      },
      {
        id: 'ex_bs1_3',
        level: 'hard',
        title: 'Event Emitter',
        instruction:
          'Create a custom EventEmitter that emits events and handles them with listeners.',
        boilerplateCode: {
          html: '',
          js: 'const EventEmitter = require("events");\n\n// Create custom event emitter',
        },
      },
    ],
  },
  bs2: {
    stageId: 'bs2',
    exercises: [
      {
        id: 'ex_bs2_1',
        level: 'easy',
        title: 'Initialize Package',
        instruction:
          'Create a package.json file with basic metadata using npm init.',
        boilerplateCode: {
          html: '',
          js: '// This exercise requires terminal commands\n// npm init -y',
        },
      },
      {
        id: 'ex_bs2_2',
        level: 'medium',
        title: 'Install Dependencies',
        instruction:
          'Install express as a dependency and save it to package.json.',
        boilerplateCode: {
          html: '',
          js: '// npm install express --save',
        },
      },
      {
        id: 'ex_bs2_3',
        level: 'hard',
        title: 'Package Scripts',
        instruction:
          'Add custom scripts to package.json for start, test, and dev commands.',
        boilerplateCode: {
          html: '',
          js: '// Modify package.json scripts section',
        },
      },
    ],
  },
  bs3: {
    stageId: 'bs3',
    exercises: [
      {
        id: 'ex_bs3_1',
        level: 'easy',
        title: 'Export Function',
        instruction:
          'Create a module that exports a function and import it in another file.',
        boilerplateCode: {
          html: '',
          js: '// module.exports = function() {\n//   return "Hello";\n// }',
        },
      },
      {
        id: 'ex_bs3_2',
        level: 'medium',
        title: 'Require Module',
        instruction: 'Require a custom module and use its exported function.',
        boilerplateCode: {
          html: '',
          js: 'const myModule = require("./myModule");\n\n// Use the module',
        },
      },
      {
        id: 'ex_bs3_3',
        level: 'hard',
        title: 'Module Pattern',
        instruction:
          'Create a module using the module pattern with private and public methods.',
        boilerplateCode: {
          html: '',
          js: '// Implement module pattern',
        },
      },
    ],
  },
  bs5: {
    stageId: 'bs5',
    exercises: [
      {
        id: 'ex_bs5_1',
        level: 'easy',
        title: 'Basic Express App',
        instruction:
          'Create a basic Express application with a GET route that returns JSON.',
        boilerplateCode: {
          html: '',
          js: 'const express = require("express");\nconst app = express();\n\n// Add GET route here',
        },
      },
      {
        id: 'ex_bs5_2',
        level: 'medium',
        title: 'Route Parameters',
        instruction:
          'Create a route with parameters (e.g., /users/:id) that returns user data.',
        boilerplateCode: {
          html: '',
          js: 'const express = require("express");\nconst app = express();\n\n// Add route with parameters',
        },
      },
      {
        id: 'ex_bs5_3',
        level: 'hard',
        title: 'RESTful Routes',
        instruction:
          'Implement full CRUD routes for a resource (GET, POST, PUT, DELETE).',
        boilerplateCode: {
          html: '',
          js: 'const express = require("express");\nconst app = express();\n\n// Implement CRUD routes',
        },
      },
    ],
  },
  bs9: {
    stageId: 'bs9',
    exercises: [
      {
        id: 'ex_bs9_1',
        level: 'easy',
        title: 'Connect to MongoDB',
        instruction:
          'Connect to a MongoDB database using the MongoDB Node.js driver.',
        boilerplateCode: {
          html: '',
          js: 'const { MongoClient } = require("mongodb");\n\n// Connect to MongoDB',
        },
      },
      {
        id: 'ex_bs9_2',
        level: 'medium',
        title: 'Insert Document',
        instruction: 'Insert a document into a MongoDB collection.',
        boilerplateCode: {
          html: '',
          js: '// Insert document into collection',
        },
      },
      {
        id: 'ex_bs9_3',
        level: 'hard',
        title: 'Query Documents',
        instruction: 'Query documents from MongoDB with filters and sorting.',
        boilerplateCode: {
          html: '',
          js: '// Query documents with filters',
        },
      },
    ],
  },
  bs10: {
    stageId: 'bs10',
    exercises: [
      {
        id: 'ex_bs10_1',
        level: 'easy',
        title: 'Define Schema',
        instruction:
          'Define a Mongoose schema for a User model with name and email fields.',
        boilerplateCode: {
          html: '',
          js: 'const mongoose = require("mongoose");\n\n// Define User schema',
        },
      },
      {
        id: 'ex_bs10_2',
        level: 'medium',
        title: 'Create Model',
        instruction:
          'Create a Mongoose model from the schema and use it to save a document.',
        boilerplateCode: {
          html: '',
          js: '// Create model and save document',
        },
      },
      {
        id: 'ex_bs10_3',
        level: 'hard',
        title: 'Schema Validation',
        instruction:
          'Add validation rules to the Mongoose schema (required, unique, etc.).',
        boilerplateCode: {
          html: '',
          js: '// Add validation to schema',
        },
      },
    ],
  },
  bs13: {
    stageId: 'bs13',
    exercises: [
      {
        id: 'ex_bs13_1',
        level: 'easy',
        title: 'Generate JWT',
        instruction: 'Generate a JWT token using the jsonwebtoken library.',
        boilerplateCode: {
          html: '',
          js: 'const jwt = require("jsonwebtoken");\n\n// Generate JWT token',
        },
      },
      {
        id: 'ex_bs13_2',
        level: 'medium',
        title: 'Verify JWT',
        instruction: 'Verify a JWT token and extract the payload.',
        boilerplateCode: {
          html: '',
          js: '// Verify JWT token',
        },
      },
      {
        id: 'ex_bs13_3',
        level: 'hard',
        title: 'Auth Middleware',
        instruction:
          'Create Express middleware that verifies JWT tokens for protected routes.',
        boilerplateCode: {
          html: '',
          js: '// Create auth middleware',
        },
      },
    ],
  },
};
