const seedSubmissions = [
  {
    id: 'sub_01',
    userId: 'user_01',
    exerciseId: 'ex_html_1',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
    ],
    html_content: '<h1>Xin chào FrontEndly</h1>',
    css_content: '',
    js_content: '',
    createdAt: new Date('2026-05-21T10:00:00Z'),
  },
  {
    id: 'sub_02',
    userId: 'user_01',
    exerciseId: 'ex_html_2',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
    ],
    html_content:
      '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>',
    css_content: '',
    js_content: '',
    createdAt: new Date('2026-05-21T10:15:00Z'),
  },
  {
    id: 'sub_03',
    userId: 'user_01',
    exerciseId: 'ex_form_3',
    isCompleted: false,
    match_percentage: 66.7,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
      { requirementId: 'req_3', passed: false }, // Thiếu thẻ button
    ],
    html_content:
      '<form>\n  <input type="text" placeholder="Username" />\n  <input type="password" placeholder="Password" />\n  \n</form>',
    css_content: '',
    js_content: '',
    createdAt: new Date('2026-05-21T10:30:00Z'),
  },
  {
    id: 'sub_04',
    userId: 'user_01',
    exerciseId: 'ex_color_1',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
    ],
    html_content: '<div class="box">Học CSS thật vui</div>',
    css_content: '.box {\n  background-color: #333;\n  color: #fff;\n}',
    js_content: '',
    createdAt: new Date('2026-05-21T10:45:00Z'),
  },
  {
    id: 'sub_05',
    userId: 'user_01',
    exerciseId: 'ex_spacing_2',
    isCompleted: false,
    match_percentage: 50.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: false }, // Thiếu margin
    ],
    html_content: '<div class="box">CSS Box Model</div>',
    css_content:
      '.box {\n  background-color: blue;\n  color: white;\n  padding: 20px;\n  /* Học viên quên thêm margin 10px */\n}',
    js_content: '',
    createdAt: new Date('2026-05-21T11:00:00Z'),
  },
  {
    id: 'sub_06',
    userId: 'user_01',
    exerciseId: 'ex_border_3',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
    ],
    html_content: '<div class="box">Viền đứt</div>',
    css_content:
      '.box {\n  width: 200px;\n  padding: 30px;\n  box-sizing: border-box;\n  border: 2px dashed red;\n}',
    js_content: '',
    createdAt: new Date('2026-05-21T11:15:00Z'),
  },
  {
    id: 'sub_07',
    userId: 'user_01',
    exerciseId: 'ex_flex_1',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [{ requirementId: 'req_1', passed: true }],
    html_content:
      '<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n</div>',
    css_content: '.container {\n  display: flex;\n}',
    js_content: '',
    createdAt: new Date('2026-05-21T11:30:00Z'),
  },
  {
    id: 'sub_08',
    userId: 'user_01',
    exerciseId: 'ex_flexalign_2',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: true },
      { requirementId: 'req_2', passed: true },
    ],
    html_content:
      '<div class="container">\n  <div class="item">Center Me</div>\n</div>',
    css_content:
      '.container {\n  display: flex;\n  height: 200px;\n  background: #eee;\n  justify-content: center;\n  align-items: center;\n}',
    js_content: '',
    createdAt: new Date('2026-05-21T11:45:00Z'),
  },
  {
    id: 'sub_09',
    userId: 'user_01',
    exerciseId: 'ex_dom_1',
    isCompleted: true,
    match_percentage: 100.0,
    evaluationResults: [{ requirementId: 'req_1', passed: true }],
    html_content: '<h1 id="title">Chưa chạy JS</h1>',
    css_content: '',
    js_content:
      'document.getElementById("title").innerHTML = "JS thật kỳ diệu";',
    createdAt: new Date('2026-05-21T12:00:00Z'),
  },
  {
    id: 'sub_10',
    userId: 'user_01',
    exerciseId: 'ex_classlist_3',
    isCompleted: false,
    match_percentage: 50.0,
    evaluationResults: [
      { requirementId: 'req_1', passed: false }, // Dùng sai hàm
      { requirementId: 'req_2', passed: true },
    ],
    html_content: '<p id="text">Văn bản này có thể bị ẩn</p>',
    css_content: '.hidden { display: none; }',
    js_content:
      'const text = document.getElementById("text");\n// Học viên dùng add thay vì classList.toggle\ntext.classList.add("hidden");',
    createdAt: new Date('2026-05-21T12:15:00Z'),
  },
];

export default seedSubmissions;
