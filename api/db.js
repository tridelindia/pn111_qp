// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'post',
  host: 'localhost',
  database: 'qp_terra_qatar',
  password: 'Tridel@2023',
  port: 5432,
});

module.exports = pool;
