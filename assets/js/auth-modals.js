// Authentication Modal Management
let currentModal = null;

// Show authentication modal
function showAuthModal(type) {
  // Remove existing modal if any
  const existingModal = document.getElementById('authModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = getModalContent(type);
  
  document.body.appendChild(modal);
  currentModal = modal;

  // Add event listeners
  setupModalEventListeners(type);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Get modal content based on type
function getModalContent(type) {
  switch (type) {
    case 'login':
      return `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Sign In</h2>
            <button class="close-btn" onclick="closeAuthModal()">&times;</button>
          </div>
          <form id="loginForm" class="auth-form">
            <div class="field">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" name="email" required>
            </div>
            <div class="field">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Sign In</button>
            <p class="auth-switch">
              Don't have an account? 
              <a href="#" onclick="switchAuthModal('signup')">Sign up here</a>
            </p>
          </form>
        </div>
      `;
    
    case 'signup':
      return `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create Account</h2>
            <button class="close-btn" onclick="closeAuthModal()">&times;</button>
          </div>
          <form id="signupForm" class="auth-form">
            <div class="field">
              <label for="signupFullName">Full Name</label>
              <input type="text" id="signupFullName" name="fullName" required>
            </div>
            <div class="field">
              <label for="signupEmail">Email</label>
              <input type="email" id="signupEmail" name="email" required>
            </div>
            <div class="field">
              <label for="signupPhone">Phone Number</label>
              <input type="tel" id="signupPhone" name="phone" required>
            </div>
            <div class="field">
              <label for="signupAddress">Address</label>
              <textarea id="signupAddress" name="address" rows="3" placeholder="House number, street, city"></textarea>
            </div>
            <div class="field">
              <label for="signupPassword">Password</label>
              <input type="password" id="signupPassword" name="password" required minlength="6">
            </div>
            <div class="field">
              <label for="signupConfirmPassword">Confirm Password</label>
              <input type="password" id="signupConfirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Create Account</button>
            <p class="auth-switch">
              Already have an account? 
              <a href="#" onclick="switchAuthModal('login')">Sign in here</a>
            </p>
          </form>
        </div>
      `;
    
    case 'profile':
      return `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Profile Settings</h2>
            <button class="close-btn" onclick="closeAuthModal()">&times;</button>
          </div>
          <form id="profileForm" class="auth-form">
            <div class="field">
              <label for="profileFullName">Full Name</label>
              <input type="text" id="profileFullName" name="fullName" required>
            </div>
            <div class="field">
              <label for="profileEmail">Email</label>
              <input type="email" id="profileEmail" name="email" required readonly>
            </div>
            <div class="field">
              <label for="profilePhone">Phone Number</label>
              <input type="tel" id="profilePhone" name="phone" required>
            </div>
            <div class="field">
              <label for="profileAddress">Address</label>
              <textarea id="profileAddress" name="address" rows="3" placeholder="House number, street, city"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </form>
        </div>
      `;
    
    default:
      return '';
  }
}

// Setup modal event listeners
function setupModalEventListeners(type) {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAuthModal();
    }
  });

  // Handle form submission
  const form = modal.querySelector('form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmission(type, form);
    });
  }

  // Load profile data for profile modal
  if (type === 'profile') {
    loadProfileData();
  }
}

// Handle form submission
async function handleFormSubmission(type, form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Processing...';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let result;
    switch (type) {
      case 'login':
        result = await signIn(data.email, data.password);
        break;
      case 'signup':
        if (data.password !== data.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        result = await signUp(data.email, data.password, data.fullName, data.phone, data.address);
        break;
      case 'profile':
        result = await updateUserProfile({
          full_name: data.fullName,
          phone: data.phone,
          address: data.address
        });
        break;
    }

    if (result.success) {
      showNotification(
        type === 'login' ? 'Signed in successfully!' : 
        type === 'signup' ? 'Account created successfully!' : 
        'Profile updated successfully!', 
        'success'
      );
      closeAuthModal();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Load profile data into form
function loadProfileData() {
  const userProfile = getUserProfile();
  if (!userProfile) return;

  const form = document.getElementById('profileForm');
  if (!form) return;

  form.querySelector('#profileFullName').value = userProfile.full_name || '';
  form.querySelector('#profileEmail').value = userProfile.email || '';
  form.querySelector('#profilePhone').value = userProfile.phone || '';
  form.querySelector('#profileAddress').value = userProfile.address || '';
}

// Switch between login and signup modals
function switchAuthModal(type) {
  closeAuthModal();
  setTimeout(() => {
    showAuthModal(type);
  }, 200);
}

// Close authentication modal
function closeAuthModal() {
  if (currentModal) {
    currentModal.classList.remove('show');
    setTimeout(() => {
      if (currentModal && currentModal.parentNode) {
        currentModal.parentNode.removeChild(currentModal);
      }
      currentModal = null;
    }, 300);
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Show order success popup
function showOrderSuccessPopup(orderNumber) {
  // Remove existing popup if any
  const existingPopup = document.getElementById('orderSuccessPopup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'orderSuccessPopup';
  popup.className = 'modal-overlay';
  popup.innerHTML = `
    <div class="modal-content order-success-content">
      <div class="order-success-icon">✅</div>
      <h2>Thanks for shopping with COJJ!</h2>
      <p>Your order has been placed successfully.</p>
      <div class="order-number">
        <strong>Order Number:</strong>
        <span class="order-number-value">${orderNumber}</span>
        <button class="copy-order-btn" onclick="copyOrderNumber('${orderNumber}')">Copy</button>
      </div>
      <p class="order-note">Please keep this order number for tracking your order.</p>
      <button class="btn btn-primary" onclick="closeOrderSuccessPopup()">Continue Shopping</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Show popup with animation
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);
}

// Close order success popup
function closeOrderSuccessPopup() {
  const popup = document.getElementById('orderSuccessPopup');
  if (popup) {
    popup.classList.remove('show');
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 300);
  }
}

// Copy order number to clipboard
function copyOrderNumber(orderNumber) {
  navigator.clipboard.writeText(orderNumber).then(() => {
    showNotification('Order number copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy order number', 'error');
  });
}

// Global functions for HTML onclick handlers
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthModal = switchAuthModal;
window.showOrderSuccessPopup = showOrderSuccessPopup;
window.closeOrderSuccessPopup = closeOrderSuccessPopup;
window.copyOrderNumber = copyOrderNumber;
