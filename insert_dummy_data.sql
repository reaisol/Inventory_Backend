INSERT INTO daily_sheet_transactions 
(id, "dailySheetId", "transactionDate", description, "goldWeight", "goldRate", "goldValue", "silverWeight", "silverRate", "silverValue", "makingCharges", "oldGoldWeight", "oldGoldValue", "oldSilverWeight", "oldSilverValue", "grandTotal", discount, "cashAmount", "onlineAmount", "createdAt")
VALUES 
(999, 1, '2026-02-23', 'Gold Purchase - Customer A', 10.5, 7500, 78750, 0, 0, 0, 2000, 0, 0, 0, 0, 80750, 500, 40000, 40250, NOW()),
(1000, 1, '2026-02-23', 'Silver Exchange - Customer B', 0, 0, 0, 25.5, 950, 24225, 500, 5, 35000, 0, 0, 59725, 1000, 30000, 28725, NOW()),
(1001, 1, '2026-02-23', 'Gold & Silver Sale - Customer C', 8.25, 7500, 61875, 15.75, 950, 14962.5, 1500, 3, 21000, 2, 1900, 101238, 2000, 50000, 49238, NOW());
