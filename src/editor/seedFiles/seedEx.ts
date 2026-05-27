const seedExercises = [
  {
    id: 'ex_html_1', // Dễ
    module: 'MILESTONE 1: HTML Fundamentals',
    title: 'Thẻ Tiêu Đề Cơ Bản',
    description:
      'Hãy bắt đầu với HTML bằng cách tạo một thẻ tiêu đề lớn nhất (H1) chứa dòng chữ "Xin chào FrontEndly".',
    target_design_url: 'https://cdn.frontendly.com/designs/html-easy.png',
    requirements: [
      { id: 'req_1', text: 'Phải có một thẻ <h1>.' },
      {
        id: 'req_2',
        text: 'Nội dung của thẻ <h1> phải là "Xin chào FrontEndly".',
      },
    ],
    editor_content: { html: '\n', css: '', javascript: '' },
    navigation: { prev: null, next: { type: 'practice', id: 'ex_html_2' } },
  },
  {
    id: 'ex_html_2', // Vừa
    module: 'MILESTONE 1: HTML Fundamentals',
    title: 'Danh Sách Không Thứ Tự',
    description:
      'Tạo một danh sách không thứ tự (ul) chứa 3 mục (li): HTML, CSS, JavaScript.',
    target_design_url: 'https://cdn.frontendly.com/designs/html-med.png',
    requirements: [
      { id: 'req_1', text: 'Phải có một thẻ <ul>.' },
      { id: 'req_2', text: 'Bên trong thẻ <ul> phải có đúng 3 thẻ <li>.' },
    ],
    editor_content: { html: '\n', css: '', javascript: '' },
    navigation: {
      prev: { type: 'practice', id: 'ex_html_1' },
      next: { type: 'practice', id: 'ex_form_3' },
    },
  },
  {
    id: 'ex_form_3', // Khó
    module: 'MILESTONE 1: HTML Fundamentals',
    title: 'Xây Dựng Form Đăng Nhập',
    description:
      'Tạo một form gồm 2 input (type text và password) và 1 button submit.',
    target_design_url: 'https://cdn.frontendly.com/designs/html-hard.png',
    requirements: [
      { id: 'req_1', text: 'Có một thẻ <form>.' },
      { id: 'req_2', text: 'Có input type="text" và input type="password".' },
      { id: 'req_3', text: 'Có button loại submit.' },
    ],
    editor_content: { html: '<form>\n  \n</form>', css: '', javascript: '' },
    navigation: {
      prev: { type: 'practice', id: 'ex_html_2' },
      next: { type: 'practice', id: 'ex_color_1' },
    },
  },
  {
    id: 'ex_color_1', // Dễ
    module: 'MILESTONE 2: CSS Box Model',
    title: 'Đổi Màu Nền và Chữ',
    description:
      'Dùng CSS để đổi màu nền của thẻ div thành "#333" và màu chữ thành "#fff".',
    target_design_url: 'https://cdn.frontendly.com/designs/css-easy.png',
    requirements: [
      { id: 'req_1', text: 'Phần tử .box phải có background-color là #333.' },
      { id: 'req_2', text: 'Phần tử .box phải có color là #fff.' },
    ],
    editor_content: {
      html: '<div class="box">Học CSS thật vui</div>',
      css: '.box {\n  /* Thêm CSS ở đây */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_form_3' },
      next: { type: 'practice', id: 'ex_spacing_2' },
    },
  },
  {
    id: 'ex_spacing_2', // Vừa
    module: 'MILESTONE 2: CSS Box Model',
    title: 'Margin và Padding',
    description: 'Thêm padding 20px và margin 10px cho phần tử .box.',
    target_design_url: 'https://cdn.frontendly.com/designs/css-med.png',
    requirements: [
      { id: 'req_1', text: 'Phần tử .box phải có padding là 20px.' },
      { id: 'req_2', text: 'Phần tử .box phải có margin là 10px.' },
    ],
    editor_content: {
      html: '<div class="box">CSS Box Model</div>',
      css: '.box {\n  background-color: blue;\n  color: white;\n  /* Thêm margin và padding */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_color_1' },
      next: { type: 'practice', id: 'ex_border_3' },
    },
  },
  {
    id: 'ex_border_3', // Khó
    module: 'MILESTONE 2: CSS Box Model',
    title: 'Box-Sizing và Border',
    description:
      'Sử dụng box-sizing: border-box và thêm một viền (border) nét đứt (dashed) màu đỏ dày 2px.',
    target_design_url: 'https://cdn.frontendly.com/designs/css-hard.png',
    requirements: [
      { id: 'req_1', text: '.box phải sử dụng box-sizing: border-box.' },
      { id: 'req_2', text: '.box phải có border: 2px dashed red.' },
    ],
    editor_content: {
      html: '<div class="box">Viền đứt</div>',
      css: '.box {\n  width: 200px;\n  padding: 30px;\n  /* Thêm border và box-sizing */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_spacing_2' },
      next: { type: 'practice', id: 'ex_flex_1' },
    },
  },
  {
    id: 'ex_flex_1', // Dễ
    module: 'MILESTONE 3: CSS Flexbox',
    title: 'Khởi động Flexbox',
    description:
      'Biến .container thành một flex container để các thẻ con nằm ngang.',
    target_design_url: 'https://cdn.frontendly.com/designs/flex-easy.png',
    requirements: [{ id: 'req_1', text: '.container phải có display: flex.' }],
    editor_content: {
      html: '<div class="container">\n  <div class="item">1</div>\n  <div class="item">2</div>\n</div>',
      css: '.container {\n  /* Thêm code flex ở đây */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_border_3' },
      next: { type: 'practice', id: 'ex_flexalign_2' },
    },
  },
  {
    id: 'ex_flexalign_2', // Vừa
    module: 'MILESTONE 3: CSS Flexbox',
    title: 'Căn giữa tuyệt đối với Flexbox',
    description:
      'Dùng Flexbox để căn giữa nội dung cả theo chiều ngang (justify-content) và dọc (align-items).',
    target_design_url: 'https://cdn.frontendly.com/designs/flex-med.png',
    requirements: [
      { id: 'req_1', text: 'Sử dụng justify-content: center.' },
      { id: 'req_2', text: 'Sử dụng align-items: center.' },
    ],
    editor_content: {
      html: '<div class="container">\n  <div class="item">Center Me</div>\n</div>',
      css: '.container {\n  display: flex;\n  height: 200px;\n  background: #eee;\n  /* Thêm code căn giữa */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_flex_1' },
      next: { type: 'practice', id: 'ex_flexwrap_3' },
    },
  },
  {
    id: 'ex_flexwrap_3', // Khó
    module: 'MILESTONE 3: CSS Flexbox',
    title: 'Responsive với Flex-Wrap',
    description:
      'Cho phép các item rớt xuống hàng khi không đủ không gian bằng flex-wrap và tạo khoảng cách gap 15px.',
    target_design_url: 'https://cdn.frontendly.com/designs/flex-hard.png',
    requirements: [
      { id: 'req_1', text: 'Sử dụng flex-wrap: wrap.' },
      { id: 'req_2', text: 'Thêm gap: 15px.' },
    ],
    editor_content: {
      html: '<div class="container">\n  <div class="item">A</div>\n  <div class="item">B</div>\n  <div class="item">C</div>\n  <div class="item">D</div>\n</div>',
      css: '.container {\n  display: flex;\n  width: 200px;\n  /* Thêm wrap và gap */\n}\n.item {\n  width: 80px;\n  height: 80px;\n  background: coral;\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_flexalign_2' },
      next: { type: 'practice', id: 'ex_grid_1' },
    },
  },
  {
    id: 'ex_grid_1', // Dễ
    module: 'MILESTONE 4: CSS Grid',
    title: 'Tạo lưới 3 cột',
    description:
      'Sử dụng grid-template-columns để tạo một lưới chia đều 3 cột bằng 1fr.',
    target_design_url: 'https://cdn.frontendly.com/designs/grid-easy.png',
    requirements: [
      { id: 'req_1', text: '.grid-container có display: grid.' },
      { id: 'req_2', text: 'Sử dụng grid-template-columns: repeat(3, 1fr).' },
    ],
    editor_content: {
      html: '<div class="grid-container">\n  <div>1</div><div>2</div><div>3</div>\n</div>',
      css: '.grid-container {\n  /* Tạo grid 3 cột */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_flexwrap_3' },
      next: { type: 'practice', id: 'ex_gridgap_2' },
    },
  },
  {
    id: 'ex_gridgap_2', // Vừa
    module: 'MILESTONE 4: CSS Grid',
    title: 'Rows và Gap trong Grid',
    description:
      'Thiết lập các hàng có chiều cao 100px và khoảng cách giữa các ô là 10px.',
    target_design_url: 'https://cdn.frontendly.com/designs/grid-med.png',
    requirements: [
      { id: 'req_1', text: 'Sử dụng grid-auto-rows: 100px.' },
      { id: 'req_2', text: 'Sử dụng gap: 10px.' },
    ],
    editor_content: {
      html: '<div class="grid-container">\n  <div>1</div><div>2</div><div>3</div><div>4</div>\n</div>',
      css: '.grid-container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  /* Thêm rows và gap */\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_grid_1' },
      next: { type: 'practice', id: 'ex_gridspan_3' },
    },
  },
  {
    id: 'ex_gridspan_3', // Khó
    module: 'MILESTONE 4: CSS Grid',
    title: 'Grid Column Spanning',
    description: 'Làm cho item đầu tiên trải dài qua 2 cột bằng grid-column.',
    target_design_url: 'https://cdn.frontendly.com/designs/grid-hard.png',
    requirements: [
      { id: 'req_1', text: '.header phải dùng grid-column: span 2.' },
    ],
    editor_content: {
      html: '<div class="grid-container">\n  <div class="header">Header</div>\n  <div>Left</div>\n  <div>Right</div>\n</div>',
      css: '.grid-container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n}\n.header {\n  /* Kéo dài cột */\n  background: yellow;\n}',
      javascript: '',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_gridgap_2' },
      next: { type: 'practice', id: 'ex_dom_1' },
    },
  },
  {
    id: 'ex_dom_1', // Dễ
    module: 'MILESTONE 5: JS DOM Manipulation',
    title: 'Truy xuất phần tử DOM',
    description:
      'Dùng JavaScript thay đổi nội dung (innerHTML) của thẻ có id là "title" thành "JS thật kỳ diệu".',
    target_design_url: 'https://cdn.frontendly.com/designs/js-easy.png',
    requirements: [
      {
        id: 'req_1',
        text: 'Nội dung của id "title" phải được thay đổi thành "JS thật kỳ diệu".',
      },
    ],
    editor_content: {
      html: '<h1 id="title">Chưa chạy JS</h1>',
      css: '',
      javascript: '// Lấy phần tử và đổi innerHTML\n',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_gridspan_3' },
      next: { type: 'practice', id: 'ex_event_2' },
    },
  },
  {
    id: 'ex_event_2', // Vừa
    module: 'MILESTONE 5: JS DOM Manipulation',
    title: 'Lắng nghe Sự kiện Click',
    description:
      'Bắt sự kiện click trên id "btn". Khi click, đổi background của "box" sang "red".',
    target_design_url: 'https://cdn.frontendly.com/designs/js-med.png',
    requirements: [
      { id: 'req_1', text: 'Phải có hàm addEventListener("click").' },
      { id: 'req_2', text: 'Background của #box phải đổi thành "red".' },
    ],
    editor_content: {
      html: '<button id="btn">Click Me</button>\n<div id="box" style="width:100px; height:100px; background:blue;"></div>',
      css: '',
      javascript:
        'const btn = document.getElementById("btn");\nconst box = document.getElementById("box");\n// Thêm sự kiện click\n',
    },
    navigation: {
      prev: { type: 'practice', id: 'ex_dom_1' },
      next: { type: 'practice', id: 'ex_classlist_3' },
    },
  },
  {
    id: 'ex_classlist_3', // Khó
    module: 'MILESTONE 5: JS DOM Manipulation',
    title: 'Thêm class bằng classList',
    description:
      'Dùng JS kiểm tra xem #text có class "hidden" không. Nếu chưa thì add vào, nếu có rồi thì remove đi (hoặc dùng toggle).',
    target_design_url: 'https://cdn.frontendly.com/designs/js-hard.png',
    requirements: [
      { id: 'req_1', text: 'Phải dùng classList.toggle (hoặc add/remove).' },
      { id: 'req_2', text: 'Cuối cùng #text phải có class "hidden".' },
    ],
    editor_content: {
      html: '<p id="text">Văn bản này có thể bị ẩn</p>',
      css: '.hidden { display: none; }',
      javascript:
        'const text = document.getElementById("text");\n// Dùng classList ở đây\n',
    },
    navigation: { prev: { type: 'practice', id: 'ex_event_2' }, next: null },
  },
];

export default seedExercises;
