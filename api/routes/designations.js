const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all designations
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tb_designations');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching designations:', error);
      res.status(500).send('Internal server error');
    }
  });
  
  // POST a new designation
router.post('/', async (req, res) => {
    const { title, description } = req.body;
    try {
      await pool.query(
        'INSERT INTO tb_designations (title, description) VALUES ($1, $2)',
        [title, description]
      );
      res.status(201).json({ message: 'Designation added' }); // ✅ Return valid JSON
    } catch (error) {
      console.error('Error adding designation:', error);
      res.status(500).send('Internal server error');
    }
  });
  
  
  // DELETE a designation
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM tb_designations WHERE id = $1', [id]);
      res.json({ message: 'Designation deleted' }); // ✅ Proper JSON response
    } catch (error) {
      console.error('Error deleting designation:', error);
      res.status(500).send('Internal server error');
    }
  });
  
  

module.exports = router;
