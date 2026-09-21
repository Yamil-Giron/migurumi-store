const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const generarToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// POST /api/auth/registro
exports.registro = async (req, res) => {
  try {
    const { nombre, email, contraseña } = req.body;

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      contraseña,
      rol: 'cliente',   // ← SIEMPRE cliente, ignora lo que venga del body
    });

    await nuevoUsuario.save();
    const token = generarToken(nuevoUsuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ email }).select('+contraseña');
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const esValida = await usuario.compararContraseña(contraseña);
    if (!esValida) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    usuario.fechaUltimaActividad = new Date();
    await usuario.save();

    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/auth/verificar
exports.verificarToken = (req, res) => {
  res.json({
    valido: true,
    usuario: req.user,
  });
};