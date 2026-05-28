**A. Khu vực Header & Sidebars (Global UI)**

* **Dữ liệu Tĩnh (Static \- FE tự hardcode):** Các tabs điều hướng "Solo", "Competitive", "Spectate", menu bên trái (Learning Path, Community, Settings), và khung Filter Workspace.  
* **Dữ liệu Động (Dynamic \- Gọi Backend):**  
  * **User Profile Widget (Góc phải):** Ảnh Avatar, Tên User, Vai trò (VD: Junior Developer).  
  * **User Progress (Góc phải):** Điểm XP hiện tại / Tổng XP cần để lên cấp, Chuỗi ngày học (Streak), Thứ hạng (Rank Top %), và danh sách Huy hiệu (Badges) đã mở khóa.

**B. Khu vực Content Chính: Tiêu đề & Thông tin Roadmap**

* **Dữ liệu Tĩnh:** Dòng chữ "CERTIFICATION PATH" và đoạn mô tả phụ ("Master the art of building...").  
* **Dữ liệu Động:**  
  * **Tên Skill (Title):** Ví dụ "Frontend Learning Path" hoặc "Advanced JavaScript".

**C. Khu vực Roadmap: Danh sách các Milestones (Trọng tâm)** Đây là linh hồn của trang. Dữ liệu cần được thiết kế dưới dạng mảng (Array) chứa các object Milestone.

* **Dữ liệu Động cần thiết cho mỗi Milestone:**  
  * `id`: Định danh của Milestone.  
  * `title`: Tên Milestone (VD: "Cơ bản Front-end").  
  * `status`: Trạng thái để Frontend biết đường render màu sắc hay làm mờ (Ví dụ: `locked`, `in_progress`, `completed`).  
  * `progress`: Mức độ hoàn thành. (Hiển thị % hoặc sao).  
  * `stages` (Các mục con bên trong): Danh sách các phần học nhỏ. Mỗi stage cần có `id`, `title` (VD: "CSS Grid"), và `isCompleted` (để hiện tick xanh).

**D. Khu vực Bài học: Luồng Theory & Practice (Ẩn sau khi click)**

* **Dữ liệu Động cho phần Theory (Lý thuyết):**  
  * Nội dung lý thuyết (có thể định dạng Markdown hoặc HTML).  
  * Mảng các link tham khảo: Mỗi link cần `title` (VD: "Tài liệu MDN"), `url`, và `type` (Video, Doc).  
* **Dữ liệu Động cho phần Practice (Bài tập):**  
  * Danh sách 3 bài tập tương ứng với 3 mức độ (Easy, Medium, Hard).  
  * Mỗi bài tập cần: Đề bài, Code mẫu (Boilerplate), và các Test Cases để chấm điểm.

# **TÀI LIỆU API CONTRACT \- LEARNING PATH PAGE (V2.0)**

## **1\. Authentication & Authorization (Xác thực)**

* **Cơ chế:** Sử dụng JWT (JSON Web Token).  
* **Truyền tải:** Gửi qua header Authorization: Bearer \<Token\>.  
* **Nguồn Token:** Token được trả về sau khi gọi API Login và được lưu trữ tại localStorage (hoặc HttpOnly Cookie) ở phía Frontend.  
* **Hết hạn (Token Expired):** Nếu Token hết hạn hoặc không hợp lệ, toàn bộ các API dưới đây sẽ trả về HTTP Status 401 Unauthorized. Frontend cần bắt lỗi này để clear token cũ và redirect user về trang Đăng nhập.

## **2\. Global Error Handling (Chuẩn phản hồi lỗi chung)**

Khi API thất bại (HTTP Status 4xx hoặc 5xx), hệ thống luôn trả về format thống nhất như sau để Frontend dễ dàng xử lý (Toast notification hoặc Modal):

JSON  
{  
  "success": false,  
  "errorCode": "UNAUTHORIZED\_ACCESS", // Mã định danh lỗi (FE có thể dùng để map text đa ngôn ngữ)  
  "message": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."  
}

*Các HTTP Status Codes phổ biến sử dụng trong luồng này:*

* 400 Bad Request: Payload gửi lên bị sai format.  
* 401 Unauthorized: Lỗi Token xác thực.  
* 404 Not Found: Không tìm thấy ID của Roadmap/Stage/Exercise.  
* 422 Unprocessable Entity: Lỗi validation (Ví dụ: nộp code rỗng).  
* 429 Too Many Requests: Spam submit liên tục.

## **3\. UI ↔ API Mapping (Liên kết Giao diện và API)**

| UI Action (Hành động FE) | Gọi API tương ứng (Endpoint) | Mục đích |
| :---- | :---- | :---- |
| **Load trang Learning Path** | GET /roadmaps/:skillId | Lấy dữ liệu tổng quan, vẽ bản đồ Milestones, các Stages bên trong và trạng thái khóa/mở. |
| **Click vào 1 Stage cụ thể** | GET /stages/:stageId/theory | Kéo nội dung lý thuyết & links tài liệu để hiển thị bên Cột Trái. |
| **Click "Mark as Read & Start"** | PATCH /stages/:stageId/unlock-practice | Báo cho DB biết user đã đọc xong, xóa ổ khóa IDE để lưu trạng thái lâu dài. |
| **Mở không gian IDE** | GET /stages/:stageId/practices | Kéo 3 đề bài (Dễ/TB/Khó) hiển thị vào cột Đề bài. |
| **Click "Submit Code"** | POST /exercises/:exerciseId/submit | Gửi code đi chấm điểm, nhận kết quả và cập nhật tiến độ sao. |

---

## **4\. Đặc tả API Chi tiết (API Endpoints)**

### **API 1: Lấy bản đồ lộ trình học tập (Roadmap)**

Dùng để render giao diện chính, hiển thị danh sách các Milestones (bao gồm phân trang cho các lộ trình dài).

* **Endpoint:** /api/v1/roadmaps/:skillId  
* **Method:** GET  
* **Input:**  
  * Path Params: skillId (Ví dụ: html, css, javascript)  
  * Query Params (Phân trang): ?page=1\&limit=5 (Mặc định lấy 5 milestones đầu tiên)  
  * Headers: Authorization: Bearer \<Token\>  
* **Output (JSON \- Thành công):**  
* JSON

{  
  "success": true,  
  "message": "Lấy dữ liệu lộ trình thành công",  
  "data": {  
    "skillId": "javascript",  
    "skillTitle": "Javascript",  
    "userProgress": {  
      "currentXp": 2450,  
      "streakDays": 12  
    },  
    "milestones": \[  
      {  
        "id": "m1",  
        "title": "Cú pháp cơ bản",  
        "status": "completed",  
        "stages": \[  
          { "id": "s1", "title": "1. Biến & Kiểu dữ liệu", "isCompleted": true, "earnedStars": 3 },  
          { "id": "s2", "title": "2. Hàm & Scope", "isCompleted": true, "earnedStars": 3 }  
        \]  
      },  
      {  
        "id": "m2",  
        "title": "DOM Tương tác",  
        "status": "in\_progress",  
        "stages": \[  
          { "id": "s3", "title": "1. DOM Selector", "isCompleted": false, "earnedStars": 1 },  
          { "id": "s4", "title": "2. DOM Events", "isCompleted": false, "earnedStars": 0 }  
        \]  
      }  
    \],  
    "pagination": {  
      "currentPage": 1,  
      "limit": 5,  
      "totalItems": 15,  
      "totalPages": 3  
    }  
  }  
}

*   
* 

### **API 2: Lấy dữ liệu phần Theory (Lý thuyết) của 1 Stage**

Được gọi khi người dùng click vào một Stage (ô vuông) đã mở khóa.

* **Endpoint:** /api/v1/stages/:stageId/theory  
* **Method:** GET  
* **Input:**  
  * Path Params: stageId  
  * Headers: Authorization: Bearer \<Token\>  
* **Output (JSON):**  
* JSON

{  
  "success": true,  
  "message": "Lấy dữ liệu lý thuyết thành công",  
  "data": {  
    "stageId": "s3",  
    "title": "DOM Selector",  
    "contentHtml": "\<h1\>DOM Selector là gì?\</h1\>\<p\>Document Object Model...\</p\>",  
    "proTips": "Sử dụng querySelectorAll thay vì getElementsByClassName để linh hoạt hơn.",  
    "referenceLinks": \[  
      { "title": "MDN: Introduction to the DOM", "url": "https://...", "type": "doc" }  
    \]  
  }  
}

*   
* 

### **API 3: Xác nhận hoàn thành Lý thuyết & Mở khóa Bài tập**

Lưu trạng thái để lần sau user vào lại không bị khóa IDE.

* **Endpoint:** /api/v1/stages/:stageId/unlock-practice  
* **Method:** PATCH  
* **Input:**  
  * Path Params: stageId  
  * Headers: Authorization: Bearer \<Token\>  
* **Output (JSON):**  
* JSON

{  
  "success": true,  
  "message": "Đã mở khóa không gian bài tập",  
  "data": {  
    "stageId": "s3",  
    "isPracticeUnlocked": true  
  }  
}

*   
* 

### **API 4: Lấy danh sách Bài tập (Practice)**

Kéo 3 bài tập (Dễ/TB/Khó) của một Stage cụ thể để hiển thị lên Workspace.

* **Endpoint:** /api/v1/stages/:stageId/practices  
* **Method:** GET  
* **Input:**  
  * Path Params: stageId  
  * Headers: Authorization: Bearer \<Token\>  
* **Output (JSON):**  
* JSON

{  
  "success": true,  
  "message": "Lấy danh sách bài tập thành công",  
  "data": {  
    "stageId": "s3",  
    "exercises": \[  
      {  
        "id": "ex\_s3\_1",  
        "level": "easy",  
        "title": "Truy xuất phần tử theo ID",  
        "instruction": "Sử dụng document.getElementById...",  
        "boilerplateCode": {  
           "html": "\<div id='app'\>\</div\>",  
           "js": "const app \= // Code here;"  
        }  
      },  
      // ... (Bài Medium và Hard có format tương tự)  
    \]  
  }  
}

*   
* 

### **API 5: Nộp bài (Submit Code)**

Được gọi khi người dùng bấm "Chạy" hoặc "Nộp". Trả về kết quả pass/fail và tổng số sao hiện tại của Stage đó.

* **Endpoint:** /api/v1/exercises/:exerciseId/submit  
* **Method:** POST  
* **Input:**  
  * Path Params: exerciseId  
  * Headers: Authorization: Bearer \<Token\>  
  * Body (JSON):  
  * JSON

{  
  "submittedCode": {  
    "html": "\<div id='app'\>\</div\>",  
    "js": "const app \= document.getElementById('app');"  
  }  
}

*   
  *   
* **Output (JSON \- Case Pass):**  
* JSON

{  
  "success": true,  
  "message": "Chấm điểm thành công",  
  "data": {  
    "status": "passed",  
    "feedback": "Chính xác\! Test case đã vượt qua.",  
    "xpEarned": 50,  
    "stageUpdates": {  
      "stageId": "s3",  
      "totalEarnedStars": 1,   
      "isStageCompleted": false  
    }  
  }  
}

*   
*   
* **Output (JSON \- Case Code Sai / Lỗi):**  
* JSON

{  
  "success": false,  
  "errorCode": "TEST\_CASE\_FAILED",  
  "message": "Lỗi: Không tìm thấy biến 'app'. Vui lòng kiểm tra lại cú pháp khai báo.",  
  "data": {  
    "status": "failed",  
    "failedTestIndex": 1  
  }

* }  
* 

