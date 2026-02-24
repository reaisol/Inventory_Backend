-- Create categories if they don't exist
INSERT INTO categories (id, name, created_at, updated_at) 
VALUES (1, 'Jewelry', NOW(), NOW()), (2, 'Bullion', NOW(), NOW()), (3, 'Coins', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create metal types if they don't exist
INSERT INTO metal_types (id, code, name, created_at, updated_at) 
VALUES (1, 'GOLD', 'Gold', NOW(), NOW()), (2, 'SILVER', 'Silver', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create metal purities if they don't exist
INSERT INTO metal_purities (id, "metalTypeId", purity, created_at, updated_at) 
VALUES (1, 1, 99.9, NOW(), NOW()), (2, 2, 99.9, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create products for jewelry (gold)
INSERT INTO products (id, "categoryId", name, "metalTypeId", "metalPurityId", "grossWeightGm", "makingChargesPercentage", created_at, updated_at) 
VALUES 
(1, 1, 'Gold Ring', 1, 1, 10.5, 5, NOW(), NOW()),
(2, 1, 'Gold Necklace', 1, 1, 8.25, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create products for bullion (silver)
INSERT INTO products (id, "categoryId", name, "metalTypeId", "metalPurityId", "grossWeightGm", "makingChargesPercentage", created_at, updated_at) 
VALUES 
(3, 2, 'Silver Ingot', 2, 2, 25.5, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create orders for 23-02-2026
INSERT INTO orders (id, "userId", "orderDate", "totalQuantity", "totalPrice", status, "totalMakingCharges", "createdAt", "updatedAt") 
VALUES 
(1, 2, '2026-02-23', 1, 80750, 4, 2000, NOW(), NOW()),
(2, 2, '2026-02-23', 1, 59725, 4, 500, NOW(), NOW()),
(3, 2, '2026-02-23', 2, 101238, 4, 1500, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create order items
INSERT INTO order_items (id, "orderId", "productId", "totalPrice", created_at, updated_at) 
VALUES 
(1, 1, 1, 80750, NOW(), NOW()),
(2, 2, 3, 59725, NOW(), NOW()),
(3, 3, 2, 101238, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create exchanges for old gold/silver
INSERT INTO exchanges (id, "orderId", "metalPurityId", "weightGm", "totalCredit", "createdAt", "updatedAt") 
VALUES 
(1, 2, 1, 5, 35000, NOW(), NOW()),
(2, 3, 2, 2, 1900, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update the daily_sheet_transactions to link to these orders
UPDATE daily_sheet_transactions 
SET "orderId" = 1, "goldWeight" = 10.5, "goldValue" = 78750, "goldRate" = 7500, "makingCharges" = 2000, "grandTotal" = 80750, "cashAmount" = 40000, "onlineAmount" = 40250
WHERE id = 999;

UPDATE daily_sheet_transactions 
SET "orderId" = 2, "silverWeight" = 25.5, "silverValue" = 24225, "silverRate" = 950, "oldGoldWeight" = 5, "oldGoldValue" = 35000, "makingCharges" = 500, "grandTotal" = 59725, "cashAmount" = 30000, "onlineAmount" = 28725
WHERE id = 1000;

UPDATE daily_sheet_transactions 
SET "orderId" = 3, "goldWeight" = 8.25, "goldValue" = 61875, "goldRate" = 7500, "silverWeight" = 15.75, "silverValue" = 14962.5, "oldSilverWeight" = 2, "oldSilverValue" = 1900, "makingCharges" = 1500, "grandTotal" = 101238, "cashAmount" = 50000, "onlineAmount" = 49238
WHERE id = 1001;
