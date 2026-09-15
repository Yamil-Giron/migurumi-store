const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

// POST /api/categorias (admin)
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, slug, descripcion, imagenPortada, orden, metaDescripcion, palabrasClaveMetatag } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({ error: 'Nombre y slug son requeridos' });
    }

    const existe = await Categoria.findOne({ $or: [{ nombre }, { slug }] });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre o slug' });
    }

    const categoria = new Categoria({
      nombre,
      slug,
      descripcion,
      imagenPortada,
      orden,
      metaDescripcion,
      palabrasClaveMetatag,
    });

    await categoria.save();

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      categoria,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/categorias (público)
exports.obtenerCategorias = async (req, res) => {
  try {
    const filtro = {};
    // Si no es admin, solo mostrar activas
    if (!req.user || req.user.rol !== 'administrador') {
      filtro.activa = true;
    }

    const categorias = await Categoria.find(filtro).sort({ orden: 1, nombre: 1 });

    res.json({
      total: categorias.length,
      categorias,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/categorias/:id (público)
exports.obtenerCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ categoria });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/categorias/:id (admin)
exports.actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      mensaje: 'Categoría actualizada',
      categoria,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/categorias/:id (admin)
exports.eliminarCategoria = async (req, res) => {
  try {
    // Verificar que no tenga productos asociados
    const productosAsociados = await Producto.countDocuments({ categoriaId: req.params.id });
    if (productosAsociados > 0) {
      return res.status(400).json({
        error: `No se puede eliminar. Hay ${productosAsociados} producto(s) asociado(s) a esta categoría`,
      });
    }

    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría eliminada', categoria });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};