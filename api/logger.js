const fs = require('fs').promises;
const path = require('path');
const { pool } = require('./db');

const logFilePath = path.join(__dirname, 'activity_logs.txt');

const addLogs = async (req, res) => {
    const { userName, activity, userId, statusCode, filePath } = req.body;
    
    try {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, userName, activity, userId, statusCode, filePath };
        await fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n');
        res.status(200).json({ success: true, message: "Log added successfully" });
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getLogs = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const logFilePath = path.join(__dirname, 'activity_logs.txt');

    let dbLogs = { rows: [], rowCount: 0 };

    if (fromDate || toDate) {
      const dbQuery = `
        SELECT 
          a.log, 
          a.timestamp as timestamp_text,
          a."performedBy",
          a.code,
          a.filepath,
          u.username,
          to_timestamp(a.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as timestamp
        FROM public.tb_activity_logs a
        LEFT JOIN public.tb_users u ON a."performedBy" = u.id
        WHERE 
          ($1::timestamp IS NULL OR 
           to_timestamp(a.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') >= $1) AND
          ($2::timestamp IS NULL OR 
           to_timestamp(a.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') <= $2) AND
          (a.code NOT LIKE 'E0%')
        ORDER BY timestamp DESC
      `;

      const params = [
        fromDate ? new Date(fromDate) : null,
        toDate ? new Date(toDate) : null
      ];

      dbLogs = await pool.query(dbQuery, params);
    }

    const logData = await fs.readFile(logFilePath, 'utf-8');
    const fileLogs = logData.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          const log = JSON.parse(line);
          if (log.time) log.timestamp = log.time;
          return log;
        } catch (e) {
          console.warn('Skipping malformed log entry:', line);
          return null;
        }
      })
      .filter(log => log?.timestamp);

    const filteredFileLogs = (fromDate || toDate)
      ? fileLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(toDate) : null;
          return (
            (!from || logDate >= from) && 
            (!to || logDate <= to)
          );
        })
      : fileLogs;

    const combinedLogs = [
      ...dbLogs.rows.map(row => ({
        message: row.log,
        timestamp: row.timestamp_text,
        userId: row.performedBy,
        userName: row.username,
        statusCode: row.code,
        filePath: row.filepath,
        source: 'database'
      })),
      ...filteredFileLogs.map(log => ({
        message: log.activity || '',
        timestamp: log.timestamp,
        userId: log.userId || 1,
        userName: log.userName || 'System',
        statusCode: log.statusCode || null,
        filePath: log.filePath || null,
        source: 'file'
      }))
    ];

    combinedLogs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      count: combinedLogs.length,
      sources: {
        database: dbLogs.rowCount,
        file: filteredFileLogs.length
      },
      logs: combinedLogs
    });

  } catch (error) {
    console.error('Error processing logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
      details: error.message.includes('operator does not exist')
        ? 'Database type conversion error - check timestamp formats'
        : error.message
    });
  }
};

module.exports = { addLogs, getLogs };