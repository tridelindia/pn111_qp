#!/bin/sh
set -e

echo "=========================================================="
echo " Starting Backend Service"
echo " Target DB: ${DB_NAME:-db_lusail} on ${DB_HOST:-database}:${DB_PORT:-5432}"
echo "=========================================================="

# 1. Run database connectivity check
node wait-for-db.js

echo "=========================================================="
echo " ✅ Database connection confirmed active!"
echo " Starting Node.js Backend Server on port ${PORT:-3000}..."
echo "=========================================================="

# 2. Run backend
exec node server.js
