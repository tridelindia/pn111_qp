const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, 'activity_logs.txt');

const addLogs = async (req, res) => {
    const { userName, activity, userId } = req.body;
    
    try {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, userName, activity, userId };
        await fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n');
        res.status(200).json({ success: true, message: "Log added successfully" });
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getLogs = async (req, res) => {
    try {
      const logFilePath = path.join(__dirname, 'activity_logs.txt');
      const logs = await fs.readFile(logFilePath, 'utf-8');
      res.set('Content-Type', 'text/plain');
      res.send(logs);
    } catch (error) {
      console.error('Error reading logs:', error);
      res.status(500).send('Error reading logs');
    }
};

module.exports = { addLogs, getLogs };