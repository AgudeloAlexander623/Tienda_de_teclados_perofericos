const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// ==================== REGISTRO DE USUARIO ====================
exports.register = async (req, res) => {
try {
    const { username, email, password, address, phone } = req.body;

    // Validaciones
    if (!username || !email || !password) {
        return res
        .status(400)
        .json({ message: "Usuario, email y contraseña son requeridos" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email inválido" });
    }

    if (password.length < 6) {
        return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
        "SELECT * FROM Users WHERE email = $1 OR username = $2",
        [email, username],
        );
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "El usuario o email ya existe" });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar usuario
    const result = await pool.query(
    "INSERT INTO Users (username, email, password, address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id_user, username, email, address, phone",
    [username, email, hashedPassword, address || null, phone || null],
    );

    const user = result.rows[0];

    // Generar JWT
    const token = jwt.sign(
    { id: user.id_user, email: user.email },
    process.env.JWT_SECRET || "secretkey",
        {
            expiresIn: "24h",
        },
        );

        res.status(201).json({
        message: "Usuario registrado exitosamente",
        user,
        token,
        });
    } catch (error) {
    console.error("Error en registro:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

    if (!email || !password) {
        return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    // Buscar usuario
    const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
        email,
    ]);
    if (result.rows.length === 0) {
        return res
        .status(400)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res
        .status(400)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    // Generar JWT
    const token = jwt.sign(
        { id: user.id_user, email: user.email },
        process.env.JWT_SECRET || "secretkey",
        {
        expiresIn: "24h",
        },
    );

    res.json({
        message: "Login exitoso",
        user: {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
        address: user.address,
        phone: user.phone,
        },
        token,
    });
    } catch (error) {
    console.error("Error en login:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== OBTENER TODOS LOS USUARIOS (Admin) ====================
exports.getAllUsers = async (req, res) => {
    try {
    const result = await pool.query(
        "SELECT id_user, username, email, address, phone, is_active, created_at FROM Users",
    );
    res.json({
        message: "Usuarios obtenidos",
        users: result.rows,
        total: result.rows.length,
    });
    } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== OBTENER USUARIO POR ID ====================
exports.getUserById = async (req, res) => {
    try {
    const { id } = req.params;

    const result = await pool.query(
        "SELECT id_user, username, email, address, phone, is_active, created_at FROM Users WHERE id_user = $1",
        [id],
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
        message: "Usuario obtenido",
        user: result.rows[0],
    });
    } catch (error) {
    console.error("Error al obtener usuario:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== ACTUALIZAR USUARIO ====================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, address, phone } = req.body;

    // Verificar que el usuario exista
        const userExists = await pool.query(
        "SELECT * FROM Users WHERE id_user = $1",
        [id],
    );
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

    // Validar email si se proporciona
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ message: "Email inválido" });
    }

    // Verificar si el email ya existe (si es diferente)
        if (email && email !== userExists.rows[0].email) {
            const emailExists = await pool.query(
            "SELECT * FROM Users WHERE email = $1",
            [email],
        );
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ message: "El email ya está en uso" });
        }
    }

        const result = await pool.query(
            "UPDATE Users SET username = COALESCE($1, username), email = COALESCE($2, email), address = COALESCE($3, address), phone = COALESCE($4, phone), updated_at = CURRENT_TIMESTAMP WHERE id_user = $5 RETURNING id_user, username, email, address, phone",
            [username || null, email || null, address || null, phone || null, id],
    );

    res.json({
        message: "Usuario actualizado exitosamente",
        user: result.rows[0],
        });
    } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== CAMBIAR CONTRASEÑA ====================
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res
            .status(400)
            .json({ message: "Contraseña antigua y nueva son requeridas" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
            message: "La nueva contraseña debe tener al menos 6 caracteres",
            });
        }

    // Obtener usuario
        const result = await pool.query("SELECT * FROM Users WHERE id_user = $1", [
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

    const user = result.rows[0];

    // Verificar contraseña antigua
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
        return res.status(400).json({ message: "Contraseña antigua incorrecta" });
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    await pool.query(
        "UPDATE Users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2",
        [hashedPassword, id],
    );

    res.json({ message: "Contraseña cambiada exitosamente" });
    } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== ELIMINAR USUARIO ====================
exports.deleteUser = async (req, res) => {
    try {
    const { id } = req.params;

    const result = await pool.query(
        "DELETE FROM Users WHERE id_user = $1 RETURNING id_user, username",
        [id],
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
        message: "Usuario eliminado exitosamente",
        user: result.rows[0],
    });
    } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};

// ==================== ACTIVAR/DESACTIVAR USUARIO ====================
exports.toggleUserStatus = async (req, res) => {
    try {
    const { id } = req.params;

    const userResult = await pool.query(
        "SELECT is_active FROM Users WHERE id_user = $1",
        [id],
    );
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const newStatus = !userResult.rows[0].is_active;

    const result = await pool.query(
        "UPDATE Users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2 RETURNING id_user, username, is_active",
        [newStatus, id],
    );

    res.json({
        message: `Usuario ${newStatus ? "activado" : "desactivado"} exitosamente`,
        user: result.rows[0],
    });
    } catch (error) {
        console.error("Error al cambiar estado del usuario:", error);
        res
        .status(500)
        .json({ message: "Error en el servidor", error: error.message });
    }
};
