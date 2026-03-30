# 🔄 THAY ĐỔI TỬ SQLITE SANG MYSQL

## 📝 **TÓM TẮT CÁC FILE ĐÃ THAY ĐỔI/TẠO**

### 1️⃣ **File Cập Nhật:**

#### ✏️ `package.json`
- ❌ Xóa: `"sqlite3": "^5.1.6"`
- ✅ Thêm: `"mysql2": "^3.6.0"` (kết nối MySQL)
- ✅ Thêm: `"dotenv": "^16.0.3"` (đọc file .env)

#### ✏️ `server.js`
- ❌ Xóa: Toàn bộ code sử dụng SQLite
- ✅ Thêm: Code sử dụng MySQL
- ✅ Sử dụng: `mysql-db.js` để kết nối & tạo bảng

---

### 2️⃣ **File Tạo Mới:**

#### ✨ `.env` (Cấu Hình MySQL)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
```

#### ✨ `mysql-db.js` (Kết Nối & Tạo Bảng)
- Kết nối tới MySQL server
- Tạo tất cả bảng nếu chưa có
- Thêm dữ liệu mẫu

#### ✨ `MYSQL_SETUP.md` (Hướng Dẫn Chi Tiết)
- Cách cài MySQL
- Cách tạo database
- Troubleshooting

#### ✨ `MYSQL_QUICK_START.md` (Nhanh 5 Phút)
- Cách nhanh nhất để setup
- Checklist 5 bước

---

## 🎯 **NƯỚC CHẢY DỮ LIỆU**

### Trước (SQLite):
```
Admin Panel (HTML/JS) 
    ↓
Express API (server.js)
    ↓
SQLite Database (school.db - FILE)
```

### Sau (MySQL):
```
Admin Panel (HTML/JS)
    ↓
Express API (server.js)
    ↓
MySQL Database (MySQL Server - DATABASE)
```

---

## 📦 **CÔNG VIỆC CÒN LẠI**

Bạn cần làm:

1. ✅ **Cài MySQL** (XAMPP hoặc MySQL riêng)
2. ✅ **Tạo database** `school_management`
3. ✅ **Cập nhật `.env`** (set DB_PASSWORD)
4. ✅ **Chạy** `npm install`
5. ✅ **Chạy** `npm start`
6. ✅ **Vào** http://localhost:3000

---

## 🔗 **KẾT NỐI DATABASE**

### Cấu Hình (file `.env`):
```
DB_HOST=localhost      # Nơi MySQL chạy
DB_PORT=3306           # Port mặc định MySQL
DB_USER=root           # Username
DB_PASSWORD=           # Password (trống nếu XAMPP)
DB_NAME=school_management  # Database name
```

### Tệp Kết Nối (`mysql-db.js`):
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

---

## 📊 **CÁC BẢNG MYSQL TỰ TẠO**

Khi server khởi động, tất cả bảng này sẽ được tạo tự động:

1. **students** - Thông tin sinh viên
2. **semesters** - Các học kỳ
3. **semester_grades** - Điểm tổng kết
4. **courses** - Các môn học
5. **course_grades** - Điểm chi tiết
6. **tuition_info** - Thông tin học phí
7. **attendance** - Chuyên cần
8. **discipline** - Kỷ luật/Khen

---

## 🚀 **HÀNH ĐỘNG TIẾP THEO**

### Step 1: Cài MySQL (nếu chưa có)
👉 Xem: MYSQL_SETUP.md

### Step 2: Cập nhật .env
👉 Tìm file `.env` và sửa password

### Step 3: Cài npm packages
```bash
npm install
```

### Step 4: Chạy server
```bash
npm start
```

### Step 5: Kiểm tra
- Vào: http://localhost:3000
- Xem dữ liệu có không

---

## 💡 **LƯỚI ƯỞNG ĐIỂM**

### ✅ Ưu Điểm MySQL:
- **Dữ liệu lưu trên server** - An toàn hơn
- **Performance tốt** - Xử lý nhanh
- **Scalable** - Có thể mở rộng
- **Production-ready** - Sẵn sàng triển khai online

### ❌ Nhược Điểm SQLite:
- **Dữ liệu ở file** - Dễ bị xóa
- **Performance kém** - Chậm khi dữ liệu lớn
- **Không phù hợp đa user** - Xung đột truy cập

---

## 📁 **CÁC FILE HIỆN CÓ**

```
SchoolWed/
├── .env                    ← ✨ Mới (MySQL config)
├── mysql-db.js            ← ✨ Mới (MySQL connection)
├── server.js              ← ✏️ Cập nhật (dùng MySQL)
├── package.json           ← ✏️ Cập nhật (thêm mysql2)
├── MYSQL_SETUP.md         ← ✨ Mới (hướng dẫn chi tiết)
├── MYSQL_QUICK_START.md   ← ✨ Mới (nhanh 5 phút)
├── public/
│   ├── index.html
│   └── admin.html
└── ... (các file khác)
```

---

## 🎯 **KIỂM TRA TỪ TỪNG BƯỚC**

### Bước 1: Kiểm tra MySQL chạy
```bash
mysql -u root
# Nếu thấy "mysql>" = OK
EXIT;
```

### Bước 2: Kiểm tra database tạo được
```bash
mysql -u root school_management
# Nếu thấy "mysql>" = OK
EXIT;
```

### Bước 3: Kiểm tra npm install thành công
```bash
npm list mysql2
# Nếu thấy phiên bản = OK
```

### Bước 4: Kiểm tra server chạy
```bash
npm start
# Nếu thấy "✅ Server is running" = OK
```

### Bước 5: Kiểm tra trang web
```
http://localhost:3000
# Nếu thấy dữ liệu = ✅ THÀNH CÔNG
```

---

## 🔐 **LƯU Ý BẢNG MÀT**

### ⚠️ KHÔNG LÀM NÀY:
- ❌ Để password trong code
- ❌ Commit file `.env` lên Git
- ❌ Chia sẻ password MySQL với người khác

### ✅ NÊN LÀM:
- ✅ Lưu password trong `.env`
- ✅ Đưa `.env` vào `.gitignore`
- ✅ Dùng strong password cho production

---

## 📞 **CÓ VẤN ĐỀ?**

1. 👉 Xem: **MYSQL_SETUP.md** (chi tiết từng bước)
2. 👉 Xem: **MYSQL_QUICK_START.md** (nhanh 5 phút)
3. 👉 Kiểm tra error message trong terminal
4. 👉 Xác nhận MySQL có chạy không

---

## 🎉 **TÓNG LẠI**

| Thành Phần | Trước | Sau |
|-----------|-------|-----|
| **Database** | SQLite (file) | MySQL (server) |
| **Lưu ở** | school.db | MySQL Server |
| **Phù hợp** | Phát triển | Production |
| **Performance** | Chậm (lớn) | Nhanh |

---

**Bây giờ bạn sẵn sàng để chuyển sang MySQL!** 🚀

**Hành động tiếp theo:** Chạy `npm install` 📦
