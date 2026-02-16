// Products are now defined in HTML (index.html) under <script id="productsData" type="application/json"> ... </script>
// We read/write them via localStorage so other pages can access them.

function getProducts(){
  try{
    return JSON.parse(localStorage.getItem('cojj_products')||'[]');
  }catch(e){
    return [];
  }
}

function setProducts(products){
  localStorage.setItem('cojj_products', JSON.stringify(products||[]));
}

function formatNaira(amount){
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

function getCart(){
  try{
    return JSON.parse(localStorage.getItem('cojj_cart')||'[]');
  }catch(e){
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem('cojj_cart', JSON.stringify(cart));
}

function addToCart(productId, qty=1, selectedSize){
  const cart = getCart();
  const product = getProductById(productId) || {};
  const keyMatcher = (i)=> i.id===productId && (i.size||'')===(selectedSize||'');
  const existing = cart.find(keyMatcher);
  
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({
      id: productId,
      qty,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || ''
    });
  }
  saveCart(cart);
  
  // Show notification
  const displayName = product.name + (selectedSize ? ` — ${selectedSize}` : '');
  showCartNotification(displayName, qty);
}

// Notification system for cart additions
function showCartNotification(productName, quantity) {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.cart-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">✓</div>
      <div class="notification-text">
        <strong>${productName}</strong> added to cart
        ${quantity > 1 ? ` (${quantity} items)` : ''}
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function removeFromCart(productId){
  saveCart(getCart().filter(i=>i.id!==productId));
}

function setQty(productId, qty){
  const cart = getCart();
  const item = cart.find(i=>i.id===productId);
  if(item){ item.qty = Math.max(1, qty); saveCart(cart); }
}

function getProductById(id){
  return getProducts().find(p=>p.id===id);
}


