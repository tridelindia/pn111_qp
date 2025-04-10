const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM tb_users ORDER BY id ASC');
  res.json(result.rows);
});

// Add user
router.post('/', async (req, res) => {
    try {
      const { name, username, email, password, role, designation, avatar } = req.body;
  
      // 🔐 Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO tb_users (name, username, email, password, role, designation, avatar)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, username, email, hashedPassword, role, designation, avatar]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// Edit user
router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, username, email, password, role, designation, avatar } = req.body;
  
      let hashedPassword = password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
  
      const result = await pool.query(
        `UPDATE tb_users SET name=$1, username=$2, email=$3, password=$4, role=$5, designation=$6, avatar=$7
         WHERE id=$8 RETURNING *`,
        [name, username, email, hashedPassword, role, designation, avatar, id]
      );
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tb_users WHERE id = $1', [id]);
  res.status(204).send();
});

module.exports = router;
