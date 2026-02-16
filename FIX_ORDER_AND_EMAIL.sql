-- =====================================================
-- FIX ORDER SUBMISSION AND ADD EMAIL FUNCTIONALITY
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create email queue table for storing email data
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on email queue
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for email queue (only authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated users can insert email queue" ON email_queue;
CREATE POLICY "Authenticated users can insert email queue" ON email_queue
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for viewing email queue (admin only - you can modify this)
DROP POLICY IF EXISTS "Admin can view email queue" ON email_queue;
CREATE POLICY "Admin can view email queue" ON email_queue
    FOR SELECT USING (true); -- You can restrict this to admin users later

-- Create index for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);

-- Fix the orders table to ensure proper data handling
-- Add a check to ensure items is properly formatted
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_items_format;
ALTER TABLE orders ADD CONSTRAINT check_items_format 
CHECK (jsonb_typeof(items) = 'array');

-- Create a function to format order items properly
CREATE OR REPLACE FUNCTION format_order_items(items_json JSONB)
RETURNS TEXT AS $$
DECLARE
    item JSONB;
    result TEXT := '';
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(items_json)
    LOOP
        result := result || 
            '• ' || (item->>'name') || ' x' || (item->>'quantity') || 
            ' - ' || (item->>'price') || ' each' || E'\n';
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to send order confirmation email via WhatsApp
CREATE OR REPLACE FUNCTION send_whatsapp_order_confirmation(order_id UUID)
RETURNS TEXT AS $$
DECLARE
    order_record RECORD;
    whatsapp_message TEXT;
BEGIN
    -- Get order details
    SELECT 
        order_number,
        customer_name,
        customer_phone,
        total_amount,
        items,
        fulfillment_method,
        payment_method,
        color_preference,
        created_at
    INTO order_record
    FROM orders 
    WHERE id = order_id;
    
    IF NOT FOUND THEN
        RETURN 'Order not found';
    END IF;
    
    -- Create WhatsApp message
    whatsapp_message := '🎉 ORDER CONFIRMATION - COJJ GADGETS' || E'\n\n' ||
        'Order Number: ' || order_record.order_number || E'\n' ||
        'Customer: ' || order_record.customer_name || E'\n' ||
        'Phone: ' || order_record.customer_phone || E'\n' ||
        'Total: ₦' || order_record.total_amount || E'\n' ||
        'Fulfillment: ' || order_record.fulfillment_method || E'\n' ||
        'Payment: ' || order_record.payment_method || E'\n' ||
        'Color: ' || COALESCE(order_record.color_preference, 'Not specified') || E'\n' ||
        'Date: ' || order_record.created_at::date || E'\n\n' ||
        'Thank you for your order! We will contact you within 24 hours.' || E'\n' ||
        'For questions, call: +2347036140846';
    
    -- Update email queue with WhatsApp message (URL will be generated in JavaScript)
    INSERT INTO email_queue (to_email, subject, email_data, status)
    VALUES (
        'whatsapp@cojj.com', -- Placeholder email
        'Order Confirmation - ' || order_record.order_number,
        jsonb_build_object(
            'message', whatsapp_message,
            'order_number', order_record.order_number,
            'customer_name', order_record.customer_name,
            'customer_phone', order_record.customer_phone
        ),
        'pending'
    );
    
    RETURN whatsapp_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically send WhatsApp confirmation
CREATE OR REPLACE FUNCTION trigger_whatsapp_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    whatsapp_url TEXT;
BEGIN
    -- Send WhatsApp confirmation
    SELECT send_whatsapp_order_confirmation(NEW.id) INTO whatsapp_url;
    
    -- Log the WhatsApp URL (you can check this in your database)
    RAISE NOTICE 'WhatsApp confirmation URL: %', whatsapp_url;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS order_whatsapp_confirmation ON orders;
CREATE TRIGGER order_whatsapp_confirmation
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_whatsapp_confirmation();

-- Grant necessary permissions
GRANT ALL ON email_queue TO authenticated;
GRANT EXECUTE ON FUNCTION send_whatsapp_order_confirmation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION format_order_items(JSONB) TO authenticated;

-- Verify the setup
SELECT 'Setup completed successfully!' as status;

-- Test the email queue table
SELECT COUNT(*) as email_queue_count FROM email_queue;

-- Test the orders table
SELECT COUNT(*) as orders_count FROM orders;
