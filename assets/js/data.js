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

function addToCart(productId, qty=1){
  const cart = getCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing){
    existing.qty += qty;
  } else {
    const product = getProductById(productId) || {};
    cart.push({
      id: productId,
      qty,
      name: product.name,
      price: product.price,
      image: product.image
    });
  }
  saveCart(cart);
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


