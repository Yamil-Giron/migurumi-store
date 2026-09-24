const express = require('express');
const router = express.Router();
const controller = require('../controllers/resenaController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, controller.crearResena);
router.get('/producto/:productoId', controller.obtenerPorProducto);
router.delete('/:id', authenticateToken, isAdmin, controller.eliminarResena);

module.exports = router;