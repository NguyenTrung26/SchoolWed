const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database
async function initializeDatabase() {
    const connection = await pool.getConnection();
    
    try {
        console.log('Initializing MySQL database...');
        
        // Create tables
        await connection.query(`CREATE TABLE IF NOT EXISTS students (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            date_of_birth DATE,
            id_card VARCHAR(20) UNIQUE,
            email VARCHAR(100) UNIQUE,
            phone VARCHAR(20),
            photo_url VARCHAR(500),
            class VARCHAR(50),
            major VARCHAR(255),
            department VARCHAR(255),
            academic_year VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS semesters (
            id INT PRIMARY KEY AUTO_INCREMENT,
            semester_name VARCHAR(255) UNIQUE NOT NULL,
            academic_year VARCHAR(50),
            start_date DATE,
            end_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS semester_grades (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50),
            semester_id INT,
            gpa_4 DECIMAL(5,2),
            gpa_10 DECIMAL(5,2),
            classification VARCHAR(50),
            cumulative_gpa_4 DECIMAL(5,2),
            cumulative_gpa_10 DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS courses (
            id INT PRIMARY KEY AUTO_INCREMENT,
            course_name VARCHAR(255) NOT NULL,
            course_code VARCHAR(50) UNIQUE,
            credits INT,
            semester_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS course_grades (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50),
            course_id INT,
            attempt_number INT DEFAULT 1,
            attendance_score DECIMAL(5,2),
            assignment_score DECIMAL(5,2),
            midterm_score DECIMAL(5,2),
            final_score DECIMAL(5,2),
            final_score_10 DECIMAL(5,2),
            letter_grade VARCHAR(5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS tuition_info (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50) UNIQUE,
            total_tuition DECIMAL(15,2),
            paid_amount DECIMAL(15,2),
            remaining_amount DECIMAL(15,2),
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS attendance (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50),
            semester_id INT,
            absences_count INT DEFAULT 0,
            notes VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS discipline (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50),
            type VARCHAR(50),
            description VARCHAR(500),
            date_issued DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS parent_accounts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_id VARCHAR(50) UNIQUE NOT NULL,
            parent_name VARCHAR(255),
            parent_phone VARCHAR(20) UNIQUE NOT NULL,
            parent_password VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
        )`);

        // Backward-compatible migration for environments created before parent_name existed.
        const [parentNameColumn] = await connection.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'parent_accounts'
              AND COLUMN_NAME = 'parent_name'
        `);
        if (!parentNameColumn || parentNameColumn.length === 0) {
            await connection.query(`ALTER TABLE parent_accounts ADD COLUMN parent_name VARCHAR(255) NULL`);
        }

        console.log('✅ Database tables initialized successfully!');
        
        // Insert sample data
        await insertSampleData(connection);
        await ensureParentAccounts(connection);
        await ensureAdditionalStudentGrades(connection);
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
    } finally {
        connection.release();
    }
}

async function insertSampleData(connection) {
    try {
        // Check if student already exists
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM students');
        
        if (rows[0].count === 0) {
            console.log('Inserting sample data...');
            
            // Insert student
            await connection.query(
                `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['24IT111', 'PHẠM MINH TRÍ', '2004-06-06', '001111222333', 'tripm.24it@vku.udn.vn', '0333736158',
                'https://daotao.vku.udn.vn/uploads/sinhvien/22IT313.jpg', '24SE1', 'Công nghệ phần mềm (Kỹ sư)',
                'Khoa Khoa học máy tính', 'Khóa 2022']
            );

            // Insert student 2
            await connection.query(
                `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['24IT222', 'TRẦN VĂN TEST', '2004-09-02', '002222333444', 'testtv.24it@vku.udn.vn', '0905999888',
                'https://i.pravatar.cc/300?img=12', '24SE2', 'Kỹ thuật phần mềm',
                'Khoa Khoa học máy tính', 'Khóa 2022']
            );

            // Insert student 3
            await connection.query(
                `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['24IT333', 'LÊ VĂN HOÀNG', '2004-10-10', '003333444555', 'hoanglv.24it@vku.udn.vn', '0901234567',
                'https://i.pravatar.cc/300?img=15', '24SE3', 'Khoa học Dữ liệu',
                'Khoa Khoa học máy tính', 'Khóa 2022']
            );

            // Insert student 4
            await connection.query(
                `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['24IT444', 'NGUYỄN THỊ MAI', '2004-12-20', '004444555666', 'maint.24it@vku.udn.vn', '0912345678',
                'https://i.pravatar.cc/300?img=5', '24SE4', 'An toàn thông tin',
                'Khoa Khoa học máy tính', 'Khóa 2022']
            );

            // Insert semesters
            const semesters = [
                { name: 'Học kỳ 1, năm 2022 - 2023', year: '2022 - 2023' },
                { name: 'Học kỳ 2, năm 2022 - 2023', year: '2022 - 2023' },
                { name: 'Học kỳ 1, năm 2023 - 2024', year: '2023 - 2024' },
                { name: 'Học kỳ 2, năm 2023 - 2024', year: '2023 - 2024' },
                { name: 'Học kỳ 1, năm 2024 - 2025', year: '2024 - 2025' },
                { name: 'Học kỳ 2, năm 2024 - 2025', year: '2024 - 2025' },
                { name: 'Học kỳ 1, năm 2025 - 2026', year: '2025 - 2026' }
            ];

            for (const sem of semesters) {
                await connection.query(
                    `INSERT INTO semesters (semester_name, academic_year) VALUES (?, ?)`,
                    [sem.name, sem.year]
                );
            }

            // Insert semester grades
            const grades = [
                { semester: 1, gpa4: 3.28, gpa10: 8.24, classification: 'Giỏi', cum_gpa4: 3.28, cum_gpa10: 8.24 },
                { semester: 2, gpa4: 3.06, gpa10: 7.77, classification: 'Khá', cum_gpa4: 3.17, cum_gpa10: 8.01 },
                { semester: 3, gpa4: 3.06, gpa10: 7.51, classification: 'Khá', cum_gpa4: 3.13, cum_gpa10: 7.85 },
                { semester: 4, gpa4: 2.83, gpa10: 7.34, classification: 'Khá', cum_gpa4: 3.06, cum_gpa10: 7.72 },
                { semester: 5, gpa4: 2.95, gpa10: 7.56, classification: 'Khá', cum_gpa4: 3.03, cum_gpa10: 7.68 },
                { semester: 6, gpa4: 2.79, gpa10: 7.37, classification: 'Khá', cum_gpa4: 2.99, cum_gpa10: 7.63 },
                { semester: 7, gpa4: 3.43, gpa10: 8.07, classification: 'Giỏi', cum_gpa4: 3.06, cum_gpa10: 7.7 }
            ];

            for (const grade of grades) {
                await connection.query(
                    `INSERT INTO semester_grades (student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['24IT111', grade.semester, grade.gpa4, grade.gpa10, grade.classification, grade.cum_gpa4, grade.cum_gpa10]
                );
            }

            // Insert tuition info
            await connection.query(
                `INSERT INTO tuition_info (student_id, total_tuition, paid_amount, remaining_amount)
                VALUES (?, ?, ?, ?)`,
                ['24IT111', 7964800, 7964800, 0]
            );

            await connection.query(
                `INSERT INTO tuition_info (student_id, total_tuition, paid_amount, remaining_amount)
                VALUES (?, ?, ?, ?)`,
                ['24IT333', 7964800, 4000000, 3964800]
            );

            await connection.query(
                `INSERT INTO tuition_info (student_id, total_tuition, paid_amount, remaining_amount)
                VALUES (?, ?, ?, ?)`,
                ['24IT444', 7964800, 0, 7964800]
            );

            // Insert attendance
            await connection.query(
                `INSERT INTO attendance (student_id, semester_id, absences_count)
                VALUES (?, ?, ?)`,
                ['24IT111', 1, 3]
            );

            await connection.query(
                `INSERT INTO attendance (student_id, semester_id, absences_count)
                VALUES (?, ?, ?)`,
                ['24IT333', 1, 1]
            );

            await connection.query(
                `INSERT INTO attendance (student_id, semester_id, absences_count)
                VALUES (?, ?, ?)`,
                ['24IT444', 1, 0]
            );

            console.log('✅ Sample data inserted successfully!');
        }
    } catch (error) {
        console.error('Error inserting sample data:', error.message);
    }
}

async function ensureParentAccounts(connection) {
    try {
        // Backfill account for existing students if missing.
        await connection.query(`
            INSERT INTO parent_accounts (student_id, parent_name, parent_phone, parent_password)
            SELECT
                s.student_id,
                CASE
                    WHEN s.student_id = '24IT111' THEN 'Pham Van T'
                    WHEN s.student_id = '24IT222' THEN 'Tran Thi Lan'
                    WHEN s.student_id = '24IT333' THEN 'Le Van Hung'
                    WHEN s.student_id = '24IT444' THEN 'Pham Thi Hoa'
                    ELSE CONCAT('Phu huynh ', s.full_name)
                END AS parent_name,
                COALESCE(NULLIF(s.phone, ''), s.student_id) AS parent_phone,
                RIGHT(s.id_card, 6) AS parent_password
            FROM students s
            LEFT JOIN parent_accounts pa ON pa.student_id = s.student_id
            WHERE pa.student_id IS NULL
              AND s.id_card IS NOT NULL
              AND s.id_card <> ''
        `);

        // Fill missing parent_name for old records.
        await connection.query(`
            UPDATE parent_accounts pa
            JOIN students s ON s.student_id = pa.student_id
            SET pa.parent_name = CASE
                WHEN s.student_id = '24IT111' THEN 'Pham Van T'
                WHEN s.student_id = '24IT222' THEN 'Tran Thi Lan'
                WHEN s.student_id = '24IT333' THEN 'Le Van Hung'
                WHEN s.student_id = '24IT444' THEN 'Pham Thi Hoa'
                ELSE CONCAT('Phu huynh ', s.full_name)
            END
            WHERE pa.parent_name IS NULL
               OR pa.parent_name = ''
               OR pa.parent_name LIKE 'PH %'
               OR pa.parent_name LIKE 'Phu huynh %'
                    OR s.student_id = '24IT111'
        `);
    } catch (error) {
        console.error('Error ensuring parent accounts:', error.message);
    }
}

async function ensureAdditionalStudentGrades(connection) {
    try {
        const semesterGradeSeed = {
            '24IT222': [
                { semester: 1, gpa4: 2.95, gpa10: 7.45, classification: 'Khá', cum_gpa4: 2.95, cum_gpa10: 7.45 },
                { semester: 2, gpa4: 3.12, gpa10: 7.80, classification: 'Khá', cum_gpa4: 3.04, cum_gpa10: 7.62 },
                { semester: 3, gpa4: 3.28, gpa10: 8.10, classification: 'Giỏi', cum_gpa4: 3.12, cum_gpa10: 7.78 }
            ],
            '24IT333': [
                { semester: 1, gpa4: 3.34, gpa10: 8.20, classification: 'Giỏi', cum_gpa4: 3.34, cum_gpa10: 8.20 },
                { semester: 2, gpa4: 3.22, gpa10: 8.00, classification: 'Giỏi', cum_gpa4: 3.28, cum_gpa10: 8.10 },
                { semester: 3, gpa4: 3.10, gpa10: 7.75, classification: 'Khá', cum_gpa4: 3.22, cum_gpa10: 7.98 }
            ],
            '24IT444': [
                { semester: 1, gpa4: 2.60, gpa10: 6.90, classification: 'Trung bình', cum_gpa4: 2.60, cum_gpa10: 6.90 },
                { semester: 2, gpa4: 2.82, gpa10: 7.20, classification: 'Khá', cum_gpa4: 2.71, cum_gpa10: 7.05 },
                { semester: 3, gpa4: 2.95, gpa10: 7.40, classification: 'Khá', cum_gpa4: 2.79, cum_gpa10: 7.17 }
            ]
        };

        for (const [studentId, gradeList] of Object.entries(semesterGradeSeed)) {
            for (const grade of gradeList) {
                await connection.query(
                    `INSERT INTO semester_grades (student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10)
                     SELECT ?, ?, ?, ?, ?, ?, ?
                     FROM DUAL
                     WHERE NOT EXISTS (
                         SELECT 1 FROM semester_grades WHERE student_id = ? AND semester_id = ?
                     )`,
                    [
                        studentId,
                        grade.semester,
                        grade.gpa4,
                        grade.gpa10,
                        grade.classification,
                        grade.cum_gpa4,
                        grade.cum_gpa10,
                        studentId,
                        grade.semester
                    ]
                );
            }
        }

        const courseSeed = [
            { course_code: 'IT101', course_name: 'Cơ sở lập trình', credits: 3, semester_id: 1 },
            { course_code: 'IT102', course_name: 'Toán rời rạc', credits: 3, semester_id: 1 },
            { course_code: 'IT201', course_name: 'Cấu trúc dữ liệu', credits: 3, semester_id: 2 },
            { course_code: 'IT202', course_name: 'Lập trình Web', credits: 3, semester_id: 2 },
            { course_code: 'IT301', course_name: 'Phân tích thiết kế hệ thống', credits: 3, semester_id: 3 }
        ];

        for (const course of courseSeed) {
            await connection.query(
                `INSERT IGNORE INTO courses (course_name, course_code, credits, semester_id)
                 VALUES (?, ?, ?, ?)`,
                [course.course_name, course.course_code, course.credits, course.semester_id]
            );
        }

        const [courseRows] = await connection.query(
            `SELECT id, course_code FROM courses WHERE course_code IN ('IT101','IT102','IT201','IT202','IT301')`
        );
        const courseIdByCode = Object.fromEntries(courseRows.map(c => [c.course_code, c.id]));

        const courseGradeSeed = {
            '24IT222': [
                { code: 'IT101', attendance: 8.5, assignment: 7.5, midterm: 7.0, final: 7.8, final10: 7.6, letter: 'B' },
                { code: 'IT102', attendance: 8.0, assignment: 7.0, midterm: 7.4, final: 7.2, final10: 7.3, letter: 'B' },
                { code: 'IT201', attendance: 9.0, assignment: 8.0, midterm: 7.5, final: 8.0, final10: 7.9, letter: 'B' }
            ],
            '24IT333': [
                { code: 'IT101', attendance: 9.5, assignment: 8.5, midterm: 8.0, final: 8.6, final10: 8.4, letter: 'A' },
                { code: 'IT202', attendance: 9.0, assignment: 8.0, midterm: 8.2, final: 8.5, final10: 8.3, letter: 'A' },
                { code: 'IT301', attendance: 8.8, assignment: 7.8, midterm: 7.5, final: 8.0, final10: 7.9, letter: 'B' }
            ],
            '24IT444': [
                { code: 'IT101', attendance: 7.0, assignment: 6.5, midterm: 6.0, final: 6.8, final10: 6.5, letter: 'C' },
                { code: 'IT102', attendance: 7.2, assignment: 6.8, midterm: 6.5, final: 6.9, final10: 6.7, letter: 'C' },
                { code: 'IT201', attendance: 7.5, assignment: 7.0, midterm: 6.8, final: 7.1, final10: 7.0, letter: 'B' }
            ]
        };

        for (const [studentId, gradeList] of Object.entries(courseGradeSeed)) {
            for (const grade of gradeList) {
                const courseId = courseIdByCode[grade.code];
                if (!courseId) continue;

                await connection.query(
                    `INSERT INTO course_grades (student_id, course_id, attendance_score, assignment_score, midterm_score, final_score, final_score_10, letter_grade)
                     SELECT ?, ?, ?, ?, ?, ?, ?, ?
                     FROM DUAL
                     WHERE NOT EXISTS (
                        SELECT 1 FROM course_grades WHERE student_id = ? AND course_id = ?
                     )`,
                    [
                        studentId,
                        courseId,
                        grade.attendance,
                        grade.assignment,
                        grade.midterm,
                        grade.final,
                        grade.final10,
                        grade.letter,
                        studentId,
                        courseId
                    ]
                );
            }
        }
    } catch (error) {
        console.error('Error ensuring additional student grades:', error.message);
    }
}

module.exports = { pool, initializeDatabase };
