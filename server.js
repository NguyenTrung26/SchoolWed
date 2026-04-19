const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { pool, initializeDatabase } = require('./mysql-db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const AUTH_COOKIE_NAME = 'parent_session';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function parseCookies(req) {
    const header = req.headers.cookie || '';
    return header
        .split(';')
        .map(cookie => cookie.trim())
        .filter(Boolean)
        .reduce((acc, part) => {
            const index = part.indexOf('=');
            if (index === -1) return acc;
            const key = part.slice(0, index);
            const value = decodeURIComponent(part.slice(index + 1));
            acc[key] = value;
            return acc;
        }, {});
}

function buildAuthCookie(token) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=43200; SameSite=Lax${secure}`;
}

function clearAuthCookie() {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function forceReauthWithAlert(res, message) {
    const safeMessage = JSON.stringify(message || 'Phat hien truy cap khong hop le. Vui long dang nhap lai.');
    res.setHeader('Set-Cookie', clearAuthCookie());
    return res.status(403).send(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><title>Yeu cau dang nhap lai</title></head>
<body>
<script>
alert(${safeMessage});
window.location.href = '/login.html';
</script>
</body>
</html>`);
}

function requireParentAuth(req, res, next) {
    try {
        const cookies = parseCookies(req);
        const token = cookies[AUTH_COOKIE_NAME];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = jwt.verify(token, JWT_SECRET);
        req.parentAuth = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid session' });
    }
}

function requireParentAuthPage(req, res, next) {
    try {
        const cookies = parseCookies(req);
        const token = cookies[AUTH_COOKIE_NAME];

        if (!token) {
            return res.redirect('/login.html');
        }

        const payload = jwt.verify(token, JWT_SECRET);
        req.parentAuth = payload;
        next();
    } catch (error) {
        return res.redirect('/login.html');
    }
}

// Initialize database on startup
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

// ==================== API Endpoints ====================

// Get student info
app.get('/api/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM students WHERE student_id = ?", [studentId]);
        connection.release();
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get semester grades
app.get('/api/grades/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`SELECT sg.*, s.semester_name FROM semester_grades sg 
            JOIN semesters s ON sg.semester_id = s.id 
            WHERE sg.student_id = ? 
            ORDER BY s.id ASC`, [studentId]);
        connection.release();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get course grades
app.get('/api/course-grades/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`SELECT cg.*, c.course_name, s.semester_name FROM course_grades cg 
            JOIN courses c ON cg.course_id = c.id 
            JOIN semesters s ON c.semester_id = s.id 
            WHERE cg.student_id = ? 
            ORDER BY s.id ASC, c.course_name ASC`, [studentId]);
        connection.release();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tuition info
app.get('/api/tuition/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM tuition_info WHERE student_id = ?", [studentId]);
        connection.release();
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get attendance info
app.get('/api/attendance/:studentId/:semesterId', async (req, res) => {
    try {
        const { studentId, semesterId } = req.params;
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM attendance WHERE student_id = ? AND semester_id = ?", 
            [studentId, semesterId]);
        connection.release();
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get discipline info
app.get('/api/discipline/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM discipline WHERE student_id = ? ORDER BY date_issued DESC", [studentId]);
        connection.release();
        res.json(rows || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new student
app.post('/api/student', async (req, res) => {
    let connection;
    try {
        const { student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class: cls, major, department, academic_year, parent_name, parent_phone, parent_password } = req.body;
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(`INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year, parent_name, parent_phone, parent_password, parent_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [student_id, full_name, date_of_birth, id_card, email, phone, photo_url, cls, major, department, academic_year, parent_name || `PH ${full_name}`, parent_phone || phone || student_id, parent_password || (id_card ? String(id_card).slice(-6) : student_id)]);

        const generatedParentPhone = parent_phone || phone || student_id;
        const generatedParentPassword = parent_password || (id_card ? String(id_card).slice(-6) : student_id);
        const generatedParentName = parent_name || `PH ${full_name}`;

        await connection.commit();
        connection.release();
        
        res.json({
            id: result.insertId,
            message: 'Student created',
            parent_account: {
                parent_name: generatedParentName,
                parent_phone: generatedParentPhone,
                parent_password: generatedParentPassword
            }
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Rollback failed:', rollbackError.message);
            }
            connection.release();
        }
        res.status(500).json({ error: error.message });
    }
});

// Update student
app.put('/api/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const { full_name, date_of_birth, email, phone, photo_url, class: cls, major, department } = req.body;
        
        const connection = await pool.getConnection();
        await connection.query(`UPDATE students SET full_name = ?, date_of_birth = ?, email = ?, phone = ?, photo_url = ?, class = ?, major = ?, department = ? 
            WHERE student_id = ?`,
            [full_name, date_of_birth, email, phone, photo_url, cls, major, department, studentId]);

        if (phone) {
            await connection.query(
                `UPDATE students
                 SET parent_phone = ?
                 WHERE student_id = ?`,
                [phone, studentId]
            );
        }

        connection.release();
        
        res.json({ message: 'Student updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add semester grade
app.post('/api/grade', async (req, res) => {
    try {
        const { student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10 } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.query(`INSERT INTO semester_grades (student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10]);
        connection.release();
        
        res.json({ id: result.insertId, message: 'Grade added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add course grade
app.post('/api/course-grade', async (req, res) => {
    try {
        const { student_id, course_id, attendance_score, assignment_score, midterm_score, final_score, final_score_10, letter_grade } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.query(`INSERT INTO course_grades (student_id, course_id, attendance_score, assignment_score, midterm_score, final_score, final_score_10, letter_grade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, course_id, attendance_score, assignment_score, midterm_score, final_score, final_score_10, letter_grade]);
        connection.release();
        
        res.json({ id: result.insertId, message: 'Course grade added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add course
app.post('/api/course', async (req, res) => {
    try {
        const { course_name, course_code, credits, semester_id } = req.body;
        
        const connection = await pool.getConnection();
        const [result] = await connection.query(`INSERT INTO courses (course_name, course_code, credits, semester_id)
            VALUES (?, ?, ?, ?)`,
            [course_name, course_code, credits, semester_id]);
        connection.release();
        
        res.json({ id: result.insertId, message: 'Course added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM students");
        connection.release();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const connection = await pool.getConnection();

        const [accounts] = await connection.query(
            `SELECT student_id, parent_phone, id_card
             FROM students
             WHERE parent_phone = ?
               AND parent_password = ?
               AND COALESCE(parent_status, 'active') = 'active'`,
            [username, password]
        );
        connection.release();
        
        if (accounts.length > 0) {
            const account = accounts[0];
            const token = jwt.sign(
                {
                    parentPhone: account.parent_phone,
                    studentId: account.student_id
                },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            res.setHeader('Set-Cookie', buildAuthCookie(token));
            res.json({ success: true, redirectUrl: `/phuhuynh/index/${account.parent_phone}` });
        } else {
            res.status(401).json({ success: false, message: "Sai số điện thoại hoặc mật khẩu phụ huynh!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PHUHUYNH Routes ====================

app.post('/api/logout', (req, res) => {
    res.setHeader('Set-Cookie', clearAuthCookie());
    res.json({ success: true });
});

// Get student details JSON by parent phone - new preferred API
app.get('/phuhuynh/api/chitiet-by-phone/:parentPhone', requireParentAuth, async (req, res) => {
    try {
        const { parentPhone } = req.params;

        if (req.parentAuth.parentPhone !== parentPhone) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const connection = await pool.getConnection();

        const [students] = await connection.query(
            `SELECT *
             FROM students
             WHERE parent_phone = ?
               AND COALESCE(parent_status, 'active') = 'active'`,
            [parentPhone]
        );

        if (!students || students.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Parent account not found or inactive' });
        }

        const student = students[0];
        const studentId = student.student_id;

        const [grades] = await connection.query(`
            SELECT sg.*, s.semester_name FROM semester_grades sg
            JOIN semesters s ON sg.semester_id = s.id
            WHERE sg.student_id = ?
            ORDER BY s.id ASC`,
            [studentId]
        );

        const [courseGrades] = await connection.query(`
            SELECT cg.*, c.course_name, c.course_code, s.semester_name FROM course_grades cg
            JOIN courses c ON cg.course_id = c.id
            JOIN semesters s ON c.semester_id = s.id
            WHERE cg.student_id = ?
            ORDER BY s.id ASC, c.course_name ASC`,
            [studentId]
        );

        const [tuition] = await connection.query(
            "SELECT * FROM tuition_info WHERE student_id = ?",
            [studentId]
        );

        const [attendance] = await connection.query(
            "SELECT * FROM attendance WHERE student_id = ?",
            [studentId]
        );

        const [discipline] = await connection.query(
            "SELECT * FROM discipline WHERE student_id = ? ORDER BY date_issued DESC",
            [studentId]
        );

        connection.release();

        res.json({
            student: student,
            semester_grades: grades || [],
            course_grades: courseGrades || [],
            tuition: tuition[0] || null,
            attendance: attendance || [],
            discipline: discipline || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student details JSON - for API
app.get('/phuhuynh/api/chitiet/:studentId/:idCard', requireParentAuth, async (req, res) => {
    try {
        const { studentId, idCard } = req.params;
        
        const connection = await pool.getConnection();
        
        // Verify student exists with matching student_id and id_card
        const [students] = await connection.query(
            `SELECT *
             FROM students
             WHERE student_id = ? AND id_card = ? AND parent_phone = ? AND COALESCE(parent_status, 'active') = 'active'`,
            [studentId, idCard, req.parentAuth.parentPhone]
        );
        
        if (!students || students.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Student not found or ID card does not match' });
        }
        
        const student = students[0];
        
        // Get semester grades
        const [grades] = await connection.query(`
            SELECT sg.*, s.semester_name FROM semester_grades sg 
            JOIN semesters s ON sg.semester_id = s.id 
            WHERE sg.student_id = ? 
            ORDER BY s.id ASC`, 
            [studentId]
        );
        
        // Get course grades
        const [courseGrades] = await connection.query(`
            SELECT cg.*, c.course_name, c.course_code, s.semester_name FROM course_grades cg 
            JOIN courses c ON cg.course_id = c.id 
            JOIN semesters s ON c.semester_id = s.id 
            WHERE cg.student_id = ? 
            ORDER BY s.id ASC, c.course_name ASC`, 
            [studentId]
        );
        
        // Get tuition info
        const [tuition] = await connection.query(
            "SELECT * FROM tuition_info WHERE student_id = ?", 
            [studentId]
        );
        
        // Get attendance info
        const [attendance] = await connection.query(
            "SELECT * FROM attendance WHERE student_id = ?", 
            [studentId]
        );
        
        // Get discipline info
        const [discipline] = await connection.query(
            "SELECT * FROM discipline WHERE student_id = ? ORDER BY date_issued DESC", 
            [studentId]
        );
        
        connection.release();
        
        // Return all data
        res.json({
            student: student,
            semester_grades: grades || [],
            course_grades: courseGrades || [],
            tuition: tuition[0] || null,
            attendance: attendance || [],
            discipline: discipline || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Preferred route: /index/:parentPhone - with server-side data injection
app.get('/phuhuynh/index/:parentPhone(\\d+)', requireParentAuthPage, async (req, res) => {
    try {
        const { parentPhone } = req.params;

        if (req.parentAuth.parentPhone !== parentPhone) {
            return forceReauthWithAlert(res, 'Ban vua thay doi duong dan de truy cap tai khoan khac. Vui long dang nhap lai.');
        }

        const connection = await pool.getConnection();

        // Verify parent account exists
        const [students] = await connection.query(
            `SELECT *
             FROM students
             WHERE parent_phone = ?
               AND COALESCE(parent_status, 'active') = 'active'`,
            [parentPhone]
        );

        if (!students || students.length === 0) {
            connection.release();
            return res.status(404).send('<h1>❌ Tài khoản phụ huynh không tồn tại hoặc đã bị khóa</h1>');
        }

        const student = students[0];
        const studentId = student.student_id;

        // Get tuition & discipline info (lightweight for index)
        const [tuition] = await connection.query(
            'SELECT * FROM tuition_info WHERE student_id = ?',
            [studentId]
        );

        const [attendance] = await connection.query(
            'SELECT * FROM attendance WHERE student_id = ?',
            [studentId]
        );

        const [discipline] = await connection.query(
            'SELECT * FROM discipline WHERE student_id = ? ORDER BY date_issued DESC',
            [studentId]
        );

        connection.release();

        // Read index.html and inject data
        const fs = require('fs').promises;
        let html = await fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8');

        // Inject data into window object
        const initialData = {
            student,
            tuition: tuition[0] || null,
            attendance: attendance || [],
            discipline: discipline || []
        };

        // Insert data injection right before closing body tag
        const dataScript = `<script>window.INITIAL_DATA = ${JSON.stringify(initialData)};</script>`;
        html = html.replace('</body>', dataScript + '\n</body>');

        res.send(html);
    } catch (error) {
        res.status(500).send(`<h1>❌ Lỗi: ${error.message}</h1>`);
    }
});

// Lightweight payload for index page to reduce initial loading time.
app.get('/phuhuynh/api/index-by-phone/:parentPhone', requireParentAuth, async (req, res) => {
    try {
        const { parentPhone } = req.params;

        if (req.parentAuth.parentPhone !== parentPhone) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const connection = await pool.getConnection();

        const [students] = await connection.query(
            `SELECT *
             FROM students
             WHERE parent_phone = ?
               AND COALESCE(parent_status, 'active') = 'active'`,
            [parentPhone]
        );

        if (!students || students.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Parent account not found or inactive' });
        }

        const student = students[0];
        const studentId = student.student_id;

        const [tuition] = await connection.query(
            'SELECT * FROM tuition_info WHERE student_id = ?',
            [studentId]
        );

        const [attendance] = await connection.query(
            'SELECT * FROM attendance WHERE student_id = ?',
            [studentId]
        );

        const [discipline] = await connection.query(
            'SELECT * FROM discipline WHERE student_id = ? ORDER BY date_issued DESC',
            [studentId]
        );

        connection.release();

        res.json({
            student,
            tuition: tuition[0] || null,
            attendance: attendance || [],
            discipline: discipline || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backward compatibility for old links: redirect to phone-based dashboard URL
app.get('/phuhuynh/index/:studentId/:idCard', requireParentAuthPage, async (req, res) => {
    try {
        const { studentId, idCard } = req.params;
        const connection = await pool.getConnection();
        
        // Verify student exists
        const [students] = await connection.query(
            "SELECT * FROM students WHERE student_id = ? AND id_card = ? AND parent_phone = ?",
            [studentId, idCard, req.parentAuth.parentPhone]
        );

                const [accounts] = await connection.query(
                        `SELECT parent_phone
                         FROM students
                         WHERE student_id = ?
                             AND parent_phone = ?
                             AND COALESCE(parent_status, 'active') = 'active'
                         LIMIT 1`,
                        [studentId, req.parentAuth.parentPhone]
                );
        
        connection.release();
        
        if (!students || students.length === 0) {
            return forceReauthWithAlert(res, 'Duong dan khong thuoc tai khoan hien tai. Vui long dang nhap lai.');
        }

        if (!accounts || accounts.length === 0) {
            return res.status(404).send('<h1>❌ Không tìm thấy tài khoản phụ huynh đang hoạt động</h1>');
        }

        res.redirect(`/phuhuynh/index/${accounts[0].parent_phone}`);
    } catch (error) {
        res.status(500).send(`<h1>❌ Lỗi: ${error.message}</h1>`);
    }
});

// Backward compatibility for old dashboard links
app.get('/phuhuynh/dashboard/:studentId/:idCard', requireParentAuthPage, async (req, res) => {
    try {
        const { studentId, idCard } = req.params;
        const connection = await pool.getConnection();

        const [students] = await connection.query(
            "SELECT * FROM students WHERE student_id = ? AND id_card = ? AND parent_phone = ?",
            [studentId, idCard, req.parentAuth.parentPhone]
        );

                const [accounts] = await connection.query(
                        `SELECT parent_phone
                         FROM students
                         WHERE student_id = ?
                             AND parent_phone = ?
                             AND COALESCE(parent_status, 'active') = 'active'
                         LIMIT 1`,
                        [studentId, req.parentAuth.parentPhone]
                );

        connection.release();

        if (!students || students.length === 0) {
            return forceReauthWithAlert(res, 'Duong dan khong thuoc tai khoan hien tai. Vui long dang nhap lai.');
        }

        if (!accounts || accounts.length === 0) {
            return res.status(404).send('<h1>❌ Không tìm thấy tài khoản phụ huynh đang hoạt động</h1>');
        }

        res.redirect(`/phuhuynh/index/${accounts[0].parent_phone}`);
    } catch (error) {
        res.status(500).send(`<h1>❌ Lỗi: ${error.message}</h1>`);
    }
});

// Phone-based detail route kept for compatibility: redirect to canonical student/id-card URL
app.get('/phuhuynh/chitiet/:parentPhone(\\d+)', requireParentAuthPage, async (req, res) => {
    try {
        const { parentPhone } = req.params;

        if (req.parentAuth.parentPhone !== parentPhone) {
            return forceReauthWithAlert(res, 'Ban vua thay doi duong dan de truy cap tai khoan khac. Vui long dang nhap lai.');
        }

        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT student_id, id_card
             FROM students
             WHERE parent_phone = ?
               AND COALESCE(parent_status, 'active') = 'active'`,
            [parentPhone]
        );

        connection.release();

        if (!rows || rows.length === 0) {
            return res.status(404).send('<h1>❌ Tài khoản phụ huynh không tồn tại hoặc đã bị khóa</h1>');
        }

        res.redirect(`/phuhuynh/chitiet/${rows[0].student_id}/${rows[0].id_card}`);
    } catch (error) {
        res.status(500).send(`<h1>❌ Lỗi: ${error.message}</h1>`);
    }
});

// Canonical route: /chitiet/:studentId/:idCard
app.get('/phuhuynh/chitiet/:studentId/:idCard', requireParentAuthPage, async (req, res) => {
    try {
        const { studentId, idCard } = req.params;
        const connection = await pool.getConnection();
        
        // Verify student exists
        const [students] = await connection.query(
            "SELECT * FROM students WHERE student_id = ? AND id_card = ? AND parent_phone = ?", 
            [studentId, idCard, req.parentAuth.parentPhone]
        );
        
        connection.release();
        
        if (!students || students.length === 0) {
            return forceReauthWithAlert(res, 'Duong dan khong hop le hoac khong thuoc tai khoan cua ban. Vui long dang nhap lai.');
        }

        res.sendFile(path.join(__dirname, 'public', 'detail.html'));
    } catch (error) {
        res.status(500).send(`<h1>❌ Lỗi: ${error.message}</h1>`);
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Trang mặc định là đăng nhập, tránh gọi dashboard thiếu tham số URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📊 Database: MySQL - ${process.env.DB_NAME || 'school_management'}`);
});

module.exports = app;
