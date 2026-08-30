const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/migurumi-store';
    
    console.log('📡 Intentando conectar a MongoDB...');
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB conectado exitosamente`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Base de datos: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ Error en conexión MongoDB:`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Desconectado de MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en MongoDB:', err);
});

module.exports = connectDB;