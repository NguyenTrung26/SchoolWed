const { Pool } = require('pg');
require('dotenv').config();

function buildPoolConfig() {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 10
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_management',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10
    };
}

const pgPool = new Pool(buildPoolConfig());

function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
}

function normalizeSql(sql) {
    return sql
        .replace(/\bINSERT\s+IGNORE\b/gi, 'INSERT')
        .replace(/\s+FROM\s+DUAL\b/gi, '')
        .replace(/\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '');
}

function createConnection(client) {
    return {
        async query(sql, params = []) {
            const trimmed = sql.trim();
            const command = trimmed.split(/\s+/)[0].toUpperCase();

            let text = convertPlaceholders(normalizeSql(sql));
            if (command === 'INSERT' && !/\bRETURNING\b/i.test(text)) {
                text += ' RETURNING id';
            }

            const result = await client.query(text, params);

            if (command === 'SELECT' || command === 'WITH') {
                return [result.rows];
            }

            if (command === 'INSERT') {
                return [{ insertId: result.rows[0]?.id || null, affectedRows: result.rowCount }];
            }

            return [{ affectedRows: result.rowCount, rows: result.rows }];
        },

        async beginTransaction() {
            await client.query('BEGIN');
        },

        async commit() {
            await client.query('COMMIT');
        },

        async rollback() {
            await client.query('ROLLBACK');
        },

        release() {
            client.release();
        }
    };
}

const pool = {
    async getConnection() {
        const client = await pgPool.connect();
        return createConnection(client);
    },

    async query(sql, params = []) {
        const connection = await this.getConnection();
        try {
            return await connection.query(sql, params);
        } finally {
            connection.release();
        }
    }
};

async function initializeDatabase() {
    const connection = await pool.getConnection();

    try {
        console.log('Initializing PostgreSQL database...');

        await connection.query(`CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
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
            parent_name VARCHAR(255),
            parent_phone VARCHAR(20),
            parent_password VARCHAR(255),
            parent_status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS semesters (
            id SERIAL PRIMARY KEY,
            semester_name VARCHAR(255) UNIQUE NOT NULL,
            academic_year VARCHAR(50),
            start_date DATE,
            end_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS semester_grades (
            id SERIAL PRIMARY KEY,
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
            id SERIAL PRIMARY KEY,
            course_name VARCHAR(255) NOT NULL,
            course_code VARCHAR(50) UNIQUE,
            credits INT,
            semester_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS course_grades (
            id SERIAL PRIMARY KEY,
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
            id SERIAL PRIMARY KEY,
            student_id VARCHAR(50) UNIQUE,
            total_tuition DECIMAL(15,2),
            paid_amount DECIMAL(15,2),
            remaining_amount DECIMAL(15,2),
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            student_id VARCHAR(50),
            semester_id INT,
            absences_count INT DEFAULT 0,
            notes VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (semester_id) REFERENCES semesters(id)
        )`);

        await connection.query(`CREATE TABLE IF NOT EXISTS discipline (
            id SERIAL PRIMARY KEY,
            student_id VARCHAR(50),
            type VARCHAR(50),
            description VARCHAR(500),
            date_issued DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE
        )`);

        await connection.query(`CREATE INDEX IF NOT EXISTS idx_students_parent_phone ON students(parent_phone)`);

        await insertSampleData(connection);
        await ensureParentAccounts(connection);

        console.log('Database tables initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}

async function insertSampleData(connection) {
    const [rows] = await connection.query('SELECT COUNT(*)::int AS count FROM students');
    if (!rows || rows[0].count > 0) {
        return;
    }

    console.log('Inserting sample data...');

    await connection.query(
        `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year, parent_name, parent_phone, parent_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id) DO NOTHING`,
        ['24IT111', 'PHAM MINH TRI', '2004-06-06', '001111222333', 'tripm.24it@vku.udn.vn', '0901111111',
            'https://daotao.vku.udn.vn/uploads/sinhvien/22IT313.jpg', '24SE1', 'Cong nghe phan mem',
            'Khoa Khoa hoc may tinh', 'Khoa 2022', 'Pham Van T', '0901111111', '222333']
    );

    await connection.query(
        `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year, parent_name, parent_phone, parent_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id) DO NOTHING`,
        ['24IT222', 'TRAN VAN TEST', '2004-09-02', '002222333444', 'testtv.24it@vku.udn.vn', '0905999888',
            'https://i.pravatar.cc/300?img=12', '24SE2', 'Ky thuat phan mem',
            'Khoa Khoa hoc may tinh', 'Khoa 2022', 'Tran Thi Lan', '0905999888', '333444']
    );

    await connection.query(
        `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year, parent_name, parent_phone, parent_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id) DO NOTHING`,
        ['24IT333', 'LE VAN HOANG', '2004-10-10', '003333444555', 'hoanglv.24it@vku.udn.vn', '0901234567',
            'https://i.pravatar.cc/300?img=15', '24SE3', 'Khoa hoc du lieu',
            'Khoa Khoa hoc may tinh', 'Khoa 2022', 'Le Van Hung', '0901234567', '444555']
    );

    await connection.query(
        `INSERT INTO students (student_id, full_name, date_of_birth, id_card, email, phone, photo_url, class, major, department, academic_year, parent_name, parent_phone, parent_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id) DO NOTHING`,
        ['24IT444', 'NGUYEN THI MAI', '2004-12-20', '004444555666', 'maint.24it@vku.udn.vn', '0912345678',
            'https://i.pravatar.cc/300?img=5', '24SE4', 'An toan thong tin',
            'Khoa Khoa hoc may tinh', 'Khoa 2022', 'Pham Thi Hoa', '0912345678', '555666']
    );

    const semesters = [
        { name: 'Hoc ky 1, nam 2022 - 2023', year: '2022 - 2023' },
        { name: 'Hoc ky 2, nam 2022 - 2023', year: '2022 - 2023' },
        { name: 'Hoc ky 1, nam 2023 - 2024', year: '2023 - 2024' }
    ];

    for (const sem of semesters) {
        await connection.query(
            `INSERT INTO semesters (semester_name, academic_year)
             VALUES (?, ?)
             ON CONFLICT (semester_name) DO NOTHING`,
            [sem.name, sem.year]
        );
    }

    await connection.query(
        `INSERT INTO semester_grades (student_id, semester_id, gpa_4, gpa_10, classification, cumulative_gpa_4, cumulative_gpa_10)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT DO NOTHING`,
        ['24IT111', 1, 3.28, 8.24, 'Gioi', 3.28, 8.24]
    );

    await connection.query(
        `INSERT INTO tuition_info (student_id, total_tuition, paid_amount, remaining_amount)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (student_id) DO NOTHING`,
        ['24IT111', 7964800, 7964800, 0]
    );

    await connection.query(
        `INSERT INTO attendance (student_id, semester_id, absences_count)
         VALUES (?, ?, ?)
         ON CONFLICT DO NOTHING`,
        ['24IT111', 1, 3]
    );

    console.log('Sample data inserted successfully!');
}

async function ensureParentAccounts(connection) {
    await connection.query(`
        UPDATE students
        SET parent_name = COALESCE(NULLIF(parent_name, ''), 'PH ' || full_name),
            parent_phone = COALESCE(NULLIF(parent_phone, ''), NULLIF(phone, ''), student_id),
            parent_password = COALESCE(NULLIF(parent_password, ''), RIGHT(id_card, 6)),
            parent_status = COALESCE(NULLIF(parent_status, ''), 'active')
        WHERE (parent_name IS NULL OR parent_name = '')
           OR (parent_phone IS NULL OR parent_phone = '')
           OR (parent_password IS NULL OR parent_password = '')
    `);
}

module.exports = { pool, initializeDatabase };
