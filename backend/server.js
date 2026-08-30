const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));

app.get('/api/test', (req, res) => {
  res.json({ mensaje: 'Backend funcionando ✅' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});