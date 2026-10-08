USE pharmaboost_js;
SHOW TABLES;
SELECT id,name,email,role,active FROM users;
SELECT p.name,m.name AS fabricante,p.start_date,p.end_date,p.status FROM promotions p JOIN manufacturers m ON m.id=p.manufacturer_id;
SELECT o.id,s.name AS tienda,u.name AS agente,o.status,o.total,o.captured_at FROM orders o JOIN stores s ON s.id=o.store_id JOIN users u ON u.id=o.agent_id ORDER BY o.sent_at DESC;
SELECT o.id,p.name,i.quantity,i.unit_price,i.quantity*i.unit_price AS subtotal FROM orders o JOIN order_items i ON i.order_id=o.id JOIN products p ON p.id=i.product_id;
SELECT event,result,description,created_at FROM audit ORDER BY id DESC LIMIT 100;

-- Rúbrica 2.23: evidencia sin revelar hashes ni tokens.
SELECT role, COUNT(*) AS usuarios FROM users GROUP BY role;
SELECT id, name, LENGTH(password_hash) = 97 AS formato_hash_protegido FROM users;
SELECT event, result, created_at FROM audit
WHERE event IN ('auth_failure','auth_locked','auth_success') ORDER BY id DESC LIMIT 30;

-- Historial de proveedores, versión 2.25
SELECT id, description, created_at FROM audit WHERE event='proveedor' ORDER BY id DESC;

-- Unidad y maximo sugerido por producto, version 2.26
SELECT id, description, created_at FROM audit WHERE event='producto_config' ORDER BY id DESC;

-- Cambios manuales de precio desde Inventario, version 2.27
SELECT id, user_id, description, created_at FROM audit WHERE event='precio_inventario' ORDER BY id DESC;
