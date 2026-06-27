-- First check/insert categories
INSERT INTO categories (name, code) VALUES 
('Jewelry', 'JEWELRY'),
('Bullion', 'BULLION'),
('Coins', 'COINS')
ON CONFLICT DO NOTHING;

-- Insert metal types
INSERT INTO metal_types (code, name) VALUES 
('GOLD', 'Gold'),
('SILVER', 'Silver')
ON CONFLICT DO NOTHING;

-- Get IDs for metal types
WITH gold_type AS (SELECT id FROM metal_types WHERE code = 'GOLD'),
silver_type AS (SELECT id FROM metal_types WHERE code = 'SILVER'),
jewelry_cat AS (SELECT id FROM categories WHERE code = 'JEWELRY'),
bullion_cat AS (SELECT id FROM categories WHERE code = 'BULLION')
-- Create metal purities linking to metal_types
INSERT INTO metal_purities ("metalTypeId", purity)
SELECT gold_type.id, 99.9 FROM gold_type
WHERE NOT EXISTS (SELECT 1 FROM metal_purities WHERE purity = 99.9 AND "metalTypeId" = (SELECT id FROM gold_type))
UNION ALL
SELECT silver_type.id, 99.9 FROM silver_type
WHERE NOT EXISTS (SELECT 1 FROM metal_purities WHERE purity = 99.9 AND "metalTypeId" = (SELECT id FROM silver_type));

-- Now insert products
-- First, get the necessary IDs
WITH gold_id AS (SELECT id FROM metal_types WHERE code = 'GOLD' LIMIT 1),
silver_id AS (SELECT id FROM metal_types WHERE code = 'SILVER' LIMIT 1),
jewelry_id AS (SELECT id FROM categories WHERE code = 'JEWELRY' LIMIT 1),
bullion_id AS (SELECT id FROM categories WHERE code = 'BULLION' LIMIT 1),
gold_purity_id AS (SELECT id FROM metal_purities WHERE "metalTypeId" = (SELECT id FROM metal_types WHERE code = 'GOLD') LIMIT 1),
silver_purity_id AS (SELECT id FROM metal_purities WHERE "metalTypeId" = (SELECT id FROM metal_types WHERE code = 'SILVER') LIMIT 1)
INSERT INTO products (name, "categoryId", "metalTypeId", "metalPurityId", "grossWeightGm", "makingChargesAmount")
SELECT * FROM (
  SELECT 'Gold Ring'::varchar, jewelry_id.id, gold_id.id, gold_purity_id.id, 10.5::numeric, 500::numeric FROM jewelry_id, gold_id, gold_purity_id
  UNION ALL
  SELECT 'Gold Necklace'::varchar, jewelry_id.id, gold_id.id, gold_purity_id.id, 8.25::numeric, 500::numeric FROM jewelry_id, gold_id, gold_purity_id
  UNION ALL
  SELECT 'Silver Ingot'::varchar, bullion_id.id, silver_id.id, silver_purity_id.id, 25.5::numeric, 200::numeric FROM bullion_id, silver_id, silver_purity_id
) AS new_products
ON CONFLICT DO NOTHING;

-- Create orders
INSERT INTO orders ("userId", "orderDate", status)
SELECT 2, '2026-02-23'::date, 'COMPLETED'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE "orderDate" = '2026-02-23'::date AND "userId" = 2 LIMIT 3);
