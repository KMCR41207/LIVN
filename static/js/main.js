// ── Navbar scroll effect ──
const navbarWrapper = document.querySelector('.navbar-wrapper');
if (navbarWrapper) {
  window.addEventListener('scroll', () => {
    navbarWrapper.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ── Mobile menu toggle ──
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileMenuBtn.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });
}

// ── Active nav link ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPage) link.classList.add('active');
});

// ── Scroll-to-category from query param ──
function scrollToCategory() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat) {
    setTimeout(() => {
      const el = document.getElementById(cat);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

// ── Render product card HTML ──
function productCardHTML(product) {
  return `
    <div class="product-card" onclick="window.location='product.html?id=${product.id}'">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
        <div class="product-overlay"></div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-category">${product.category}</p>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </div>`;
}

// ── Render category card HTML ──
function categoryCardHTML(cat) {
  return `
    <div class="category-card" onclick="window.location='collections.html?category=${cat.slug}'">
      <div class="category-img-container">
        <img src="${cat.image}" alt="${cat.name}" class="category-img" loading="lazy" />
        <div class="category-border"></div>
      </div>
      <h3 class="category-name">${cat.name}</h3>
    </div>`;
}
