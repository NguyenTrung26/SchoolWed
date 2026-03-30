# Hệ Thống Phụ Huynh VKU - Quản Lý Thông Tin Sinh Viên

Đây là một hệ thống quản lý thông tin sinh viên cho trường Đại học CNTT&TT Việt - Hàn (VKU) với backend Node.js/Express và database MySQL.

## 📋 Các Tính Năng

✅ **Quản lý thông tin sinh viên** - Tên, MSSV, lớp, ngành, khoa, v.v.
✅ **Quản lý điểm số** - Điểm tổng kết, điểm chi tiết từng học phần
✅ **Quản lý học phí** - Theo dõi tiền tệ đã nộp, còn nợ
✅ **Quản lý chuyên cần** - Ghi nhận số buổi vắng
✅ **Quản lý kỷ luật/Khen thưởng** - Theo dõi các quyết định kỷ luật hoặc khen thưởng
✅ **API RESTful** - Tất cả dữ liệu được truy cập thông qua API
✅ **Frontend động** - Trang web tự động tải dữ liệu từ database

## 🚀 Cài Đặt

### Yêu Cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Khởi động server:**
```bash
npm start
```

Server sẽ chạy trên: `http://localhost:3000`

3. **Mở trình duyệt:**
Truy cập `http://localhost:3000` để xem trang web

## ☁️ Deploy Lên Web (Render)

Repo đã có sẵn file `render.yaml` để deploy nhanh.

1. Push code lên GitHub.
2. Vào Render -> New + -> Blueprint.
3. Chọn repo này, Render sẽ tự đọc `render.yaml`.
4. Cấu hình các biến môi trường sau trong Render:
   - `DB_HOST`
   - `DB_PORT` (thường là `3306`)
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
5. Deploy và mở endpoint health check: `/api/health`.

Lưu ý:
- App dùng MySQL, không dùng SQLite.
- Dùng `.env.example` làm mẫu cấu hình môi trường.

## 📁 Cấu Trúc Thư Mục

```
SchoolWed/
├── package.json          # Dependencies & scripts
├── server.js             # Backend chính (Node.js/Express)
├── db.js                 # Cấu hình database
├── database.sql          # Schema database
├── README.md             # File này
└── public/
    └── index.html        # Frontend HTML
```

## 🗄️ Cơ Sở Dữ Liệu

### Các Bảng Chính

1. **students** - Thông tin sinh viên
   - student_id, full_name, date_of_birth, id_card, email, phone, photo_url
   - class, major, department, academic_year

2. **semesters** - Các học kỳ
   - semester_name, academic_year, start_date, end_date

3. **semester_grades** - Điểm tổng kết theo học kỳ
   - student_id, semester_id, gpa_4, gpa_10, classification
   - cumulative_gpa_4, cumulative_gpa_10

4. **courses** - Các học phần/môn học
   - course_name, course_code, credits, semester_id

5. **course_grades** - Điểm chi tiết từng học phần
   - student_id, course_id, attendance_score, assignment_score
   - midterm_score, final_score, final_score_10, letter_grade

6. **tuition_info** - Thông tin học phí
   - student_id, total_tuition, paid_amount, remaining_amount

7. **attendance** - Chuyên cần
   - student_id, semester_id, absences_count

8. **discipline** - Kỷ luật/Khen thưởng
   - student_id, type (reward/punishment), description, date_issued

## 🔌 API Endpoints

### Sinh Viên
- `GET /api/student/:studentId` - Lấy thông tin sinh viên
- `GET /api/students` - Lấy tất cả sinh viên
- `POST /api/student` - Thêm sinh viên mới
- `PUT /api/student/:studentId` - Cập nhật thông tin sinh viên

### Điểm Số
- `GET /api/grades/:studentId` - Lấy điểm tổng kết
- `GET /api/course-grades/:studentId` - Lấy điểm chi tiết
- `POST /api/grade` - Thêm điểm tổng kết
- `POST /api/course-grade` - Thêm điểm chi tiết

### Khác
- `GET /api/tuition/:studentId` - Lấy thông tin học phí
- `GET /api/attendance/:studentId/:semesterId` - Lấy info chuyên cần
- `GET /api/discipline/:studentId` - Lấy thông tin kỷ luật
- `POST /api/course` - Thêm học phần mới

## 📝 Ví Dụ Sử Dụng API

### Lấy thông tin sinh viên
```bash
curl http://localhost:3000/api/student/22IT313
```

### Thêm sinh viên mới
```bash
curl -X POST http://localhost:3000/api/student \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "22IT314",
    "full_name": "TÔN VĂN A",
    "date_of_birth": "2004-01-15",
    "id_card": "123456789",
    "email": "tona@vku.edu.vn",
    "phone": "0123456789",
    "class": "22SE2",
    "major": "Công nghệ phần mềm",
    "department": "Khoa Khoa học máy tính",
    "academic_year": "Khóa 2022"
  }'
```

### Cập nhật thông tin sinh viên
```bash
curl -X PUT http://localhost:3000/api/student/22IT313 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "PHẠM MINH TRÍ",
    "email": "tripm@vku.edu.vn"
  }'
```

## 🔧 Phát Triển

### Chế độ phát triển (với auto-reload)
```bash
npm run dev
```

Yêu cầu: `npm install -D nodemon`

### Tạo dữ liệu mẫu
Dữ liệu mẫu được tạo tự động khi khởi chạy server lần đầu tiên.

## 📱 Sử Dụng

1. **Lần đầu chạy:** Server sẽ tự động tạo database và thêm dữ liệu mẫu
2. **Mở `http://localhost:3000`:** Xem trang web
3. **Dữ liệu được tải động:** Trang web sẽ tự động lấy dữ liệu từ API

## ⚙️ Cách Thêm Sinh Viên Mới

### Cách 1: Sử dụng API
```bash
curl -X POST http://localhost:3000/api/student \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "22IT321",
    "full_name": "HỌ TÊN SINH VIÊN",
    "date_of_birth": "2004-06-06",
    "id_card": "123456789",
    "email": "email@vku.edu.vn",
    "phone": "0123456789",
    "class": "22SE1",
    "major": "Công nghệ phần mềm (Kỹ sư)",
    "department": "Khoa Khoa học máy tính",
    "academic_year": "Khóa 2022"
  }'
```

### Cách 2: Sửa code trong server.js
Thay đổi STUDENT_ID trong `public/index.html` để xem thông tin sinh viên khác

## 📞 Hỗ Trợ & Liên Hệ

Để thêm tính năng hoặc báo cáo lỗi, vui lòng liên hệ với ban quản trị hệ thống.

## 📄 Giấy Phép

MIT License - Tự do sử dụng cho mục đích giáo dục

---

**Lưu ý:** 
- Database chạy trên MySQL (theo biến môi trường)
- Tất cả dữ liệu được quản lý qua API
- Frontend tự động tải dữ liệu khi load trang
- Hỗ trợ CORS cho phép gọi API từ các domain khác
