SELECT LOWER(product) FROM order_details
INNER JOIN orders ON order_details.order_id = orders.id
WHERE order_details.product = "Product A"

--@block
SELECT * from users


--@block
UPDATE users SET username = "root@example.com" WHERE id = 1


--@block
SELECT * FROM users WHERE username = '' or 1=1 --



