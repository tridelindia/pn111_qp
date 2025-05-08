const { Pool } = require('pg');

const pool = new Pool({
    user: 'post',
    password: 'Tridel@2023',
    host: 'localhost',
    port: 5432,
    database: 'qp_terra_qatar',

});

// Connect to the PostgreSQL database
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL');
        client.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

module.exports = { pool, connectDB };