const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: Fetch all roles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tb_roles ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST: Add a new role
router.post('/add', async (req, res) => {
  const { name, description, permissions } = req.body;

  if (!name || !permissions) {
    return res.status(400).json({ message: 'Name and permissions are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tb_roles (name, description, permissions)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || '', permissions]
    );
    res.status(201).json({ message: 'Role added successfully', role: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE: Delete a role by name
router.delete('/name/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tb_roles WHERE name = $1 RETURNING *',
      [name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully', role: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
