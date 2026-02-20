-- ===============================================
-- TIENDA DE TECLADOS NEONKEYS - BASE DE DATOS
-- Base de datos para PostgreSQL
-- ===============================================

CREATE DATABASE DBneonkeys;
\c DBneonkeys;

-- ===============================================
-- TABLA: CATEGORÍAS DE PRODUCTOS
-- ===============================================
CREATE TABLE Categories (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: USUARIOS
-- ===============================================
CREATE TABLE Users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: PRODUCTOS
-- ===============================================
CREATE TABLE Products (
    id_product SERIAL PRIMARY KEY,
    id_category INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_category) REFERENCES Categories(id_category)
);
-- ===============================================
-- TABLA: CARRITO DE COMPRAS
-- ===============================================
CREATE TABLE Cart (
    id_cart SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_product INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES Products(id_product) ON DELETE CASCADE,
    UNIQUE(id_user, id_product)
);

-- ===============================================
-- TABLA: ÓRDENES
-- ===============================================
CREATE TABLE Orders (
    id_order SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address VARCHAR(255),
    estimated_delivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: ITEMS DE ORDEN
-- ===============================================
CREATE TABLE OrderItems (
    id_order_item SERIAL PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (id_order) REFERENCES Orders(id_order) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES Products(id_product) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: RESEÑAS Y CALIFICACIONES
-- ===============================================
CREATE TABLE Reviews (
    id_review SERIAL PRIMARY KEY,
    id_product INT NOT NULL,
    id_user INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    FOREIGN KEY (id_product) REFERENCES Products(id_product) ON DELETE CASCADE,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
    UNIQUE(id_product, id_user)
);

-- ===============================================
-- TABLA: PAGOS
-- ===============================================
CREATE TABLE Payments (
    id_payment SERIAL PRIMARY KEY,
    id_order INT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_order) REFERENCES Orders(id_order) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: FAVORITOS / WISHLIST
-- ===============================================
CREATE TABLE Wishlist (
    id_wishlist SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_product INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES Products(id_product) ON DELETE CASCADE,
    UNIQUE(id_user, id_product)
);

-- ===============================================
-- TABLA: CUPONES / CÓDIGOS DE PROMOCIÓN
-- ===============================================
CREATE TABLE Coupons (
    id_coupon SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_uses INT,
    current_uses INT DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: ESPECIFICACIONES DE TECLADO
-- ===============================================
CREATE TABLE KeyboardSpecifications (
    id_spec SERIAL PRIMARY KEY,
    id_product INT NOT NULL,
    switch_type VARCHAR(100),
    connection_type VARCHAR(50) CHECK (connection_type IN ('wired', 'wireless', 'bluetooth')),
    backlight_type VARCHAR(100),
    rgb_enabled BOOLEAN DEFAULT false,
    total_keys INT,
    layout VARCHAR(50),
    material VARCHAR(100),
    weight_grams INT,
    dimensions VARCHAR(100),
    battery_life_hours INT,
    polling_rate INT,
    mechanical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_product) REFERENCES Products(id_product) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: DIRECCIONES DE ENVÍO
-- ===============================================
CREATE TABLE ShippingAddresses (
    id_address SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    address_type VARCHAR(50) CHECK (address_type IN ('home', 'work', 'other')),
    street VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: RETORNOS / DEVOLUCIONES
-- ===============================================
CREATE TABLE Returns (
    id_return SERIAL PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    id_user INT NOT NULL,
    return_reason VARCHAR(50) NOT NULL CHECK (return_reason IN ('defective', 'wrong_item', 'damaged', 'not_as_described', 'changed_mind', 'other')),
    quantity INT NOT NULL CHECK (quantity > 0),
    refund_amount DECIMAL(10, 2) NOT NULL CHECK (refund_amount > 0),
    return_status VARCHAR(50) NOT NULL DEFAULT 'requested' CHECK (return_status IN ('requested', 'approved', 'rejected', 'shipped', 'received', 'refunded')),
    comments TEXT,
    tracking_number VARCHAR(100),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    received_at TIMESTAMP,
    refunded_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_order) REFERENCES Orders(id_order) ON DELETE CASCADE,
    FOREIGN KEY (id_product) REFERENCES Products(id_product),
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: TICKETS DE SOPORTE / AYUDA
-- ===============================================
CREATE TABLE SupportTickets (
    id_ticket SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    id_user INT NOT NULL,
    id_order INT,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('product_issue', 'order_issue', 'shipping', 'payment', 'account', 'general')),
    description TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    assigned_to_admin INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES Users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_order) REFERENCES Orders(id_order) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_admin) REFERENCES Users(id_user) ON DELETE SET NULL
);

-- ===============================================
-- TABLA: RESPUESTAS DE SOPORTE
-- ===============================================
CREATE TABLE TicketResponses (
    id_response SERIAL PRIMARY KEY,
    id_ticket INT NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    id_sender INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES SupportTickets(id_ticket) ON DELETE CASCADE,
    FOREIGN KEY (id_sender) REFERENCES Users(id_user) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: CUPONES APLICADOS A ÓRDENES
-- ===============================================
CREATE TABLE OrderCoupons (
    id_order_coupon SERIAL PRIMARY KEY,
    id_order INT NOT NULL,
    id_coupon INT NOT NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_order) REFERENCES Orders(id_order) ON DELETE CASCADE,
    FOREIGN KEY (id_coupon) REFERENCES Coupons(id_coupon) ON DELETE CASCADE
);

-- ===============================================
-- ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- ===============================================
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_products_category ON Products(id_category);
CREATE INDEX idx_products_name ON Products(name);
CREATE INDEX idx_orders_user ON Orders(id_user);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_orderitems_order ON OrderItems(id_order);
CREATE INDEX idx_orderitems_product ON OrderItems(id_product);
CREATE INDEX idx_cart_user ON Cart(id_user);
CREATE INDEX idx_reviews_product ON Reviews(id_product);
CREATE INDEX idx_reviews_user ON Reviews(id_user);
CREATE INDEX idx_payments_order ON Payments(id_order);
CREATE INDEX idx_payments_status ON Payments(payment_status);
CREATE INDEX idx_wishlist_user ON Wishlist(id_user);
CREATE INDEX idx_wishlist_product ON Wishlist(id_product);
CREATE INDEX idx_coupons_code ON Coupons(code);
CREATE INDEX idx_coupons_active ON Coupons(is_active);
CREATE INDEX idx_keyboardspecs_product ON KeyboardSpecifications(id_product);
CREATE INDEX idx_shippingaddresses_user ON ShippingAddresses(id_user);
CREATE INDEX idx_returns_order ON Returns(id_order);
CREATE INDEX idx_returns_status ON Returns(return_status);
CREATE INDEX idx_supporttickets_user ON SupportTickets(id_user);
CREATE INDEX idx_supporttickets_status ON SupportTickets(status);
CREATE INDEX idx_supporttickets_number ON SupportTickets(ticket_number);