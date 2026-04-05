-- Tạo bảng sinh viên (bao gồm thông tin phụ huynh)
CREATE TABLE IF NOT EXISTS students (
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
    -- Thông tin phụ huynh
    parent_name TEXT,
    parent_phone TEXT,
    parent_password TEXT,
    parent_status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng học kỳ
CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    semester_name TEXT UNIQUE NOT NULL,
    academic_year TEXT,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng điểm tổng kết
CREATE TABLE IF NOT EXISTS semester_grades (
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
);

-- Tạo bảng học phần
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name TEXT NOT NULL,
    course_code TEXT UNIQUE,
    credits INTEGER,
    semester_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tạo bảng điểm chi tiết lớp học phần
CREATE TABLE IF NOT EXISTS course_grades (
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
);

-- Tạo bảng thông tin học phí
CREATE TABLE IF NOT EXISTS tuition_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    total_tuition REAL,
    paid_amount REAL,
    remaining_amount REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Tạo bảng chuyên cần
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    semester_id INTEGER NOT NULL,
    absences_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Tạo bảng khen thưởng kỷ luật
CREATE TABLE IF NOT EXISTS discipline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    type TEXT, -- 'reward' hoặc 'punishment'
    description TEXT,
    date_issued DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Bảng parent_accounts đã được gộp vào bảng students
-- Các trường parent_name, parent_phone, parent_password, parent_status
-- nay nằm trực tiếp trong bảng students.