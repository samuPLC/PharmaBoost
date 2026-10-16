-- Asociación de uno o varios fabricantes por producto. No elimina datos.
USE pharmaboost_js;
CREATE TABLE IF NOT EXISTS product_manufacturers (
 product_id INT NOT NULL,
 manufacturer_id INT NOT NULL,
 PRIMARY KEY(product_id,manufacturer_id),
 FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
 FOREIGN KEY(manufacturer_id) REFERENCES manufacturers(id)
) ENGINE=InnoDB;
INSERT IGNORE INTO product_manufacturers(product_id,manufacturer_id)
SELECT id,manufacturer_id FROM products;
