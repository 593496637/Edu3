const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /instructor-applications - 提交讲师申请
router.post('/', async (req, res) => {
  const { applicant_address, name, title, experience } = req.body;

  // 基本验证
  if (!applicant_address || !name || !title) {
    return res.status(400).json({ 
      error: 'Missing required fields: applicant_address, name, title' 
    });
  }

  try {
    // 检查是否已经申请过
    const existingApplication = await pool.query(
      "SELECT * FROM instructor_applications WHERE applicant_address = $1 AND status = 'pending'",
      [applicant_address]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You already have a pending application' 
      });
    }

    // 创建新申请
    const newApplication = await pool.query(
      "INSERT INTO instructor_applications (applicant_address, name, title, experience) VALUES ($1, $2, $3, $4) RETURNING *",
      [applicant_address, name, title, experience]
    );

    console.log(`New instructor application from ${applicant_address}`);

    res.status(201).json({
      message: 'Instructor application submitted successfully',
      application: newApplication.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /instructor-applications - 获取申请列表 (管理员用)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = "SELECT * FROM instructor_applications ORDER BY created_at DESC";
    let params = [];
    
    if (status) {
      query = "SELECT * FROM instructor_applications WHERE status = $1 ORDER BY created_at DESC";
      params = [status];
    }

    const applications = await pool.query(query, params);
    res.json(applications.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /instructor-applications/my/:address - 获取特定地址的申请状态
router.get('/my/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const applications = await pool.query(
      "SELECT * FROM instructor_applications WHERE applicant_address = $1 ORDER BY created_at DESC",
      [address]
    );
    
    res.json(applications.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT /instructor-applications/:id - 审核申请 (管理员用)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes, reviewed_by } = req.body;

  // 验证状态值
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ 
      error: 'Status must be either "approved" or "rejected"' 
    });
  }

  try {
    // 更新申请状态
    const updatedApplication = await pool.query(
      "UPDATE instructor_applications SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [status, admin_notes, reviewed_by, id]
    );

    if (updatedApplication.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    console.log(`Application ${id} ${status} by ${reviewed_by}`);

    res.json({
      message: `Application ${status} successfully`,
      application: updatedApplication.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;