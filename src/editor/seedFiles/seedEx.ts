const seedExercises = [
  {
    id: 'ex_html_1', // Dễ
    module: 'MILESTONE 1: HTML Fundamentals',
    title: 'Thẻ Tiêu Đề Cơ Bản',
    description:
      'Hãy bắt đầu với HTML bằng cách tạo một thẻ tiêu đề lớn nhất (H1) chứa dòng chữ "Xin chào FrontEndly".',
    target_design_url: 'https://cdn.frontendly.com/designs/html-easy.png',
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phải có một thẻ <h1>.',
        selector: 'h1',
        type: 'exist',
      },
      {
        id: 'req_2',
        text: 'Nội dung của thẻ <h1> phải là "Xin chào FrontEndly".',
        selector: 'h1',
        type: 'content',
        expectedValue: 'Xin chào FrontEndly',
      },
    ],
    navigation: { prev: null, next: { type: 'practice', id: 'ex_html_2' } },
  },
  {
    id: 'ex_html_2', // Vừa
    module: 'MILESTONE 1: HTML Fundamentals',
    title: 'Danh Sách Không Thứ Tự',
    description:
      'Tạo một danh sách không thứ tự (ul) chứa 3 mục (li): HTML, CSS, JavaScript.',
    target_design_url: 'https://cdn.frontendly.com/designs/html-med.png',
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phải có một thẻ <ul>.',
        selector: 'ul',
        type: 'exist',
      },
      {
        id: 'req_2',
        text: 'Bên trong thẻ <ul> phải có đúng 3 thẻ <li>.',
        selector: 'ul > li',
        type: 'count',
        expectedValue: '3',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Có một thẻ <form>.',
        selector: 'form',
        type: 'exist',
      },
      {
        id: 'req_2',
        text: 'Có input type="text" và input type="password".',
        selector: 'input[type="text"], input[type="password"]',
        type: 'count',
        expectedValue: '2',
      },
      {
        id: 'req_3',
        text: 'Có button loại submit.',
        selector: 'button[type="submit"], input[type="submit"]',
        type: 'exist',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phần tử .box phải có background-color là #333.',
        selector: 'style',
        type: 'content',
        expectedValue: 'background-color',
      },
      {
        id: 'req_2',
        text: 'Phần tử .box phải có color là #fff.',
        selector: 'style',
        type: 'content',
        expectedValue: 'color',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phần tử .box phải có padding là 20px.',
        selector: 'style',
        type: 'content',
        expectedValue: 'padding',
      },
      {
        id: 'req_2',
        text: 'Phần tử .box phải có margin là 10px.',
        selector: 'style',
        type: 'content',
        expectedValue: 'margin',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: '.box phải sử dụng box-sizing: border-box.',
        selector: 'style',
        type: 'content',
        expectedValue: 'box-sizing',
      },
      {
        id: 'req_2',
        text: '.box phải có border: 2px dashed red.',
        selector: 'style',
        type: 'content',
        expectedValue: 'border',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: '.container phải có display: flex.',
        selector: 'style',
        type: 'content',
        expectedValue: 'display',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Sử dụng justify-content: center.',
        selector: 'style',
        type: 'content',
        expectedValue: 'justify-content',
      },
      {
        id: 'req_2',
        text: 'Sử dụng align-items: center.',
        selector: 'style',
        type: 'content',
        expectedValue: 'align-items',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Sử dụng flex-wrap: wrap.',
        selector: 'style',
        type: 'content',
        expectedValue: 'flex-wrap',
      },
      {
        id: 'req_2',
        text: 'Thêm gap: 15px.',
        selector: 'style',
        type: 'content',
        expectedValue: 'gap',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: '.grid-container có display: grid.',
        selector: 'style',
        type: 'content',
        expectedValue: 'display',
      },
      {
        id: 'req_2',
        text: 'Sử dụng grid-template-columns: repeat(3, 1fr).',
        selector: 'style',
        type: 'content',
        expectedValue: 'grid-template-columns',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Sử dụng grid-auto-rows: 100px.',
        selector: 'style',
        type: 'content',
        expectedValue: 'grid-auto-rows',
      },
      {
        id: 'req_2',
        text: 'Sử dụng gap: 10px.',
        selector: 'style',
        type: 'content',
        expectedValue: 'gap',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: '.header phải dùng grid-column: span 2.',
        selector: 'style',
        type: 'content',
        expectedValue: 'grid-column',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Nội dung của id "title" phải được thay đổi thành "JS thật kỳ diệu".',
        selector: '#title',
        type: 'content',
        expectedValue: 'JS thật kỳ diệu',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phải có hàm addEventListener("click").',
        selector: 'script',
        type: 'content',
        expectedValue: 'addEventListener',
      },
      {
        id: 'req_2',
        text: 'Background của #box phải đổi thành "red".',
        selector: '#box',
        type: 'attribute',
        expectedValue: 'style',
      },
    ],
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
    html_content: '',
    css_content: '',
    js_content: '',
    requirements: [
      {
        id: 'req_1',
        text: 'Phải dùng classList.toggle (hoặc add/remove).',
        selector: 'script',
        type: 'content',
        expectedValue: 'classList',
      },
      {
        id: 'req_2',
        text: 'Cuối cùng #text phải có class "hidden".',
        selector: '#text.hidden',
        type: 'exist',
      },
    ],
    navigation: { prev: { type: 'practice', id: 'ex_event_2' }, next: null },
  },
];

export default seedExercises;
