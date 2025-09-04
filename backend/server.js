const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeDatabase } = require('./db'); // 从db.js导入初始化函数
const courseRoutes = require('./routes/courses'); // 导入课程路由
const instructorApplicationRoutes = require('./routes/instructor-applications'); // 导入讲师申请路由

// --- 1. 初始化和配置 ---
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// --- 2. 核心 API 路由 ---
// 告诉 Express: 所有发往 /courses 的请求，都由 courseRoutes 来处理
app.use('/courses', courseRoutes);
// 讲师申请相关路由
app.use('/instructor-applications', instructorApplicationRoutes);

// --- 3. 启动服务器 ---
// 启动流程不变：先初始化数据库，成功后再启动Web服务
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Web2 backend server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});