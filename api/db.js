const { Pool, types } = require("pg");
types.setTypeParser(1114, (str) => str);
types.setTypeParser(1184, (str) => str);

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Tridel@qp@2025",
  host: process.env.DB_HOST || "192.168.0.11",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
  database: process.env.DB_NAME || "db_terra_qatar",
});

// Connect to the PostgreSQL database
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
};

module.exports = { pool, connectDB };
