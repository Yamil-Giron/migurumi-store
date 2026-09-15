const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, isAdmin, productoController.crearProducto);
router.put('/:id', authenticateToken, isAdmin, productoController.actualizarProducto);
router.delete('/:id', authenticateToken, isAdmin, productoController.eliminarProducto);

module.exports = router;