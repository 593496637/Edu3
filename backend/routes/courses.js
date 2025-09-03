const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db'); // 导入我们的数据库连接池

const router = express.Router();

// POST /courses - 创建新课程的元数据
router.post('/', async (req, res) => {
  const { title, description, creator_address, content_url } = req.body;

  if (!title || !description || !creator_address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const newUuid = uuidv4();
  const courseIdForChain = BigInt('0x' + newUuid.replace(/-/g, '').substring(0, 16)).toString();

  try {
    const newCourse = await pool.query(
      "INSERT INTO courses (uuid, creator_address, title, description, content_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [newUuid, creator_address, title, description, content_url]
    );

    console.log(`Course created off-chain: ${newCourse.rows[0].title}`);

    res.status(201).json({
      message: 'Course metadata saved. Ready to create on-chain.',
      uuid: newUuid,
      courseIdForChain: courseIdForChain
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /courses/:uuid - 获取特定课程的详细信息
router.get('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log(`[AUTH-STUB] Bypassing ownership check for course ${uuid} for now.`);

    const course = await pool.query("SELECT * FROM courses WHERE uuid = $1", [uuid]);

    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    res.json(course.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;