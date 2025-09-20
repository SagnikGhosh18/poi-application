const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/auth.controller');
const { validate, schemas } = require('../utils/validations');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);

module.exports = router;