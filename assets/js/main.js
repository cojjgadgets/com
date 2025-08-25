document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Cart count
  const cartCountEl = document.getElementById('cartCount');
  function updateCartCount(){
    if(!cartCountEl) return;
    const totalQty = getCart().reduce((n,i)=> n + (i.qty||0), 0);
    cartCountEl.textContent = String(totalQty);
  }
  updateCartCount();

  // Hamburger Menu
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      }
    });
  }

  // Slider
  const slider = document.getElementById('heroSlider');
  if (slider){
    const slides = slider.querySelector('.slides');
    const images = slides.querySelectorAll('img');
    let index = 0;
    const go = (i)=>{
      index = (i + images.length) % images.length;
      slides.style.transform = `translateX(-${index*100}%)`;
    };
    slider.querySelector('.next').addEventListener('click', ()=> go(index+1));
    slider.querySelector('.prev').addEventListener('click', ()=> go(index-1));
    setInterval(()=> go(index+1), 4500);
  }

  // Render products grid
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  if (grid){
    // If HTML source is present, parse and persist
    const source = document.getElementById('productsSource');
    if (source){
      const htmlProducts = Array.from(source.querySelectorAll('[data-product]')).map(el=>({
        id: el.getAttribute('data-id'),
        name: el.getAttribute('data-name'),
        price: Number(el.getAttribute('data-price')||0),
        image: el.getAttribute('data-image'),
        images: (el.getAttribute('data-images')||'').split('|').filter(Boolean),
        specs: el.getAttribute('data-specs')||''
      }));
      if (htmlProducts.length) setProducts(htmlProducts);
    }

    const render = (items)=>{
      grid.innerHTML = items.map(p => `
        <article class="card" aria-label="${p.name}">
          <img src="${p.image}" alt="${p.name} - gadgets in Lagos" loading="lazy" />
          <div class="content">
            <h3>${p.name}</h3>
            <div class="price">${formatNaira(p.price)}</div>
          </div>
          <div class="actions">
            <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.name}">View</a>
            <button type="button" data-id="${p.id}" class="add">Add to Cart</button>
          </div>
        </article>
      `).join('');
      grid.querySelectorAll('button.add').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          addToCart(btn.dataset.id, 1);
          updateCartCount();
        });
      });
    };
    const products = getProducts();
    if(!products.length){
      grid.innerHTML = '<p>Loading products... If nothing appears, please reload Home.</p>';
    } else {
      render(products);
    }

    const doSearch = ()=>{
      const q = (searchInput?.value||'').toLowerCase().trim();
      const all = getProducts();
      const filtered = all.filter(p => p.name.toLowerCase().includes(q) || (p.specs||'').toLowerCase().includes(q));
      render(filtered);
    };
    if (searchButton) searchButton.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('input', doSearch);
  }
});


