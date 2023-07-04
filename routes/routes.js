const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');
const reportsController = require('../controllers/reportsController');
const addController = require('../controllers/addController');
const ForecastingController = require('../controllers/ForecastingController');
const { isAuthenticated } = require('./auth');
const forecastController = require('../controllers/forecastController')


router.get(['/', '/login'], loginController.renderLoginPage);
router.get('/register', registerController.renderRegisterPage);
router.get('/reports', isAuthenticated, reportsController.renderReportsPage);
router.get('/add', isAuthenticated, addController.renderaddPage);
router.get('/forecasting', isAuthenticated, ForecastingController.renderforecastingPage);
router.post('/register', registerController.registerUser);
router.post('/stock', addController.addStock);
router.post('/sales', isAuthenticated, addController.createSalesOrder);
router.get('/forecasts', forecastController.forecast)


module.exports = router;
