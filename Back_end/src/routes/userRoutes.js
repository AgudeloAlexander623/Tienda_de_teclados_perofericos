const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Registro e inicio de sesión (público)
router.post('/register', userController.register);
router.post('/login', userController.login);

// Obtener todos los usuarios (protegido - admin)
router.get('/', authMiddleware, userController.getAllUsers);

// Obtener usuario por ID (protegido)
router.get('/:id', authMiddleware, userController.getUserById);

// Actualizar usuario (protegido)
router.put('/:id', authMiddleware, userController.updateUser);

// Cambiar contraseña (protegido)
router.put('/:id/change-password', authMiddleware, userController.changePassword);

// Cambiar estado de usuario (protegido - admin)
router.patch('/:id/toggle-status', authMiddleware, userController.toggleUserStatus);

// Eliminar usuario (protegido - admin)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
