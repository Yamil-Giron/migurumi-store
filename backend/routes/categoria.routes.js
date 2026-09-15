const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas (opcionalmente lee req.user si hay token, pero no lo exige)
router.get('/', categoriaController.obtenerCategorias);
router.get('/:id', categoriaController.obtenerCategoriaPorId);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, isAdmin, categoriaController.crearCategoria);
router.put('/:id', authenticateToken, isAdmin, categoriaController.actualizarCategoria);
router.delete('/:id', authenticateToken, isAdmin, categoriaController.eliminarCategoria);

module.exports = router;