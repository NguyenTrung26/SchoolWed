# ⚡ QUICK SWITCH TO MYSQL (5 PHÚT)

## 🎯 TÓM TẮT

Bạn muốn dữ liệu lưu trong **MySQL thay vì SQLite**? 
Làm theo 5 bước này!

---

## 🚀 **5 BƯỚC CHUYỂN SANG MYSQL**

### ✅ BƯỚC 1: Cài MySQL (Nếu chưa có)
**Tùy chọn A - XAMPP (DỄ NHẤT)**
1. Tải: https://www.apachefriends.org/
2. Cài vào `C:\xampp`
3. Bật MySQL từ XAMPP Control Panel
4. Username: `root` | Password: (trống)

**Tùy chọn B - MySQL Riêng**
1. Tải: https://www.mysql.com/downloads/
2. Cài đặt và nhớ password

---

### ✅ BƯỚC 2: Tạo Database

**Dùng XAMPP (dễ nhất):**
1. Vào: http://localhost/phpmyadmin
2. Click "Databases"
3. Tạo database mới: `school_management`
4. Xong!

**Hoặc Command Line:**
```bash
mysql -u root
# Nếu XAMPP, password trống
# Nếu MySQL riêng, thêm -p và nhập password

# Khi vào MySQL:
CREATE DATABASE school_management;
EXIT;
```

---

### ✅ BƯỚC 3: Cập Nhật File `.env`

Mở file: `c:\Users\ASUS\Desktop\SchoolWed\.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
PORT=3000
NODE_ENV=development
```

**Nếu MySQL riêng (có password):**
```env
DB_PASSWORD=your_password_here
```

**XAMPP (password trống - giữ nguyên)**

---

### ✅ BƯỚC 4: Cài Dependencies

Mở **Command Prompt** trong thư mục `SchoolWed`:

```bash
npm install
```

(Lần đầu sẽ tải mysql2 package)

---

### ✅ BƯỚC 5: Chạy Server

```bash
npm start
```

**Khi thấy dòng này = THÀNH CÔNG ✅**
```
✅ Server is running on http://localhost:3000
📊 Database: MySQL - school_management
✅ Database tables initialized successfully!
```

---

## 🌐 **BƯỚC 6: Vào Trang Web**

- **Sinh viên**: http://localhost:3000
- **Admin**: http://localhost:3000/admin.html

**Dữ liệu lúc này được lưu trong MySQL!** 🎉

---

## 🔍 **KIỂM TRA DỮ LIỆU**

### Via phpMyAdmin (Dễ nhất):
1. http://localhost/phpmyadmin
2. Chọn database `school_management`
3. Xem các bảng

### Via API:
```
http://localhost:3000/api/students
```

---

## ⚠️ **TROUBLESHOOTING**

### Lỗi: "connect ECONNREFUSED"
```bash
# MySQL chưa chạy
# Nếu XAMPP: Bật MySQL từ Control Panel
# Hoặc:
net start MySQL80
```

### Lỗi: "Access denied"
```
Kiểm tra:
- DB_USER đúng không? (thường là root)
- DB_PASSWORD đúng không?
- Nếu XAMPP, password phải để trống
```

### Lỗi: "Unknown database"
```bash
# Tạo database:
mysql -u root
CREATE DATABASE school_management;
EXIT;
```

---

## 📊 **So Sánh: SQLite vs MySQL**

| Tính Năng | SQLite | MySQL |
|-----------|--------|-------|
| **File** | school.db | Database Server |
| **Dữ liệu lưu ở** | File tĩnh | MySQL Server |
| **Dung lượng** | ❌ Giới hạn | ✅ Không giới hạn |
| **Performance** | ❌ Chậm (dữ liệu lớn) | ✅ Nhanh |
| **Multi-user** | ❌ Không | ✅ Có |
| **Production** | ❌ Không nên | ✅ Phù hợp |

---

## ✨ **LỢI ÍCH CỦA MySQL**

✅ **Lưu ở server** - Không lo file bị xóa  
✅ **Backup dễ** - Dùng mysqldump  
✅ **Performance tốt** - Xử lý nhanh dữ liệu lớn  
✅ **Production-ready** - Sẵn sàng triển khai  
✅ **Remote access** - Có thể kết nối từ xa  

---

## 🎓 **NEXT STEPS**

1. ✅ Chuyển sang MySQL (bạn đang làm)
2. ⏭️ Thêm sinh viên mới qua Admin Panel
3. ⏭️ Cập nhật điểm & thông tin
4. ⏭️ Xem dữ liệu trong phpMyAdmin

---

## 💡 **TIPS**

### Để xem dữ liệu SQLite cũ (nếu cần):
```bash
# File cũ vẫn ở đây:
# c:\Users\ASUS\Desktop\SchoolWed\school.db

# Để chuyển dữ liệu từ SQLite sang MySQL:
# Cần export từ school.db rồi import vào MySQL
# (Phức tạp - không cần làm)
```

### Để backup MySQL:
```bash
mysqldump -u root -p school_management > backup.sql
```

---

## 🎉 **XONG!**

Bây giờ hệ thống của bạn sử dụng **MySQL** - 
phù hợp cho production! 🚀

**Mọi dữ liệu sẽ được lưu trên MySQL Server,**
**không phải trong file SQLite nữa!** 📊

---

**Cần giúp?** Xem file `MYSQL_SETUP.md` để chi tiết hơn! 📖
