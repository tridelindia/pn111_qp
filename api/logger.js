const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, 'activity_logs.txt');

const addLogs = async (req, res) => {
    const { userName, activity } = req.params;
    
    try {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            userName,
            activity
        };
        const logString = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(logFilePath, logString);
        res.status(200).send('Log added successfully');
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = { addLogs };