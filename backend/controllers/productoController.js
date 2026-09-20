const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

// Helper: generar slug a partir de un nombre
const generarSlug = (nombre) => {
  return nombre
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')      // quita caracteres raros
    .replace(/\s+/g, '-')              // espacios → guiones
    .replace(/-+/g, '-')               // colapsa guiones múltiples
    .replace(/^-|-$/g, '');            // quita guiones al inicio/fin
};

// Helper: generar slug único (agrega -2, -3, ... si ya existe)
const generarSlugUnico = async (nombre, excluirId = null) => {
  const base = generarSlug(nombre);
  let slug = base;
  let contador = 2;

  while (true) {
    const filtro = { slug };
    if (excluirId) filtro._id = { $ne: excluirId };
    const existente = await Producto.findOne(filtro);
    if (!existente) return slug;
    slug = `${base}-${contador}`;
    contador++;
  }
};

// POST /api/productos (admin)
exports.crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      slug,           // opcional: si no viene, se genera
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

    // Validación: solo lo realmente requerido
    if (!nombre || !categoriaId || precio === undefined) {
      return res.status(400).json({
        error: 'Nombre, categoriaId y precio son requeridos',
      });
    }

    // Verificar que la categoría exista
    const categoriaExiste = await Categoria.findById(categoriaId);
    if (!categoriaExiste) {
      return res.status(400).json({ error: 'La categoría especificada no existe' });
    }

    // Slug: usar el que vino o generar uno único
    const slugFinal = slug
      ? await generarSlugUnico(slug)
      : await generarSlugUnico(nombre);

    const producto = new Producto({
      nombre,
      slug: slugFinal,
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
    const datos = { ...req.body };

    // Si viene un slug nuevo, o cambió el nombre sin mandar slug, regenerar
    if (datos.slug) {
      datos.slug = await generarSlugUnico(datos.slug, req.params.id);
    } else if (datos.nombre) {
      datos.slug = await generarSlugUnico(datos.nombre, req.params.id);
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      datos,
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