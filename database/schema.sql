-- PharmaBoost 2.0 - MySQL 8.0.16 o superior. No elimina datos.
CREATE DATABASE IF NOT EXISTS pharmaboost_js CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmaboost_js;
CREATE TABLE IF NOT EXISTS manufacturers (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, contact VARCHAR(160) NOT NULL DEFAULT ''
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS users (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, email VARCHAR(160) NOT NULL UNIQUE,
 password_hash VARCHAR(200) NOT NULL, role ENUM('admin','ventas','agente','tic') NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE, manufacturer_id INT NULL, phone VARCHAR(80) NOT NULL DEFAULT '',
 device VARCHAR(120) NOT NULL DEFAULT '', area VARCHAR(120) NOT NULL DEFAULT '',
 FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS registration_requests (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, email VARCHAR(160) NOT NULL UNIQUE,
 password_hash VARCHAR(200) NOT NULL, requested_at VARCHAR(30) NOT NULL,
 status ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
 reviewed_at VARCHAR(30), reviewed_by INT, rejection_reason VARCHAR(300) NOT NULL DEFAULT '',
 FOREIGN KEY(reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id INT NOT NULL, expires_at BIGINT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id), INDEX idx_session_expiry(expires_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS products (
 id INT PRIMARY KEY AUTO_INCREMENT, external_code VARCHAR(80) NOT NULL UNIQUE, name VARCHAR(160) NOT NULL,
 description TEXT NOT NULL, price DECIMAL(14,0) NOT NULL CHECK(price>0), category VARCHAR(80) NOT NULL DEFAULT 'General',
 manufacturer_id INT NOT NULL, image_url VARCHAR(2048) NOT NULL DEFAULT '', image_valid BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(manufacturer_id) REFERENCES manufacturers(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS stores (
 id INT PRIMARY KEY AUTO_INCREMENT, external_code VARCHAR(80) NOT NULL UNIQUE, name VARCHAR(160) NOT NULL,
 address VARCHAR(300) NOT NULL, zone VARCHAR(120) NOT NULL DEFAULT '', phone VARCHAR(80) NOT NULL DEFAULT '',
 manager VARCHAR(120) NOT NULL DEFAULT '', coverage BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS promotions (
 id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, manufacturer_id INT NOT NULL,
 start_date DATE NOT NULL, end_date DATE NOT NULL, status ENUM('borrador','activa','finalizada') NOT NULL,
 created_at VARCHAR(30) NOT NULL, FOREIGN KEY(manufacturer_id) REFERENCES manufacturers(id), CHECK(end_date>=start_date)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS promotion_products (
 promotion_id INT NOT NULL, product_id INT NOT NULL, PRIMARY KEY(promotion_id,product_id),
 FOREIGN KEY(promotion_id) REFERENCES promotions(id), FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS promotion_agents (
 promotion_id INT NOT NULL, agent_id INT NOT NULL, PRIMARY KEY(promotion_id,agent_id),
 FOREIGN KEY(promotion_id) REFERENCES promotions(id), FOREIGN KEY(agent_id) REFERENCES users(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS promotion_stores (
 promotion_id INT NOT NULL, store_id INT NOT NULL, PRIMARY KEY(promotion_id,store_id),
 FOREIGN KEY(promotion_id) REFERENCES promotions(id), FOREIGN KEY(store_id) REFERENCES stores(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS orders (
 id VARCHAR(80) PRIMARY KEY, agent_id INT NOT NULL, store_id INT NOT NULL, promotion_id INT NOT NULL,
 status ENUM('enviado','revision') NOT NULL DEFAULT 'enviado', captured_offline BOOLEAN NOT NULL DEFAULT FALSE,
 captured_at VARCHAR(30) NOT NULL, sent_at VARCHAR(30) NOT NULL, confirmed_by VARCHAR(120) NOT NULL,
 notes TEXT NOT NULL, payload_hash CHAR(64) NOT NULL, total DECIMAL(16,0) NOT NULL,
 dp_received_at VARCHAR(30), review_reason VARCHAR(300) NOT NULL DEFAULT '',
 FOREIGN KEY(agent_id) REFERENCES users(id), FOREIGN KEY(store_id) REFERENCES stores(id),
 FOREIGN KEY(promotion_id) REFERENCES promotions(id), INDEX idx_orders_agent(agent_id,captured_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS order_items (
 order_id VARCHAR(80) NOT NULL, product_id INT NOT NULL, quantity INT NOT NULL CHECK(quantity>0),
 unit_price DECIMAL(14,0) NOT NULL CHECK(unit_price>0), PRIMARY KEY(order_id,product_id),
 FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS visits (
 id VARCHAR(80) PRIMARY KEY, agent_id INT NOT NULL, store_id INT NOT NULL, promotion_id INT NOT NULL,
 created_at VARCHAR(30) NOT NULL, notes TEXT NOT NULL,
 FOREIGN KEY(agent_id) REFERENCES users(id), FOREIGN KEY(store_id) REFERENCES stores(id),
 FOREIGN KEY(promotion_id) REFERENCES promotions(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS audit (
 id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, event VARCHAR(40) NOT NULL,
 description TEXT NOT NULL, result VARCHAR(20) NOT NULL, created_at VARCHAR(30) NOT NULL,
 store_id INT, promotion_id INT, FOREIGN KEY(user_id) REFERENCES users(id),
 FOREIGN KEY(store_id) REFERENCES stores(id), FOREIGN KEY(promotion_id) REFERENCES promotions(id), INDEX idx_audit_date(created_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS product_images (
 id CHAR(48) PRIMARY KEY, product_id INT NOT NULL UNIQUE, content MEDIUMBLOB NOT NULL,
 created_at VARCHAR(30) NOT NULL, FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;
