-- =====================================================
-- COJJ GADGETS - FIX ORDERS JSON DATA
-- =====================================================
-- This script fixes any orders with invalid JSON in the items column

-- Check for orders with invalid JSON
SELECT 
    id, 
    order_number, 
    items,
    CASE 
        WHEN items::text ~ '^\[.*\]$' THEN 'Valid JSON Array'
        WHEN items::text ~ '^\{.*\}$' THEN 'Valid JSON Object'
        ELSE 'Invalid JSON'
    END as json_status
FROM orders 
WHERE items IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Update orders with invalid JSON items to empty array
UPDATE orders 
SET items = '[]'::jsonb
WHERE items IS NOT NULL 
AND NOT (items::text ~ '^\[.*\]$' OR items::text ~ '^\{.*\}$');

-- Check the results
SELECT 
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE items::text ~ '^\[.*\]$') as valid_json_orders,
    COUNT(*) FILTER (WHERE NOT (items::text ~ '^\[.*\]$' OR items::text ~ '^\{.*\}$')) as invalid_json_orders
FROM orders 
WHERE items IS NOT NULL;

SELECT 'Orders JSON data fixed successfully!' as status;
