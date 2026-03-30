# 📂 Cấu Trúc Thư Mục & Tệp

```
SchoolWed/
├── package.json              ← Node.js configuration
├── server.js                 ← Main backend (Node.js/Express)
├── db.js                     ← Database initialization (DEPRECATED - integrated in server.js)
├── database.sql              ← SQL schema reference
│
├── README.md                 ← Documentation
├── SETUP_GUIDE.md            ← Installation & usage guide
├── FILE_STRUCTURE.md         ← This file
├── .gitignore                ← Git ignore rules
│
├── public/                   ← Frontend files (static)
│   ├── index.html            ← Main student page (dynamic)
│   └── admin.html            ← Admin panel (management)
│
├── node_modules/             ← Dependencies (created by npm install)
│   ├── express/
│   ├── sqlite3/
│   ├── cors/
│   └── ... (others)
│
└── school.db                 ← Database file (created automatically)
```

## 📝 Mô Tả Các Tệp Quan Trọng

### 🖥️ Backend

#### **server.js** (Có vai trò như một máy chủ)
- **Chức năng chính**: Khởi chạy server Express trên port 3000
- **Những gì nó làm**:
  - Tạo các bảng database nếu chưa tồn tại
  - Thêm dữ liệu mẫu lần đầu chạy
  - Cung cấp các API endpoints
  - Phục vụ các file HTML tĩnh

**Các endpoint API chính**:
```
GET  /api/student/:id          - Truy xuất thông tin sinh viên
POST /api/student              - Tạo sinh viên mới
PUT  /api/student/:id          - Cập nhật sinh viên
GET  /api/grades/:id           - Xem điểm
POST /api/grade                - Thêm điểm
... và nhiều endpoint khác
```

#### **db.js**
- File cũ (đã được tích hợp vào server.js)
- Không sử dụng nữa nhưng có thể giữ lại

#### **database.sql**
- Chứa SQL schemas (structure các bảng)
- Dùng làm tài liệu tham khảo
- Các bảng này được tạo tự động bởi server.js

### 🎨 Frontend

#### **public/index.html** (Trang sinh viên - CHÍNH)
- HTML động với JavaScript
- **Chức năng**:
  - Hiển thị thông tin sinh viên
  - Hiển thị điểm tổng kết
  - Hiển thị điểm chi tiết các môn học
  - Hiển thị thông tin học phí & chuyên cần
- **Cách hoạt động**:
  - Load page
  - JavaScript tự động gọi API `/api/student/22IT313`
  - Lấy dữ liệu và hiển thị lên

#### **public/admin.html** (Admin Panel)
- Cho phép quản trị viên:
  - Thêm sinh viên mới
  - Thêm/cập nhật điểm
  - Quản lý học phí
  - Thêm/quản lý học phần
  - Xem danh sách sinh viên

### ⚙️ Cấu Hình

#### **package.json**
```json
{
  "name": "school-web-system",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",        // Chạy server bình thường
    "dev": "nodemon server.js"         // Chạy với auto-reload
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  }
}
```

#### **.gitignore**
- Quy định file nào không được lưu vào Git
- Ví dụ: `node_modules/`, `school.db`, `.env`

### 📚 Tài Liệu

#### **README.md**
- Tổng quan về dự án
- API reference
- Ví dụ sử dụng

#### **SETUP_GUIDE.md**
- Hướng dẫn cài đặt chi tiết
- Cách thêm sinh viên
- Khắc phục lỗi

#### **FILE_STRUCTURE.md**
- File bạn đang đọc
- Giải thích từng tệp

---

## 🔄 Quy Trình Hoạt Động

### Khi người dùng vào trang sinh viên (`index.html`):

```
1. Trình duyệt tải index.html
   ↓
2. JavaScript chạy hàm initializeData()
   ↓
3. Gọi API GET /api/student/22IT313
   ↓
4. Server truy vấn database
   ↓
5. Trả về dữ liệu JSON
   ↓
6. JavaScript hiển thị dữ liệu lên trang
   ↓
7. Người dùng thấy thông tin sinh viên
```

### Khi admin thêm sinh viên qua admin.html:

```
1. Admin điền form
   ↓
2. Nhấp "Thêm Sinh Viên"
   ↓
3. JavaScript POST tới /api/student
   (kèm dữ liệu JSON)
   ↓
4. Server nhận request
   ↓
5. Server chèn vào database
   ↓
6. Trả về kết quả
   ↓
7. Admin thấy thông báo "Thành công"
   ↓
8. Dữ liệu lưu vào database
```

---

## 🗄️ Database (school.db)

SQLite database với các bảng:

| Bảng | Tác Dụng |
|------|---------|
| **students** | Lưu info sinh viên (MSSV, tên, email, v.v.) |
| **semesters** | Lưu các học kỳ (Học kỳ 1 2022-2023, v.v.) |
| **semester_grades** | Điểm tổng kết mỗi học kỳ |
| **courses** | Danh sách các học phần/môn học |
| **course_grades** | Điểm chi tiết từng môn |
| **tuition_info** | Thông tin học phí |
| **attendance** | Chuyên cần (số buổi vắng) |
| **discipline** | Kỷ luật & khen thưởng |

---

## 🚀 Lệnh quan trọng

### Cài đặt
```bash
npm install
```
→ Cài tất cả dependencies

### Chạy Server
```bash
npm start
```
→ Khởi chạy server trên port 3000

### Chạy với Auto-Reload (phát triển)
```bash
npm run dev
```
→ Server tự động restart khi sửa code

### Dừng Server
```
Ctrl + C
```

---

## 🔗 Các URL Chính

| URL | Mục Đích |
|-----|---------|
| `http://localhost:3000` | Trang sinh viên (hiển thị dữ liệu) |
| `http://localhost:3000/admin.html` | Bảng điều khiển admin |
| `http://localhost:3000/api/student/22IT313` | API - lấy info sinh viên |
| `http://localhost:3000/api/grades/22IT313` | API - lấy điểm |

---

## 📱 Cách Thay Đổi Sinh Viên Hiển Thị

Mở `public/index.html` và tìm dòng:

```javascript
const STUDENT_ID = '22IT313';
```

Đổi thành MSSV khác, ví dụ:

```javascript
const STUDENT_ID = '22IT314';
```

Reload trang để thấy dữ liệu sinh viên mới!

---

## 💡 Mẹo Hữu Ích

1. **Xem Database trực tiếp**: Tải DB Browser for SQLite
2. **Test API**: Sử dụng Postman hoặc curl
3. **Lưu git**: Chạy `git init` và `git add .`
4. **Sửa dữ liệu**: Dùng admin panel hoặc API trực tiếp

---

**Bây giờ bạn hiểu cấu trúc của hệ thống rồi!** 🎓
