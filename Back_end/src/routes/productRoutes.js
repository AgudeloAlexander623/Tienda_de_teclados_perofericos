const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los productos (público)
router.get('/', productController.getAllProducts);

// Obtener producto por ID (público)
router.get('/:id', productController.getProductById);

// Obtener productos por categoría (público)
router.get('/category/:id_category', productController.getProductsByCategory);

// Crear producto (protegido - admin)
router.post('/', authMiddleware, productController.createProduct);

// Actualizar producto (protegido - admin)
router.put('/:id', authMiddleware, productController.updateProduct);

// Actualizar stock (protegido - admin)
router.patch('/:id/stock', authMiddleware, productController.updateStock);

// Cambiar estado del producto (protegido - admin)
router.patch('/:id/toggle-status', authMiddleware, productController.toggleProductStatus);

// Eliminar producto (protegido - admin)
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
