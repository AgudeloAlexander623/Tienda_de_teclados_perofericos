require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ==================== RUTAS ====================
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// ==================== RUTA DE PRUEBA ====================
app.get('/', (req, res) => {
    res.json({
    message: '✅ Servidor NeonKeys Backend ejecutándose',
    version: '1.0.0',
    endpoints: {
        users: '/api/users',
        products: '/api/products'
    }
    });
});

// ==================== MANEJO DE ERRORES ====================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, async () => {
    try {
    // Probar conexión a la BD
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conectado a la base de datos PostgreSQL');
        console.log(`📅 Ahora: ${result.rows[0].now}`);
    } catch (error) {
        console.error('❌ Error al conectar a la BD:', error.message);
    }

    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
