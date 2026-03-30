# 🗄️ HƯỚNG DẪN THIẾT LẬP MYSQL

## 📥 **Cách 1: Cài Đặt MySQL (Windows)**

### A. Tải MySQL Server:
1. Vào: https://www.mysql.com/downloads/
2. Chọn **MySQL Community Server**
3. Tải bản Windows installer
4. Chạy installer và cài đặt

### B. Cấu Hình Khi Cài:
- **Port**: `3306` (mặc định)
- **Username**: `root`
- **Password**: `set your password` (nhớ password này)
- **Create Server**: Chọn "Yes"

---

## 🟡 **Cách 2: Cài Nhanh Với XAMPP (DỄ NHẤT)**

### A. Tải XAMPP:
1. Vào: https://www.apachefriends.org/
2. Tải **XAMPP for Windows**
3. Cài đặt vào `C:\xampp`

### B. Khởi Động MySQL:
1. Mở **XAMPP Control Panel**
2. Nhấp "Start" cho **Apache** và **MySQL**
3. MySQL đang chạy trên port `3306`
4. Username: `root`
5. Password: (trống - không có password)

---

## ⚙️ **BƯỚC 1: Tạo Database**

### Mở MySQL Command Line:

**Cách A: Sử dụng Command Prompt**
```bash
mysql -u root -p
# Nếu có password, nhập password sau

# Hoặc với XAMPP (password trống):
mysql -u root
```

**Cách B: Sử dụng phpMyAdmin (Dễ hơn)**
- Nếu dùng XAMPP: http://localhost/phpmyadmin
- Tạo sẵn database từ giao diện

### Tạo Database & User:

```sql
-- Tạo database
CREATE DATABASE school_management;

-- Tạo user mới (tùy chọn)
CREATE USER 'school_admin'@'localhost' IDENTIFIED BY 'password123';

-- Cấp quyền
GRANT ALL PRIVILEGES ON school_management.* TO 'school_admin'@'localhost';
FLUSH PRIVILEGES;

-- Hoặc dùng user root (không nên dùng cho production)
USE school_management;
```

---

## 🔧 **BƯỚC 2: Cập Nhật File .env**

Mở file `.env` trong thư mục `SchoolWed` và cấu hình:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management

# Nếu XAMPP (password trống):
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
```

**Lưu ý:** Thay `your_mysql_password` bằng password thực tế của bạn

---

## 📦 **BƯỚC 3: Cài Dependencies**

Mở **Command Prompt / PowerShell** trong thư mục `SchoolWed`:

```bash
# Cài mysql2 package
npm install

# Cài lại nếu lỗi
rm -r node_modules
npm install
```

---

## 🚀 **BƯỚC 4: Khởi Động Server**

```bash
npm start
```

Bạn sẽ thấy:
```
✅ Server is running on http://localhost:3000
📊 Database: MySQL - school_management
Initializing MySQL database...
✅ Database tables initialized successfully!
Inserting sample data...
✅ Sample data inserted successfully!
```

---

## 🌐 **BƯỚC 5: Kiểm Tra**

### 1. Truy cập trang web:
- **Sinh viên**: http://localhost:3000
- **Admin**: http://localhost:3000/admin.html

### 2. Kiểm tra dữ liệu trong MySQL:

**Qua phpMyAdmin:**
1. http://localhost/phpmyadmin (nếu XAMPP)
2. Chọn database `school_management`
3. Xem các bảng và dữ liệu

**Hoặc qua Command Line:**
```bash
mysql -u root -p school_management

# Xem các bảng
SHOW TABLES;

# Xem sinh viên
SELECT * FROM students;

# Xem điểm
SELECT * FROM semester_grades;
```

---

## ⚠️ **Nếu Gặp Lỗi**

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
❌ MySQL chưa chạy

**Giải pháp:**
```bash
# Nếu XAMPP: Bật MySQL từ Control Panel
# Hoặc chạy lệnh:
net start MySQL80  # (hoặc MySQL57, tùy version)
```

### Error: "Access denied for user 'root'@'localhost'"
❌ Password sai hoặc user không tồn tại

**Giải pháp:**
- Kiểm tra password trong `.env`
- Đối với XAMPP, password mặc định là trống (để trống)

### Error: "Unknown database 'school_management'"
❌ Database chưa tạo

**Giải pháp:**
```bash
mysql -u root -p
CREATE DATABASE school_management;
EXIT;
```

---

## 📊 **Dữ Liệu Được Tạo**

Khi server khởi động, MySQL sẽ tự động:
- ✅ Tạo database `school_management`
- ✅ Tạo 8 bảng (students, semester_grades, v.v.)
- ✅ Thêm dữ liệu mẫu (1 sinh viên, 7 học kỳ, v.v.)

---

## 🔍 **Xem Dữ Liệu**

### Via API (Dễ nhất):
```bash
# Tất cả sinh viên
http://localhost:3000/api/students

# Một sinh viên
http://localhost:3000/api/student/22IT313

# Điểm
http://localhost:3000/api/grades/22IT313
```

### Via MySQL Workbench (Chuyên nghiệp):
1. Tải: MySQL Workbench (miễn phí)
2. Kết nối tới localhost:3306
3. Browse database

### Via phpMyAdmin (Nếu XAMPP):
http://localhost/phpmyadmin

---

## 💾 **Backup Database**

### Backup:
```bash
mysqldump -u root -p school_management > backup.sql
# (Nhập password nếu có)
```

### Restore:
```bash
mysql -u root -p school_management < backup.sql
```

---

## 🎉 **Xong!**

Bây giờ dữ liệu của bạn được lưu trong **MySQL** thay vì SQLite!

**Các lợi ích:**
✅ Capacity lớn hơn  
✅ Performance tốt hơn  
✅ Phù hợp cho production  
✅ Dễ backup/restore  
✅ Hỗ trợ multiple users  

---

## 📞 **Cần Giúp?**

Nếu gặp lỗi:
1. Kiểm tra MySQL có chạy không
2. Kiểm tra password trong `.env`
3. Kiểm tra database đã tạo chưa
4. Xem terminal error message chi tiết
