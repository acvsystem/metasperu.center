CREATE DATABASE METASPERU_BD;
USE METASPERU_BD;

-- Tabla de Tiendas
CREATE TABLE tiendas (
id INT AUTO_INCREMENT PRIMARY KEY,
serie VARCHAR(4),
nombre_tienda VARCHAR(100),
estado ENUM('ACTIVO', 'DESHABILITADO') DEFAULT 'ACTIVO'
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Guardaremos el hash de Bcrypt
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('ADMIN', 'ALMACENERO', 'CONSULTA') DEFAULT 'ALMACENERO',
    estado TINYINT(1) DEFAULT 1, -- 1: Activo, 0: Suspendido
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME NULL,
    INDEX (usuario) -- Optimiza la velocidad del login
) ENGINE=InnoDB;

-- Tabla de Sesiones (Opcional, para auditoría de conexiones)
CREATE TABLE auditoria_conexiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    socket_id VARCHAR(100),
    ip_address VARCHAR(45),
    evento VARCHAR(50), -- 'LOGIN', 'LOGOUT', 'DISCONNECT'
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO usuarios (usuario, password, nombre, rol) 
VALUES ('andrecv', '$2b$10$7R.pG.fR5fO6oUuN/q9mZeP.8PzK8f9W8e/V4nQ/Y2.Xh3.oP.W2e', 'Administrador Principal', 'ADMIN');

-- Tabla para las sesiones de auditoría
CREATE TABLE inventario_sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_sesion VARCHAR(10) UNIQUE NOT NULL, -- Código para que los Pocket se unan
    tienda_id INT NOT NULL,
    creado_por INT NOT NULL,
    estado ENUM('ACTIVO', 'FINALIZADO') DEFAULT 'ACTIVO',
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(id)
);

-- Tabla para los escaneos realizados
CREATE TABLE inventario_escaneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id INT NOT NULL,
    sku VARCHAR(50) NOT NULL,
    cantidad INT DEFAULT 1,
    escaneado_por INT NOT NULL,
    fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id) REFERENCES inventario_sesiones(id)
);





