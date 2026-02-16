-- =====================================================
-- FIX STORAGE POLICIES FOR RECEIPT UPLOADS
-- Run this in your Supabase SQL Editor to fix the RLS issue
-- =====================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;

-- Create updated storage policies that work with the folder structure
-- The file path will be: {user_id}/{filename}
CREATE POLICY "Users can upload own receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-receipts' 
        AND auth.uid()::text = split_part(name, '/', 1)
    );

CREATE POLICY "Users can view own receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-receipts' 
        AND auth.uid()::text = split_part(name, '/', 1)
    );

CREATE POLICY "Users can delete own receipts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'payment-receipts' 
        AND auth.uid()::text = split_part(name, '/', 1)
    );

-- Alternative policy using regex (if the above doesn't work)
-- Uncomment these if the split_part approach doesn't work:

/*
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;

CREATE POLICY "Users can upload own receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-receipts' 
        AND name ~ ('^' || auth.uid()::text || '/')
    );

CREATE POLICY "Users can view own receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-receipts' 
        AND name ~ ('^' || auth.uid()::text || '/')
    );

CREATE POLICY "Users can delete own receipts" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'payment-receipts' 
        AND name ~ ('^' || auth.uid()::text || '/')
    );
*/

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%receipts%';

-- Test the storage bucket exists and is accessible
SELECT * FROM storage.buckets WHERE id = 'payment-receipts';
