-- Insert products (using existing category and metal purity IDs from seed data)
INSERT INTO products (name, "categoryId", "metalTypeId", "metalPurityId", "grossWeightGm", "makingChargesPercentage")
VALUES 
('Gold Ring', 1, 1, 1, 10.5, 5),
('Gold Necklace', 1, 1, 1, 8.25, 5),
('Silver Ingot', 2, 2, 1, 25.5, 2)
ON CONFLICT DO NOTHING;

-- Insert orders for 23-02-2026
INSERT INTO orders ("userId", "orderDate", status)
VALUES 
(2, '2026-02-23', 'COMPLETED'),
(2, '2026-02-23', 'COMPLETED'),
(2, '2026-02-23', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Insert order items
INSERT INTO order_items ("orderId", "productId", quantity, "totalPrice")
VALUES
(1, 1, 1, 80750),
(2, 3, 1, 59725),
(3, 2, 1, 101238)
ON CONFLICT DO NOTHING;

-- Insert exchanges
INSERT INTO exchanges ("orderId", "metalPurityId", "weightGm", "totalCredit")
VALUES
(2, 1, 5, 35000),
(3, 2, 2, 1900)
ON CONFLICT DO NOTHING;

-- Update transactions to link to orders
UPDATE daily_sheet_transactions SET "orderId" = 1 WHERE id = 999;
UPDATE daily_sheet_transactions SET "orderId" = 2 WHERE id = 1000;
UPDATE daily_sheet_transactions SET "orderId" = 3 WHERE id = 1001;
