const pool = require('../config/database');

// ==================== CREAR PRODUCTO ====================
exports.createProduct = async (req, res) => {
    try {
        const { id_category, name, description, price, stock, sku, image_url } = req.body;

    // Validaciones
        if (!id_category || !name || !price) {
            return res.status(400).json({ message: 'Categoría, nombre y precio son requeridos' });
        }

        if (price <= 0) {
            return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
        }

        if (stock < 0) {
            return res.status(400).json({ message: 'El stock no puede ser negativo' });
        }

    // Verificar que la categoría exista
        const categoryExists = await pool.query('SELECT * FROM Categories WHERE id_category = $1', [id_category]);
        if (categoryExists.rows.length === 0) {
            return res.status(400).json({ message: 'La categoría no existe' });
        }

    // Verificar SKU único (si se proporciona)
        if (sku) {
            const skuExists = await pool.query('SELECT * FROM Products WHERE sku = $1', [sku]);
        if (skuExists.rows.length > 0) {
            return res.status(400).json({ message: 'El SKU ya existe' });
        }
    }

    // Insertar producto
    const result = await pool.query(
      'INSERT INTO Products (id_category, name, description, price, stock, sku, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [id_category, name, description || null, price, stock || 0, sku || null, image_url || null]
    );

    res.status(201).json({
        message: 'Producto creado exitosamente',
        product: result.rows[0]
    });
    } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== OBTENER TODOS LOS PRODUCTOS ====================
exports.getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, limit = 10, offset = 0 } = req.query;

    let query = `
        SELECT p.*, c.name as category_name 
        FROM Products p
        LEFT JOIN Categories c ON p.id_category = c.id_category
        WHERE p.is_active = true
    `;
    let params = [];
    let paramCount = 1;

    // Filtrar por categoría
    if (category) {
        query += ` AND p.id_category = $${paramCount}`;
        params.push(category);
        paramCount++;
    }

    // Filtrar por rango de precio
    if (minPrice) {
        query += ` AND p.price >= $${paramCount}`;
        params.push(minPrice);
        paramCount++;
    }
    if (maxPrice) {
        query += ` AND p.price <= $${paramCount}`;
        params.push(maxPrice);
        paramCount++;
    }

    // Búsqueda por nombre
    if (search) {
        query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
    }

    // Contar total
    const countResult = await pool.query(query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    // Paginación
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
        message: 'Productos obtenidos',
        products: result.rows,
        pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
        }
    });
    } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== OBTENER PRODUCTO POR ID ====================
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
        'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.id_category = c.id_category WHERE p.id_product = $1',
        [id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
        message: 'Producto obtenido',
        product: result.rows[0]
    });
    } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== ACTUALIZAR PRODUCTO ====================
exports.updateProduct = async (req, res) => {
    try {
    const { id } = req.params;
    const { id_category, name, description, price, stock, sku, image_url } = req.body;

    // Verificar que el producto exista
    const productExists = await pool.query('SELECT * FROM Products WHERE id_product = $1', [id]);
    if (productExists.rows.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const currentProduct = productExists.rows[0];

    // Validaciones
    if (price && price <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    if (stock !== undefined && stock < 0) {
        return res.status(400).json({ message: 'El stock no puede ser negativo' });
    }

    // Verificar categoría si se proporciona
    if (id_category && id_category !== currentProduct.id_category) {
      const categoryExists = await pool.query('SELECT * FROM Categories WHERE id_category = $1', [id_category]);
        if (categoryExists.rows.length === 0) {
        return res.status(400).json({ message: 'La categoría no existe' });
        }
    }

    // Verificar SKU único si se proporciona
    if (sku && sku !== currentProduct.sku) {
      const skuExists = await pool.query('SELECT * FROM Products WHERE sku = $1', [sku]);
        if (skuExists.rows.length > 0) {
            return res.status(400).json({ message: 'El SKU ya existe' });
        }
    }

    const result = await pool.query(
        `UPDATE Products 
        SET id_category = COALESCE($1, id_category),
            name = COALESCE($2, name),
            description = COALESCE($3, description),
            price = COALESCE($4, price),
            stock = COALESCE($5, stock),
            sku = COALESCE($6, sku),
            image_url = COALESCE($7, image_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id_product = $8
       RETURNING *`,
        [id_category || null, name || null, description || null, price || null, stock !== undefined ? stock : null, sku || null, image_url || null, id]
    );

    res.json({
        message: 'Producto actualizado exitosamente',
        product: result.rows[0]
    });
    } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== ELIMINAR PRODUCTO ====================
exports.deleteProduct = async (req, res) => {
    try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM Products WHERE id_product = $1 RETURNING id_product, name', [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
        message: 'Producto eliminado exitosamente',
        product: result.rows[0]
    });
    } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== OBTENER PRODUCTOS POR CATEGORÍA ====================
exports.getProductsByCategory = async (req, res) => {
    try {
        const { id_category } = req.params;
        const { limit = 10, offset = 0 } = req.query;

    // Verificar que la categoría exista
        const categoryExists = await pool.query('SELECT * FROM Categories WHERE id_category = $1', [id_category]);
        if (categoryExists.rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

    // Contar total
        const countResult = await pool.query(
        'SELECT COUNT(*) FROM Products WHERE id_category = $1 AND is_active = true',
        [id_category]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
        `SELECT p.*, c.name as category_name 
        FROM Products p
        LEFT JOIN Categories c ON p.id_category = c.id_category
        WHERE p.id_category = $1 AND p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3`,
        [id_category, limit, offset]
    );

    res.json({
        message: 'Productos por categoría',
        category: categoryExists.rows[0].name,
        products: result.rows,
        pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
        }
    });
    } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== ACTUALIZAR STOCK ====================
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body;

        if (!quantity || !operation) {
        return res.status(400).json({ message: 'Cantidad y operación son requeridas' });
        }

        if (!['add', 'subtract'].includes(operation)) {
            return res.status(400).json({ message: 'La operación debe ser "add" o "subtract"' });
        }

    // Obtener producto
    const productResult = await pool.query('SELECT * FROM Products WHERE id_product = $1', [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

    const currentStock = productResult.rows[0].stock;
    let newStock;

    if (operation === 'add') {
        newStock = currentStock + quantity;
    } else {
        newStock = currentStock - quantity;
        if (newStock < 0) {
            return res.status(400).json({ message: 'Stock insuficiente' });
        }
    }

    const result = await pool.query(
      'UPDATE Products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id_product = $2 RETURNING *',
        [newStock, id]
    );

    res.json({
        message: 'Stock actualizado exitosamente',
        product: result.rows[0]
    });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ==================== DESACTIVAR/ACTIVAR PRODUCTO ====================
exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const productResult = await pool.query('SELECT is_active FROM Products WHERE id_product = $1', [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const newStatus = !productResult.rows[0].is_active;

        const result = await pool.query(
        'UPDATE Products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id_product = $2 RETURNING *',
        [newStatus, id]
    );

    res.json({
        message: `Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
        product: result.rows[0]
    });
    } catch (error) {
        console.error('Error al cambiar estado del producto:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
