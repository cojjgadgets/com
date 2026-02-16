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

  // Render products grid with pagination
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const pagination = document.getElementById('pagination');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageNumbers = document.getElementById('pageNumbers');
  
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
        specs: el.getAttribute('data-specs')||'',
        category: el.getAttribute('data-category')||'',
        subcategory: el.getAttribute('data-subcategory')||'',
        sizeType: el.getAttribute('data-size-type')||''
      }));
      if (htmlProducts.length) setProducts(htmlProducts);
    }

    // Pagination variables
    const productsPerPage = 50;
    let currentPage = 1;
    let currentProducts = [];
    let filteredProducts = [];

    const render = (items, page = 1)=>{
      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const pageItems = items.slice(startIndex, endIndex);
      
      grid.innerHTML = pageItems.map(p => `
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

    const renderPagination = (totalItems, currentPage) => {
      const totalPages = Math.ceil(totalItems / productsPerPage);
      
      // Update prev/next buttons
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
      
      // Generate page numbers
      let pageNumbersHTML = '';
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbersHTML += `<button class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      
      pageNumbers.innerHTML = pageNumbersHTML;
      
      // Add click events to page numbers
      pageNumbers.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', () => {
          goToPage(parseInt(btn.dataset.page));
        });
      });
    };

    const goToPage = (page) => {
      currentPage = page;
      render(filteredProducts, currentPage);
      renderPagination(filteredProducts.length, currentPage);
      window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    };

    const doSearch = ()=>{
      const q = (searchInput?.value||'').toLowerCase().trim();
      const all = getProducts();
      filteredProducts = all.filter(p => p.name.toLowerCase().includes(q) || (p.specs||'').toLowerCase().includes(q));
      currentPage = 1; // Reset to first page on search
      render(filteredProducts, currentPage);
      renderPagination(filteredProducts.length, currentPage);
    };

    // Initialize
    const products = getProducts();
    if(!products.length){
      grid.innerHTML = '<p>Loading products... If nothing appears, please reload Home.</p>';
    } else {
      filteredProducts = products;
      render(filteredProducts, currentPage);
      renderPagination(filteredProducts.length, currentPage);
    }

    // Event listeners
    if (searchButton) searchButton.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('input', doSearch);
    
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) goToPage(currentPage - 1);
    });
    
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      if (currentPage < totalPages) goToPage(currentPage + 1);
    });
  }
});


