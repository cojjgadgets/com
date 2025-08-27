// Paystack Configuration
// Replace these values with your actual Paystack credentials

const PAYSTACK_CONFIG = {
  // Your Paystack public key (starts with 'pk_test_' for test mode or 'pk_live_' for live mode)
  PUBLIC_KEY: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  
  // Your Paystack secret key (for backend verification - keep this secure)
  SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  
  // Your business email
  BUSINESS_EMAIL: 'info@cojjgadgets.com',
  
  // Your business name
  BUSINESS_NAME: 'COJJ Gadgets',
  
  // Currency (NGN for Nigerian Naira)
  CURRENCY: 'NGN',
  
  // Test mode (set to false for production)
  TEST_MODE: true
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PAYSTACK_CONFIG;
}
