const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');

const router = express.Router();

// GET /courses - 获取所有课程列表 (新增，用于优化首页显示)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all courses for homepage display...');
    const courses = await pool.query(
      "SELECT uuid, creator_address, title, description, content_url, chain_id, created_at FROM courses ORDER BY created_at DESC"
    );
    
    res.json(courses.rows);
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /courses - 创建新课程 (已升级)
router.post('/', async (req, res) => {
  const { title, description, creator_address, content_url } = req.body;

  if (!title || !description || !creator_address) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const newUuid = uuidv4();
  const courseIdForChain = BigInt('0x' + newUuid.replace(/-/g, '').substring(0, 16)).toString();

  try {
    // 在插入数据时，同时保存 uuid 和 chain_id
    const newCourse = await pool.query(
      "INSERT INTO courses (uuid, creator_address, title, description, content_url, chain_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [newUuid, creator_address, title, description, content_url, courseIdForChain]
    );

    console.log(`Course created off-chain with chain_id: ${courseIdForChain}`);

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

// GET /courses/:id - 获取课程详情 (已升级)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[AUTH-STUB] Bypassing ownership check for course ${id} for now.`);

    // 升级查询逻辑：检查id是数字字符串(chain_id)还是UUID
    let course;
    if (/^\d+$/.test(id)) {
      // 如果是纯数字，就按 chain_id 查
      console.log(`Querying by chain_id: ${id}`);
      course = await pool.query("SELECT * FROM courses WHERE chain_id = $1", [id]);
    } else {
      // 否则，按 uuid 查
      console.log(`Querying by uuid: ${id}`);
      course = await pool.query("SELECT * FROM courses WHERE uuid = $1", [id]);
    }

    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    res.json(course.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /courses/:id - 删除课程 (新增)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete course: ${id}`);

    // 升级查询逻辑：检查id是数字字符串(chain_id)还是UUID
    let result;
    if (/^\d+$/.test(id)) {
      // 如果是纯数字，就按 chain_id 删除
      console.log(`Deleting by chain_id: ${id}`);
      result = await pool.query("DELETE FROM courses WHERE chain_id = $1 RETURNING *", [id]);
    } else {
      // 否则，按 uuid 删除
      console.log(`Deleting by uuid: ${id}`);
      result = await pool.query("DELETE FROM courses WHERE uuid = $1 RETURNING *", [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    console.log(`Course deleted: ${result.rows[0].title}`);
    res.json({ 
      message: 'Course deleted successfully', 
      deleted_course: result.rows[0] 
    });
  } catch (err) {
    console.error('Error deleting course:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;