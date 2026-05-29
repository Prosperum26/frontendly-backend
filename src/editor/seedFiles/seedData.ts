/* eslint-disable no-console */
import mongoose from 'mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { UserSchema } from '../db_schemas/userFake_schema';

const seedUsers = [
  { id: 'user_01' },
  { id: 'user_02' },
  { id: 'user_03' },
  { id: 'user_04' },
  { id: 'user_05' },
];

const seedExercises = [
  {
    id: 'ex_01',
    module: 'HTML/CSS Basics',
    title: 'Create a Basic Button',
    description:
      'Use HTML and CSS to create a button with rounded corners that changes its background color when hovered.',
    target_design_url: 'https://example.com/designs/button-hover.png',
    requirements: [
      { id: 'req_1', text: 'Contains a <button> tag' },
      { id: 'req_2', text: 'Includes the border-radius property' },
    ],
  },
  {
    id: 'ex_02',
    module: 'Flexbox Layout',
    title: 'Center a Div Element',
    description:
      'Use Flexbox to perfectly center a child div element both horizontally and vertically inside a parent div.',
    target_design_url: 'https://example.com/designs/center-div.png',
    requirements: [
      { id: 'req_1', text: 'Uses display: flex' },
      { id: 'req_2', text: 'Uses justify-content and align-items' },
    ],
  },
  {
    id: 'ex_03',
    module: 'HTML Forms',
    title: 'Create a Login Form',
    description:
      'Create a form containing two input fields (email, password), a "Remember me" checkbox, and a submit button.',
    target_design_url: 'https://example.com/designs/login-form.png',
    requirements: [
      { id: 'req_3_1', text: 'Wrapped inside a <form> tag' },
      {
        id: 'req_3_2',
        text: 'Contains input fields with type="email" and type="password"',
      },
      {
        id: 'req_3_3',
        text: 'Contains an input field with type="checkbox" for remembering login session',
      },
      {
        id: 'req_3_4',
        text: 'Contains a <button type="submit"> Login </button>',
      },
    ],
  },
  {
    id: 'ex_04',
    module: 'CSS Grid',
    title: '3-Column Image Grid',
    description:
      'Use CSS Grid to create an image gallery layout consisting of three equal-width columns.',
    target_design_url: 'https://example.com/designs/grid-gallery.png',
    requirements: [
      { id: 'req_1', text: 'Uses display: grid' },
      { id: 'req_2', text: 'Uses grid-template-columns' },
    ],
  },
  {
    id: 'ex_05',
    module: 'JavaScript Basics',
    title: 'Number Counter',
    description:
      'Write JavaScript logic to increment or decrement the number displayed on the screen using two separate buttons.',
    target_design_url: 'https://example.com/designs/js-counter.png',
    requirements: [
      {
        id: 'req_5_1',
        text: 'Contains an element displaying the number with id="counter-value"',
      },
      {
        id: 'req_5_2',
        text: 'The increment button must have id="btn-increase"',
      },
      {
        id: 'req_5_3',
        text: 'The decrement button must have id="btn-decrease"',
      },
      {
        id: 'req_5_4',
        text: 'Clicking the buttons must update the DOM correctly (value cannot go below zero)',
      },
    ],
  },
  {
    id: 'ex_06',
    module: 'JavaScript DOM',
    title: 'Background Color Changer',
    description:
      'Write a JavaScript function that changes the background color of the web page to a random color when a button is clicked.',
    target_design_url: 'https://example.com/designs/bg-changer.png',
    requirements: [{ id: 'req_1', text: 'Uses document.body.style' }],
  },
  {
    id: 'ex_07',
    module: 'CSS Advanced',
    title: 'Neumorphism Effect',
    description:
      'Use multi-layered box-shadow effects to create a 3D soft-shadow floating look (Neumorphism) for a div element.',
    target_design_url: 'https://example.com/designs/neumorphism.png',
    requirements: [
      { id: 'req_1', text: 'Includes valid box-shadow declarations' },
    ],
  },
  {
    id: 'ex_08',
    module: 'HTML/CSS Basics',
    title: 'Navigation Bar (Navbar)',
    description:
      'Create a horizontal navigation menu bar that remains fixed at the top of the web page (sticky top) when scrolling.',
    target_design_url: 'https://example.com/designs/sticky-nav.png',
    requirements: [
      { id: 'req_1', text: 'The nav element includes position: sticky' },
    ],
  },
  {
    id: 'ex_09',
    module: 'JavaScript Advanced',
    title: 'Basic Todo List',
    description:
      'Write JS logic to dynamically append a new <li> item into a <ul> list when a user types text and clicks the Add button.',
    target_design_url: 'https://example.com/designs/todo.png',
    requirements: [
      { id: 'req_1', text: 'Uses document.createElement' },
      { id: 'req_2', text: 'Uses appendChild' },
    ],
  },
  {
    id: 'ex_10',
    module: 'CSS Responsive',
    title: 'Screen-Responsive Card',
    description:
      'Use Media Queries to completely hide a specific element when the viewport width drops below 768px.',
    target_design_url: 'https://example.com/designs/responsive-card.png',
    requirements: [
      { id: 'req_1', text: 'Includes @media (max-width: 768px)' },
      { id: 'req_2', text: 'Uses display: none' },
    ],
  },
];

const seedSubmissions = [
  {
    id: 'sub_01',
    userId: 'user_01',
    exerciseId: 'ex_01',
    isCompleted: true,
    match_percentage: 100.0,
    html_content: '<button class="btn">Submit</button>',
    css_content: '.btn { border-radius: 5px; }',
    js_content: '',
  },
  {
    id: 'sub_02',
    userId: 'user_02',
    exerciseId: 'ex_01',
    isCompleted: false,
    match_percentage: 50.0,
    html_content: '<button>Submit</button>',
    css_content: '',
    js_content: '',
  },
  {
    id: 'sub_03',
    userId: 'user_01',
    exerciseId: 'ex_02',
    isCompleted: true,
    match_percentage: 100.0,
    html_content: '<div class="container"><div class="box"></div></div>',
    css_content:
      '.container { display: flex; justify-content: center; align-items: center; }',
    js_content: '',
  },
  {
    id: 'sub_04',
    userId: 'user_03',
    exerciseId: 'ex_03',
    isCompleted: true,
    match_percentage: 100.0,
    html_content: '<form><input type="email"/><input type="password"/></form>',
    css_content: 'form { padding: 20px; }',
    js_content: '',
  },
  {
    id: 'sub_05',
    userId: 'user_04',
    exerciseId: 'ex_05',
    isCompleted: false,
    match_percentage: 80.5,
    html_content: '<p id="count">0</p><button id="btn">Increase</button>',
    css_content: '',
    js_content:
      'document.getElementById("btn").addEventListener("click", () => { /* handler logic */ });',
  },
  {
    id: 'sub_06',
    userId: 'user_05',
    exerciseId: 'ex_10',
    isCompleted: true,
    match_percentage: 100.0,
    html_content: '<div class="card">Hide me on mobile</div>',
    css_content: '@media (max-width: 768px) { .card { display: none; } }',
    js_content: '',
  },
  {
    id: 'sub_07',
    userId: 'user_02',
    exerciseId: 'ex_09',
    isCompleted: true,
    match_percentage: 100.0,
    html_content:
      '<ul id="list"></ul><input id="txt"/><button id="add">Add</button>',
    css_content: '',
    js_content:
      'const li = document.createElement("li"); document.getElementById("list").appendChild(li);',
  },
  {
    id: 'sub_08',
    userId: 'user_03',
    exerciseId: 'ex_04',
    isCompleted: false,
    match_percentage: 40.0,
    html_content:
      '<div class="gallery"><div>1</div><div>2</div><div>3</div></div>',
    css_content: '.gallery { display: grid; }',
    js_content: '',
  },
  {
    id: 'sub_09',
    userId: 'user_04',
    exerciseId: 'ex_08',
    isCompleted: true,
    match_percentage: 95.0,
    html_content: '<nav class="top-nav">Logo | Menu</nav>',
    css_content: '.top-nav { position: sticky; top: 0; }',
    js_content: '',
  },
  {
    id: 'sub_10',
    userId: 'user_05',
    exerciseId: 'ex_02',
    isCompleted: true,
    match_percentage: 100.0,
    html_content: '<div class="wrap"><div class="item">Center</div></div>',
    css_content:
      '.wrap { display: flex; justify-content: center; align-items: center; height: 100vh; }',
    js_content: '',
  },
];

const MONGO_URI = 'mongodb://localhost:27017/frontnendly';

async function runSeed(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Successfully connect\n');

    const user = mongoose.model('User', UserSchema);
    const practice = mongoose.model('Exercise', ExerciseSchema);
    const submit = mongoose.model('Submission', SubmissionSchema);

    console.log('Xóa dữ liệu');
    await user.deleteMany({});
    await practice.deleteMany({});
    await submit.deleteMany({});

    console.log('Nạp dữ liệu');
    await user.insertMany(seedUsers);
    await practice.insertMany(seedExercises);
    await submit.insertMany(seedSubmissions);

    console.log('\n🎉 Done');
    process.exit(0);
  } catch (error) {
    console.error('\n❌Error: ', error);
    process.exit(1);
  }
}

void runSeed();
