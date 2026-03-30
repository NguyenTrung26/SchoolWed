const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Tạo bảng sinh viên
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            date_of_birth DATE,
            id_card TEXT UNIQUE,
            email TEXT UNIQUE,
            phone TEXT,
            photo_url TEXT,
            class TEXT,
            major TEXT,
            department TEXT,
            academic_year TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tạo bảng học kỳ
        db.run(`CREATE TABLE IF NOT EXISTS semesters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            semester_name TEXT UNIQUE NOT NULL,
            academic_year TEXT,
            start_date DATE,
            end_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tạo bảng điểm tổng kết
        db.run(`CREATE TABLE IF NOT EXISTS semester_grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            semester_id INTEGER NOT NULL,
            gpa_4 REAL,
            gpa_10 REAL,
            classification TEXT,
            cumulative_gpa_4 REAL,
            cumulative_gpa_10 REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        // Tạo bảng học phần
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_name TEXT NOT NULL,
            course_code TEXT UNIQUE,
            credits INTEGER,
            semester_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        // Tạo bảng điểm chi tiết lớp học phần
        db.run(`CREATE TABLE IF NOT EXISTS course_grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            course_id INTEGER NOT NULL,
            attempt_number INTEGER DEFAULT 1,
            attendance_score REAL,
            assignment_score REAL,
            midterm_score REAL,
            final_score REAL,
            final_score_10 REAL,
            letter_grade TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // Tạo bảng thông tin học phí
        db.run(`CREATE TABLE IF NOT EXISTS tuition_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            total_tuition REAL,
            paid_amount REAL,
            remaining_amount REAL,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )`);

        // Tạo bảng chuyên cần
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            semester_id INTEGER NOT NULL,
            absences_count INTEGER DEFAULT 0,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        // Tạo bảng khen thưởng kỷ luật
        db.run(`CREATE TABLE IF NOT EXISTS discipline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            type TEXT,
            description TEXT,
            date_issued DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )`, () => {
            insertSampleData();
        });
    });
}

function insertSampleData() {
    db.serialize(() => {
        // Kiểm tra xem dữ liệu đã tồn tại chưa
        db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
            if (err) {
                console.error('Error checking students', err);
                return;
            }

            if (row.count === 0) {
                console.log('Inserting sample data...');

                // Thêm sinh viên
                db.run(
                    `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    ['22IT313', 'PHẠM MINH TRÍ', '2004-06-06', '046204001193', 'tripm.22it@vku.udn.vn', '0333736158', 
                    'https://daotao.vku.udn.vn/uploads/sinhvien/22IT313.jpg', '22SE1', 'Công nghệ phần mềm (Kỹ sư)', 
                    'Khoa Khoa học máy tính', 'Khóa 2022']
                );

                // Thêm học kỳ
                const semesters = [
                    { name: 'Học kỳ 1, năm 2022 - 2023', year: '2022 - 2023' },
                    { name: 'Học kỳ 2, năm 2022 - 2023', year: '2022 - 2023' },
                    { name: 'Học kỳ 1, năm 2023 - 2024', year: '2023 - 2024' },
                    { name: 'Học kỳ 2, năm 2023 - 2024', year: '2023 - 2024' },
                    { name: 'Học kỳ 1, năm 2024 - 2025', year: '2024 - 2025' },
                    { name: 'Học kỳ 2, năm 2024 - 2025', year: '2024 - 2025' },
                    { name: 'Học kỳ 1, năm 2025 - 2026', year: '2025 - 2026' }
                ];

                semesters.forEach(sem => {
                    db.run(
                        `INSERT INTO semesters (semester_name, academic_year) VALUES (?, ?)`,
                        [sem.name, sem.year]
                    );
                });

                // Thêm điểm tổng kết
                const grades = [
                    { semester: 1, gpa4: 3.28, gpa10: 8.24, classification: 'Giỏi', cum_gpa4: 3.28, cum_gpa10: 8.24 },
                    { semester: 2, gpa4: 3.06, gpa10: 7.77, classification: 'Khá', cum_gpa4: 3.17, cum_gpa10: 8.01 },
                    { semester: 3, gpa4: 3.06, gpa10: 7.51, classification: 'Khá', cum_gpa4: 3.13, cum_gpa10: 7.85 },
                    { semester: 4, gpa4: 2.83, gpa10: 7.34, classification: 'Khá', cum_gpa4: 3.06, cum_gpa10: 7.72 },
                    { semester: 5, gpa4: 2.95, gpa10: 7.56, classification: 'Khá', cum_gpa4: 3.03, cum_gpa10: 7.68 },
                    { semester: 6, gpa4: 2.79, gpa10: 7.37, classification: 'Khá', cum_gpa4: 2.99, cum_gpa10: 7.63 },
                    { semester: 7, gpa4: 3.43, gpa10: 8.07, classification: 'Giỏi', cum_gpa4: 3.06, cum_gpa10: 7.7 }
                ];

                grades.forEach(grade => {
                    db.run(
                        `INSERT INTO semester_grades (student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        ['22IT313', grade.semester, grade.gpa4, grade.gpa10, grade.classification, grade.cum_gpa4, grade.cum_gpa10]
                    );
                });

                // Thêm thông tin học phí
                db.run(
                    `INSERT INTO tuition_info (student_id, total_tuition, paid_amount, remaining_amount)
                    VALUES (?, ?, ?, ?)`,
                    ['22IT313', 7964800, 7964800, 0]
                );

                // Thêm chuyên cần
                db.run(
                    `INSERT INTO attendance (student_id, semester_id, absences_count)
                    VALUES (?, ?, ?)`,
                    ['22IT313', 1, 3]
                );

                console.log('Sample data inserted successfully!');
            }
        });
    });
}

module.exports = db;
