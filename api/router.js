const express = require('express')
const { getStationConfig, getAllSensorData, getMetrologicalData, getSensorDataForHealth, getLastSensorData, getAllNotifications, addNotification, deleteNotification, updateNotification, updateNotificationStatus } = require('./controller')

const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData', getAllSensorData);
router.get('/getMetrologicalData', getMetrologicalData);
router.get('/getHealthData', getSensorDataForHealth);
router.get('/getLastSensorData', getLastSensorData);
router.get('/getAllNotifications', getAllNotifications);
router.post('/addNotification', addNotification);
router.delete('/deleteNotification/:id', deleteNotification);
router.put('/updateNotification/:id', updateNotification);
router.put('/updateNotificationStatus/:id', updateNotificationStatus);
module.exports = router;