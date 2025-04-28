const express = require('express')
const { getStationConfig, getAllSensorData, getSensorDataByDate, getMetrologicalData, addStation, editStation, saveSensorConfigurations, insertSensorConfigs, getSensorConfig, updateSensorConfig, fetchDesignation, addDesignation, deleteDesignation, fetchRole, addRole, deleteRole, fetchUser, addUser, updateUser, deleteUser } = require('./controller')
const { addLogs } = require('./logger');

const router = express.Router();

router.get('/getStationConfig', getStationConfig);
router.get('/getAllSensorData', getAllSensorData);
router.get('/getSensorDataByDate', getSensorDataByDate);
router.get('/getMetrologicalData', getMetrologicalData);
router.post('/addStation', addStation);
router.post('/editStation', editStation);
router.post('/savesensorconfig', insertSensorConfigs);
router.get('/getSensorConfig', getSensorConfig);
router.post('/updateSensor', updateSensorConfig);


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
router.post('/log/:userName/:activity', addLogs);

module.exports = router;;