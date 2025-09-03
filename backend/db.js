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
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                uuid VARCHAR(255) UNIQUE NOT NULL,
                creator_address VARCHAR(42) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                content_url VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
    await client.query(createTableQuery);
    console.log("Table 'courses' is ready.");
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