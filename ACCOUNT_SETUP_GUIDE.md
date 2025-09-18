# COJJ Gadgets - Account Features Setup Guide

## 🚀 Quick Setup (Recommended)

### Step 1: Run the Quick Setup SQL
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `QUICK_ACCOUNT_SETUP.sql`
4. Click **Run** to execute the script

### Step 2: Update Admin Email
1. In the SQL Editor, run this query to update the admin email:
```sql
-- Replace 'your-email@example.com' with your actual admin email
UPDATE auth.users 
SET email = 'your-email@example.com' 
WHERE email = 'admin@cojjgadgets.com';
```

### Step 3: Test the Features
1. **Customer Account**: Visit `account.html` and sign up/login
2. **Place an Order**: Go through checkout while logged in
3. **View Order History**: Check your account page
4. **Admin Panel**: Visit `admin-orders.html` to manage orders

---

## 🔧 Complete Setup (Advanced)

If you want the full feature set with audit logs and statistics:

### Step 1: Run the Complete Setup
1. Copy and paste the contents of `ACCOUNT_FEATURES_SETUP.sql`
2. Run it in your Supabase SQL Editor

### Step 2: Configure Admin Access
Update the admin email in the `is_admin()` function:
```sql
-- In the is_admin() function, change this line:
AND auth.users.email = 'admin@cojjgadgets.com'
-- To your actual admin email
```

---

## 📋 What Gets Created

### Database Changes
- ✅ **Status Column**: Added to `orders` table for tracking order progress
- ✅ **RLS Policies**: Secure access so users only see their own orders
- ✅ **Admin Access**: Special permissions for order management
- ✅ **Indexes**: Better performance for queries
- ✅ **Audit Logs**: Track all order status changes (complete setup only)

### Order Statuses
- 🟡 **Pending**: Order received (default)
- 🔵 **Confirmed**: Order confirmed by admin
- 🟣 **Processing**: Order being prepared
- 🟢 **Shipped**: Order sent for delivery
- ✅ **Delivered**: Order completed
- 🔴 **Cancelled**: Order cancelled

---

## 🧪 Testing Checklist

### Customer Features
- [ ] Sign up for new account
- [ ] Login with existing account
- [ ] Place order while logged in
- [ ] View order in account page
- [ ] Delete order from account page
- [ ] Update profile information

### Admin Features
- [ ] Access admin panel (`admin-orders.html`)
- [ ] View all orders
- [ ] Filter orders by status
- [ ] Update order status
- [ ] View order details
- [ ] Refresh order list

---

## 🔒 Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Admin functions require specific email verification
- All database operations are logged (complete setup)

---

## 🆘 Troubleshooting

### Common Issues

**"Permission denied" errors:**
- Make sure RLS policies are created correctly
- Check if user is properly authenticated

**Admin can't access orders:**
- Update the admin email in the `is_admin()` function
- Make sure you're logged in with the admin email

**Orders not showing in account:**
- Verify the user is logged in
- Check if the order was created with the correct user_id

### Support
If you encounter any issues, check the browser console for error messages and verify that all SQL scripts ran successfully.

---

## ✅ Setup Complete!

Once you've run the SQL scripts and updated the admin email, your account and order management system will be fully functional! 🎉
