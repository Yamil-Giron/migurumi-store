const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

// Helper: generar slug desde un nombre
const generarSlug = (nombre) => {
  return nombre
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Helper: slug único (agrega -2, -3, ... si ya existe)
const generarSlugUnico = async (nombre, excluirId = null) => {
  const base = generarSlug(nombre);
  let slug = base;
  let contador = 2;
  while (true) {
    const filtro = { slug };
    if (excluirId) filtro._id = { $ne: excluirId };
    const existente = await Categoria.findOne(filtro);
    if (!existente) return slug;
    slug = `${base}-${contador}`;
    contador++;
  }
};

// POST /api/categorias (admin)
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, slug, descripcion, imagenPortada, orden, metaDescripcion, palabrasClaveMetatag } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const existeNombre = await Categoria.findOne({ nombre });
    if (existeNombre) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const slugFinal = slug
      ? await generarSlugUnico(slug)
      : await generarSlugUnico(nombre);

    const categoria = new Categoria({
      nombre,
      slug: slugFinal,
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
    const datos = { ...req.body };

    if (datos.nombre) {
      datos.slug = await generarSlugUnico(datos.nombre, req.params.id);
    }

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      datos,
      { returnDocument: 'after', runValidators: true }
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