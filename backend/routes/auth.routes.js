const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/verificar', authenticateToken, authController.verificarToken);

module.exports = router;