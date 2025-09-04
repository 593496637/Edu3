const { Pool } = require('pg');

// 数据库连接池配置 (与 docker-compose.yml 文件中的设置保持一致)
const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

// 数据库初始化函数
const initializeDatabase = async () => {
  console.log('Checking database schema...');
  const client = await pool.connect();
  try {
    // 创建课程表
    const createCoursesTableQuery = `
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                uuid VARCHAR(255) UNIQUE NOT NULL,
                creator_address VARCHAR(42) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                content_url VARCHAR(255),
                chain_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
    await client.query(createCoursesTableQuery);
    console.log("Table 'courses' is ready.");

    // 创建讲师申请表
    const createInstructorApplicationsTableQuery = `
            CREATE TABLE IF NOT EXISTS instructor_applications (
                id SERIAL PRIMARY KEY,
                applicant_address VARCHAR(42) NOT NULL,
                name VARCHAR(100) NOT NULL,
                title VARCHAR(200) NOT NULL,
                experience TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP WITH TIME ZONE,
                reviewed_by VARCHAR(42)
            );
        `;
    await client.query(createInstructorApplicationsTableQuery);
    console.log("Table 'instructor_applications' is ready.");
  } catch (err) {
    console.error('Error initializing database schema:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

// 导出模块，以便其他文件可以使用
module.exports = {
  pool,
  initializeDatabase
};