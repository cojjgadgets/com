// Supabase Configuration
const SUPABASE_URL = 'https://ysspubgmjadtamozwtby.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzc3B1YmdtamFkdGFtb3p3dGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDEyMDQsImV4cCI6MjA3MjY3NzIwNH0.ATgegDQJKgJ3lzUwjwlVmZUeDFtZr1kcqfjxIc5I2_8';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication state management
let currentUser = null;
let userProfile = null;

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initializeAuth();
});

// Initialize authentication state
async function initializeAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
      await loadUserProfile();
      updateAuthUI();
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}

// Load user profile from database
async function loadUserProfile() {
  if (!currentUser) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading user profile:', error);
      return;
    }
    
    userProfile = data;
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Sign up function
async function signUp(email, password, fullName, phone, address) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabaseClient
        .from('user_profiles')
        .insert([
          {
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            address: address,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      currentUser = data.user;
      await loadUserProfile();
      updateAuthUI();
      return { success: true, user: data.user };
    }
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in function
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw error;
    }

    currentUser = data.user;
    await loadUserProfile();
    updateAuthUI();
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out function
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    currentUser = null;
    userProfile = null;
    updateAuthUI();
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
async function updateUserProfile(updates) {
  if (!currentUser || !userProfile) return { success: false, error: 'No user logged in' };

  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update(updates)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    // Update local profile
    userProfile = { ...userProfile, ...updates };
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

// Submit order to Supabase
async function submitOrder(orderData) {
  if (!currentUser) return { success: false, error: 'User not logged in' };

  try {
    // Generate order number
    const orderNumber = 'COJJ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const order = {
      order_number: orderNumber,
      user_id: currentUser.id,
      items: orderData.items,
      total_amount: orderData.totalAmount,
      customer_name: userProfile?.full_name || orderData.customerName,
      customer_email: userProfile?.email || orderData.customerEmail,
      customer_phone: userProfile?.phone || orderData.customerPhone,
      customer_address: userProfile?.address || orderData.customerAddress,
      fulfillment_method: orderData.fulfillment,
      payment_method: orderData.payment,
      color_preference: orderData.color,
      payment_receipt_url: orderData.receiptUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Submitting order:', order);

    const { data, error } = await supabaseClient
      .from('orders')
      .insert([order])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.error('No data returned from order insertion');
      return { success: false, error: 'No data returned from order insertion' };
    }

    const orderId = data[0].id;
    console.log('Order submitted successfully:', orderId);

    // Order submitted successfully - no additional notifications

    return { success: true, orderNumber: orderNumber, orderId: orderId };
  } catch (error) {
    console.error('Error submitting order:', error);
    return { success: false, error: error.message };
  }
}

// Notification functions removed to prevent errors
// Orders will be saved to Supabase and success popup will show

// Upload payment receipt
async function uploadReceipt(file) {
  if (!currentUser) return { success: false, error: 'User not logged in' };

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    // Use user ID as folder name to match RLS policy
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('payment-receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw uploadError;
    }

    const { data } = supabaseClient.storage
      .from('payment-receipts')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return { success: false, error: error.message };
  }
}

// Update authentication UI
function updateAuthUI() {
  const authButtonsMobile = document.querySelector('.auth-buttons-mobile');
  if (!authButtonsMobile) return;

  if (currentUser) {
    authButtonsMobile.innerHTML = `
      <div class="user-menu-mobile">
        <span class="user-name">${userProfile?.full_name || currentUser.email}</span>
        <button class="btn btn-sm" onclick="showProfileModal()">Profile</button>
        <button class="btn btn-sm" onclick="signOutUser()">Sign Out</button>
      </div>
    `;
  } else {
    authButtonsMobile.innerHTML = `
      <button class="btn btn-sm" onclick="showLoginModal()">Login</button>
      <button class="btn btn-sm" onclick="showSignupModal()">Sign Up</button>
    `;
  }
}

// Global functions for HTML onclick handlers
window.showLoginModal = () => showAuthModal('login');
window.showSignupModal = () => showAuthModal('signup');
window.showProfileModal = () => showAuthModal('profile');
window.signOutUser = async () => {
  const result = await signOut();
  if (result.success) {
    showNotification('Signed out successfully', 'success');
  } else {
    showNotification('Error signing out: ' + result.error, 'error');
  }
};

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Get user profile
function getUserProfile() {
  return userProfile;
}

// Check if user is logged in
function isLoggedIn() {
  return currentUser !== null;
}
