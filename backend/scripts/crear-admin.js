require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Usuario = require('../models/Usuario');

const crearAdmin = async () => {
  await connectDB();

  const email = process.argv[2] || 'migurumi@store.com';
  const contraseña = process.argv[3] || '123456';
  const nombre = process.argv[4] || 'Admin Migurumi';

  try {
    const existente = await Usuario.findOne({ email });

    if (existente) {
      // Si existe, forzamos rol admin y actualizamos contraseña
      existente.rol = 'administrador';
      existente.contraseña = contraseña;   // se hashea por el pre('save')
      await existente.save();
      console.log('✅ Usuario existente ascendido a administrador:');
      console.log('   Email:', existente.email);
      console.log('   Rol:', existente.rol);
    } else {
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
    }

    console.log('');
    console.log('⚠️  Cambiá la contraseña después de loguearte.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
};

crearAdmin();