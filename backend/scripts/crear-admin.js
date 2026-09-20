require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Usuario = require('../models/Usuario');

const crearAdmin = async () => {
  await connectDB();

  const email = process.argv[2] || 'admin@migurumi.com';
  const contraseña = process.argv[3] || 'Admin123!';
  const nombre = process.argv[4] || 'Administrador';

  try {
    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.log('⚠️  Ya existe un usuario con ese email:', email);
      console.log('   Rol actual:', existente.rol);
      process.exit(0);
    }

    const admin = await Usuario.create({
      nombre,
      email,
      contraseña,
      rol: 'administrador',
    });

    console.log('✅ Admin creado:');
    console.log('   Email:', admin.email);
    console.log('   Nombre:', admin.nombre);
    console.log('   Rol:', admin.rol);
    console.log('   ⚠️  Cambiá la contraseña en producción.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

crearAdmin();