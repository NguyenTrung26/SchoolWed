# ⚡ Quick Start (Bắt Đầu Nhanh)

Bạn muốn chạy hệ thống ngay? Làm theo 5 bước này! ⏱️

## 🚀 5 Bước Cài Đặt (2-3 phút)

### Bước 1: Mở Command Prompt
Nhấn `Win + R`, gõ `cmd`, Enter

### Bước 2: Đi Đến Thư Mục Dự Án
```bash
cd c:\Users\ASUS\Desktop\SchoolWed
```

### Bước 3: Cài Dependencies
```bash
npm install
```
(Chờ 1-2 phút cho hoàn tất)

### Bước 4: Khởi Động Server
```bash
npm start
```

Khi thấy dòng này = **THÀNH CÔNG** ✅
```
Server is running on http://localhost:3000
Connected to SQLite database
```

### Bước 5: Mở Trình Duyệt
- **Trang sinh viên**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html

---

## 📍 Bạn Sẽ Thấy

### Trang Sinh Viên (index.html)
- ✅ Thông tin sinh viên: PHẠM MINH TRÍ (22IT313)
- ✅ Điểm tổng kết 7 học kỳ
- ✅ Điểm chi tiết từng môn
- ✅ Thông tin học phí

### Admin Panel (admin.html)
- ✅ Tab "Sinh Viên" - Thêm/Xem sinh viên
- ✅ Tab "Điểm Số" - Thêm điểm
- ✅ Tab "Học Phí" - Quản lý học phí
- ✅ Tab "Học Phần" - Thêm môn học

---

## 🎓 Dữ Liệu Mẫu Đã Có

Khi khởi chạy lần đầu, 3 thứ sẽ tự được tạo:

✅ **1 Sinh Viên**: 22IT313 - PHẠM MINH TRÍ  
✅ **7 Học Kỳ**: 2022-2023 đến 2025-2026  
✅ **Điểm & Thông Tin**: Đã có sẵn  

---

## 🔧 Làm Gì Tiếp Theo?

### Thêm Sinh Viên Mới (Cách Dễ Nhất)

1. Truy cập: `http://localhost:3000/admin.html`
2. Tab **"Sinh Viên"**
3. Điền form (MSSV, Tên, Lớp, v.v.)
4. Nhấp **"Thêm Sinh Viên"**
5. Thấy thông báo "Thành công" = ✅

### Xem Thông Tin Sinh Viên Khác

1. Mở `public/index.html` (dùng text editor)
2. Tìm dòng: `const STUDENT_ID = '22IT313';`
3. Sửa thành: `const STUDENT_ID = '22IT314';` (hoặc MSSV khác)
4. Reload trang (F5)

### Thêm Điểm

1. `http://localhost:3000/admin.html`
2. Tab **"Điểm Số"**
3. Điền MSSV, ID Học kỳ, Điểm
4. Nhấp **"Thêm Điểm"**

---

## ⚠️ Nếu Có Lỗi

### Lỗi: "port 3000 already in use"
Có chương trình khác dùng port 3000:
```bash
# Thử port khác
npm start -- --port=3001
```
Rồi vào: `http://localhost:3001`

### Lỗi: "Cannot find module"
Cài lại dependencies:
```bash
npm install
```

### Lỗi khác
1. Đóng Command Prompt
2. Xóa thư mục `node_modules`
3. Xóa file `school.db`
4. Chạy lại `npm install` → `npm start`

---

## 🌍 Các URL Chính

| URL | Tác Dụng |
|-----|---------|
| `http://localhost:3000` | Trang sinh viên |
| `http://localhost:3000/admin.html` | Admin panel |
| `http://localhost:3000/api/students` | API - danh sách sinh viên |

---

## 📚 Tài Liệu Chi Tiết

Khi cần thêm thông tin:
- 📖 **README.md** - Tổng quan & API
- 📖 **SETUP_GUIDE.md** - Hướng dẫn chi tiết
- 📖 **FILE_STRUCTURE.md** - Giải thích cách hoạt động
- 📖 **SQL_REFERENCE.md** - SQL queries

---

## ✅ Checklist

- [ ] Cài Node.js (nếu chưa)
- [ ] `npm install`
- [ ] `npm start`
- [ ] Vào http://localhost:3000
- [ ] Thấy dữ liệu sinh viên
- [ ] Vào admin panel
- [ ] Thêm sinh viên mới
- [ ] ✅ Done!

---

## 🎉 Xong!

Bây giờ bạn có một hệ thống quản lý sinh viên hoàn chỉnh! 🚀

**Cần giúp?** Xem các file README & SETUP_GUIDE

---

**Happy coding!** 💻🎓
