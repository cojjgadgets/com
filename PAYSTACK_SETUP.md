# Paystack Integration Setup Guide for COJJ Gadgets

## Overview
This guide will help you set up Paystack payment integration for your COJJ Gadgets website, replacing the current direct bank transfer system.

## Prerequisites
1. A Paystack account (sign up at [paystack.com](https://paystack.com))
2. Access to your website files
3. Basic understanding of web development

## Step 1: Get Your Paystack API Keys

### 1.1 Sign up/Login to Paystack
- Go to [paystack.com](https://paystack.com)
- Create an account or login to your existing account

### 1.2 Get Your API Keys
- Navigate to **Settings** → **API Keys & Webhooks**
- Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
- Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

## Step 2: Update Configuration File

### 2.1 Edit `assets/js/paystack-config.js`
Replace the placeholder values with your actual Paystack credentials:

```javascript
const PAYSTACK_CONFIG = {
  // Replace with your actual Paystack public key
  PUBLIC_KEY: 'pk_test_your_actual_public_key_here',
  
  // Replace with your actual Paystack secret key
  SECRET_KEY: 'sk_test_your_actual_secret_key_here',
  
  // Update with your business email
  BUSINESS_EMAIL: 'your_business_email@domain.com',
  
  // Update with your business name
  BUSINESS_NAME: 'COJJ Gadgets',
  
  // Currency (NGN for Nigerian Naira)
  CURRENCY: 'NGN',
  
  // Set to false when ready for production
  TEST_MODE: true
};
```

### 2.2 Important Notes
- **Test Mode**: Use `pk_test_` keys for testing, `pk_live_` for production
- **Security**: Never expose your secret key in frontend code
- **Email**: Use a valid business email for payment receipts

## Step 3: Test Your Integration

### 3.1 Test Mode
- Use test card numbers provided by Paystack
- Test the complete payment flow
- Verify WhatsApp messages are sent correctly

### 3.2 Test Card Numbers
- **Visa**: 4084 0840 8408 4081
- **Mastercard**: 5105 1051 0510 5100
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **PIN**: Any 4 digits

## Step 4: Go Live

### 4.1 Switch to Live Mode
1. Update your Paystack account to live mode
2. Change `TEST_MODE` to `false` in config
3. Replace test keys with live keys
4. Test with small amounts first

### 4.2 Update Configuration
```javascript
const PAYSTACK_CONFIG = {
  PUBLIC_KEY: 'pk_live_your_live_public_key',
  SECRET_KEY: 'sk_live_your_live_secret_key',
  BUSINESS_EMAIL: 'your_business_email@domain.com',
  BUSINESS_NAME: 'COJJ Gadgets',
  CURRENCY: 'NGN',
  TEST_MODE: false
};
```

## Step 5: Webhook Setup (Optional but Recommended)

### 5.1 Set Up Webhooks
- Go to Paystack Dashboard → **Settings** → **Webhooks**
- Add webhook URL: `https://yourdomain.com/webhook/paystack`
- Select events: `charge.success`, `transfer.success`

### 5.2 Webhook Benefits
- Real-time payment confirmation
- Automatic order status updates
- Better security and reliability

## Features of the New Payment System

### ✅ What's New
1. **Paystack Integration**: Secure card and bank transfer payments
2. **Dual Payment Options**: Choose between Paystack and direct transfer
3. **Email Receipts**: Automatic payment receipts via email
4. **Better UX**: Cleaner payment flow with validation
5. **Mobile Responsive**: Works perfectly on all devices

### 🔄 Payment Flow
1. Customer selects payment method
2. If Paystack: Enter email → Click Pay → Complete payment
3. If Direct Transfer: Show bank details → Upload receipt
4. Order details sent to WhatsApp with payment status

### 💳 Supported Payment Methods
- **Credit/Debit Cards** (Visa, Mastercard, Verve)
- **Bank Transfers** (via Paystack)
- **USSD Payments**
- **Direct Bank Transfer** (existing method)

## Troubleshooting

### Common Issues

#### 1. Payment Button Not Working
- Check if Paystack SDK is loaded
- Verify your public key is correct
- Check browser console for errors

#### 2. Payment Fails
- Ensure amount is in kobo (multiplied by 100)
- Verify email format is valid
- Check Paystack dashboard for error details

#### 3. WhatsApp Message Not Sent
- Verify phone number format
- Check if WhatsApp Web is accessible
- Ensure order details are properly formatted

### Debug Mode
Add this to your browser console to debug:
```javascript
console.log('Paystack Config:', PAYSTACK_CONFIG);
console.log('Cart Total:', total());
console.log('Payment Method:', document.getElementById('payment').value);
```

## Security Considerations

### ✅ Best Practices
1. **HTTPS Only**: Always use HTTPS in production
2. **Key Management**: Keep secret keys secure
3. **Input Validation**: Validate all user inputs
4. **Amount Verification**: Verify amounts on backend
5. **Webhook Verification**: Verify webhook signatures

### ⚠️ Security Warnings
- Never expose secret keys in frontend code
- Always validate payment responses
- Use HTTPS for all payment communications
- Implement proper error handling

## Support

### Paystack Support
- **Documentation**: [docs.paystack.com](https://docs.paystack.com)
- **Support**: support@paystack.com
- **Community**: [community.paystack.com](https://community.paystack.com)

### Technical Support
For website-specific issues, contact your web developer or refer to the code comments.

## Updates and Maintenance

### Regular Checks
- Monitor Paystack dashboard for failed transactions
- Check webhook delivery status
- Review payment success rates
- Update API keys when necessary

### Future Enhancements
- Add payment analytics dashboard
- Implement recurring payments
- Add multiple currency support
- Integrate with inventory management

---

**Note**: This integration maintains your existing WhatsApp order flow while adding secure online payments. Customers can still choose direct transfer if they prefer.
