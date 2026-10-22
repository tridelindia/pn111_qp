const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Tridel@qp@2025',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433', 10),
    database: process.env.DB_NAME || 'db_lusail',
});

// Connect to the PostgreSQL database
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log(`Connected to PostgreSQL database: ${pool.options.database} on ${pool.options.host}:${pool.options.port}`);
        client.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

module.exports = { pool, connectDB };