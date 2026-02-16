# COJJ Gadgets Authentication Setup Guide

This guide will help you set up the authentication system for your COJJ Gadgets website using Supabase.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Your Supabase project URL and API key (already provided)

## Database Setup

### Step 1: Create Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql` into the SQL editor
4. Run the SQL script to create all necessary tables and policies

### Step 2: Configure Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `payment-receipts`
3. Set it to public (this is already handled in the SQL script)

### Step 3: Enable Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable Email authentication
3. Configure your site URL (your website domain)
4. Set up email templates if desired

## Features Implemented

### ✅ User Authentication
- **Sign Up**: Users can create accounts with full name, email, phone, and address
- **Login**: Secure authentication with email and password
- **Profile Management**: Users can update their profile information
- **Sign Out**: Secure logout functionality

### ✅ Navigation Integration
- Authentication buttons added to all pages
- Dynamic UI that shows login/signup buttons for guests
- User menu with profile and logout options for logged-in users

### ✅ Checkout Integration
- **Guest Checkout**: Redirects to WhatsApp for non-authenticated users (existing behavior)
- **Authenticated Checkout**: 
  - Pre-fills user information automatically
  - Submits orders to Supabase database
  - Uploads payment receipts to Supabase storage
  - Generates unique order numbers
  - Shows success popup with order number

### ✅ Order Management
- Orders are stored in Supabase with complete details
- Each order gets a unique tracking number (format: COJJ-{timestamp}-{random})
- Payment receipts are uploaded and linked to orders
- Order status tracking system

## File Structure

```
assets/js/
├── supabase-config.js    # Supabase client and auth functions
├── auth-modals.js        # Modal components and UI management
└── main.js              # Existing main functionality

assets/css/
└── styles.css           # Updated with auth and modal styles

database-schema.sql      # Database setup script
```

## Key Functions

### Authentication Functions
- `signUp(email, password, fullName, phone, address)` - Create new user account
- `signIn(email, password)` - Authenticate user
- `signOut()` - Logout user
- `updateUserProfile(updates)` - Update user profile
- `isLoggedIn()` - Check authentication status
- `getCurrentUser()` - Get current user data
- `getUserProfile()` - Get user profile data

### Order Functions
- `submitOrder(orderData)` - Submit order to database
- `uploadReceipt(file)` - Upload payment receipt
- `showOrderSuccessPopup(orderNumber)` - Display success message

## Database Tables

### user_profiles
- Stores user profile information
- Linked to Supabase auth.users
- Fields: full_name, email, phone, address

### orders
- Stores order information
- Fields: order_number, items, total_amount, customer details, status
- Status options: pending, confirmed, processing, shipped, delivered, cancelled

### order_items (optional)
- Normalized order items table
- Better for complex reporting

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure file upload with user-specific folders
- JWT-based authentication

## Testing the System

1. **Sign Up**: Click "Sign Up" button and create a test account
2. **Login**: Use the test account to log in
3. **Profile**: Click on your name in the nav to update profile
4. **Checkout**: Add items to cart and proceed to checkout
5. **Order**: Complete checkout as logged-in user to test order submission

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your URL and API key
2. **Authentication not working**: Verify RLS policies are set up correctly
3. **File upload errors**: Ensure storage bucket exists and policies are correct
4. **Order submission fails**: Check database permissions and table structure

### Debug Mode

Open browser console to see detailed error messages and debug information.

## Next Steps

1. Set up the database using the provided SQL script
2. Test the authentication flow
3. Customize email templates in Supabase
4. Set up order management dashboard (optional)
5. Configure email notifications for new orders (optional)

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all database tables and policies are created correctly
3. Ensure your Supabase project settings are configured properly
4. Test with a fresh browser session/incognito mode
