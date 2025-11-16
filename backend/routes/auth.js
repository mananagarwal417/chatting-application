const express = require('express');
const { handleLogin, handleRegister } = require('../controllers/authController');


const Router = express.Router();



Router
.route('/login')
.post(handleLogin);

Router
.route('/register')
.post(handleRegister);

module.exports = Router;