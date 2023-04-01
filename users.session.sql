SELECT LOWER(product) FROM order_details
INNER JOIN orders ON order_details.order_id = orders.id
WHERE order_details.product = "Product A"

--@block
SELECT * from users