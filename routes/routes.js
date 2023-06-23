const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const reportsController = require('../controllers/reportsController');
const addController = require('../controllers/addController');
const ForecastingController = require('../controllers/ForecastingController');
const { isAuthenticated } = require('./auth');

router.get(['/', '/login'], loginController.renderLoginPage);
router.get('/register', registerController.renderRegisterPage);
router.get('/reports', isAuthenticated, reportsController.renderReportsPage);
router.get('/add', isAuthenticated, addController.renderaddPage);
router.get('/forecasting', isAuthenticated, ForecastingController.renderforecastingPage);
router.post('/register', registerController.registerUser);

module.exports = router;
