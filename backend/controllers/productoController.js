const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

// POST /api/productos (admin)
exports.crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      slug,
      descripcion,
      categoriaId,
      precio,
      precioOriginal,
      descuento,
      stock,
      imagenesUrl,
      especificaciones,
      activo,
      destacado,
      vendedor,
    } = req.body;

    if (!nombre || !slug || !categoriaId || precio === undefined) {
      return res.status(400).json({ error: 'Nombre, slug, categoriaId y precio son requeridos' });
    }

    // Verificar que la categoría exista
    const categoriaExiste = await Categoria.findById(categoriaId);
    if (!categoriaExiste) {
      return res.status(400).json({ error: 'La categoría especificada no existe' });
    }

    // Verificar slug único
    const slugExiste = await Producto.findOne({ slug });
    if (slugExiste) {
      return res.status(400).json({ error: 'Ya existe un producto con ese slug' });
    }

    const producto = new Producto({
      nombre,
      slug,
      descripcion,
      categoriaId,
      precio,
      precioOriginal,
      descuento,
      stock,
      imagenesUrl,
      especificaciones,
      activo,
      destacado,
      vendedor,
    });

    await producto.save();

    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/productos (público, con filtros)
exports.obtenerProductos = async (req, res) => {
  try {
    const { categoria, buscar, destacado, precioMin, precioMax, orden } = req.query;
    const filtro = {};

    // Solo mostrar activos si no es admin
    if (!req.user || req.user.rol !== 'administrador') {
      filtro.activo = true;
    }

    if (categoria) filtro.categoriaId = categoria;
    if (destacado !== undefined) filtro.destacado = destacado === 'true';
    if (precioMin || precioMax) {
      filtro.precio = {};
      if (precioMin) filtro.precio.$gte = Number(precioMin);
      if (precioMax) filtro.precio.$lte = Number(precioMax);
    }
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } },
      ];
    }

    // Ordenamiento
    let sort = { fechaCreacion: -1 };
    if (orden === 'precio_asc') sort = { precio: 1 };
    else if (orden === 'precio_desc') sort = { precio: -1 };
    else if (orden === 'nombre') sort = { nombre: 1 };
    else if (orden === 'reciente') sort = { fechaCreacion: -1 };

    const productos = await Producto.find(filtro)
      .populate('categoriaId', 'nombre slug')
      .sort(sort);

    res.json({
      total: productos.length,
      productos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/productos/:id (público)
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate(
      'categoriaId',
      'nombre slug descripcion'
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/productos/:id (admin)
exports.actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoriaId', 'nombre slug');

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      mensaje: 'Producto actualizado',
      producto,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/productos/:id (admin)
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado', producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};