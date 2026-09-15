const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'Nombre es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email es requerido'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    contraseña: {
      type: String,
      required: [true, 'Contraseña es requerida'],
      minlength: 6,
      select: false,
    },
    telefono: String,
    direccion: {
      calle: String,
      ciudad: String,
      region: String,
      codigoPostal: String,
      pais: { type: String, default: 'Chile' },
    },
    rol: {
      type: String,
      enum: ['cliente', 'administrador'],
      default: 'cliente',
    },
    fotoPerfil: { type: String, default: null },
    activo: { type: Boolean, default: true },
    fechaRegistro: { type: Date, default: Date.now },
    fechaUltimaActividad: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash de contraseña antes de guardar (Mongoose 6+)
usuarioSchema.pre('save', async function () {
  if (!this.isModified('contraseña')) return;
  const salt = await bcrypt.genSalt(10);
  this.contraseña = await bcrypt.hash(this.contraseña, salt);
});

// Método para comparar contraseñas
usuarioSchema.methods.compararContraseña = async function (contraseñaIngresada) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

module.exports = mongoose.model('Usuario', usuarioSchema);