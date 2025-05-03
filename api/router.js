const express = require('express')
const { getStationConfig, getAllSensorData, getSensorDataByDate,getHomeConfig, getMetrologicalData,checkUsername,loginUser,checkEmail, addStation, editStation, insertSensorConfigs, getSensorConfig, updateSensorConfig, fetchDesignation, addDesignation, deleteDesignation, fetchRole, addRole, deleteRole, fetchUser, addUser, updateUser, deleteUser,
    getSensorDataForHealth,
    getLastSensorData,
    getAllNotifications,
    addNotification,
    deleteNotification,
    updateNotification,
    updateNotificationStatus,
    saveLogs
 } = require('./controller')
 const { addLogs, getLogs } = require('./logger');
const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData/:stationId', getAllSensorData);
router.get('/getSensorDataByDate', getSensorDataByDate);
router.get('/getMetrologicalData', getMetrologicalData);
router.post('/addStation', addStation);
router.post('/editStation', editStation);
router.post('/savesensorconfig', insertSensorConfigs);
router.get('/getSensorConfig', getSensorConfig);
router.post('/updateSensor', updateSensorConfig);
router.get('/getHomeConfig', getHomeConfig);


// userManagement
router.get('/designations', fetchDesignation);
router.post('/designations', addDesignation);
router.delete('/designations/:id', deleteDesignation)

router.get('/roles', fetchRole);
router.post('/roles/add', addRole);
router.delete('/roles/name/:name', deleteRole);

router.get('/users', fetchUser);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/getHealthData', getSensorDataForHealth);
router.get('/getLastSensorData', getLastSensorData);
router.get('/getAllNotifications', getAllNotifications);
router.post('/addNotification', addNotification);
router.delete('/deleteNotification/:id', deleteNotification);
router.put('/updateNotification/:id', updateNotification);
router.put('/updateNotificationStatus/:id', updateNotificationStatus);

router.post('/logs', addLogs);
router.get('/logs', getLogs);
router.post('/saveLogs', saveLogs);

router.get('/users/check-username', checkUsername);
router.get('/users/check-email', checkEmail);
router.post('/users/login', loginUser);


module.exports = router;;