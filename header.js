import { authService } from './auth.js';
import { themeManager } from './theme.js';
import { i18n } from './i18n.js';
import { cartService } from './cart.js';
import { wishlistService } from './wishlist.js';
import { animationManager } from './animations.js';

// ============================================
// HEADER COMPONENT - Premium Header for Madhav Prajapati Art
// Bagwali, Panchkula - Handcrafted Clay Diyas
// ============================================

export class Header {
  constructor() {
    this.element = null;
    this.searchTimeout = null;
    this.isSearchOpen = false;
  }

  /**
   * Render header
   */
  render() {
    const header = document.createElement('header');
    header.className = 'luxury-header glass-effect';
    header.setAttribute('data-animate', 'fadeInDown');
    
    header.innerHTML = `
      <div class="header-container">
        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle" id="menuToggle" aria-label="Menu">
          <i class="fas fa-bars"></i>
        </button>
        
        <!-- Logo -->
        <div class="logo" data-nav data-href="home">
          <div class="logo-text-wrapper">
            <span class="logo-madhav">MADHAV PRAJAPATI</span>
            <span class="logo-art">ART</span>
          </div>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="main-nav" id="mainNav">
          <ul class="nav-list">
            <li><a href="#home" class="nav-link" data-nav data-i18n="home">Home</a></li>
            <li><a href="#products" class="nav-link" data-nav data-i18n="products">Products</a></li>
            <li><a href="#about" class="nav-link" data-nav data-i18n="about">About</a></li>
            <li><a href="#contact" class="nav-link" data-nav data-i18n="contact">Contact</a></li>
            <li><a href="#faq" class="nav-link" data-nav data-i18n="faq">FAQ</a></li>
          </ul>
          
          <!-- Auth Section -->
          <div class="nav-auth" id="navAuth"></div>
        </nav>
        
        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Search Toggle -->
          <button class="search-toggle" id="searchToggle" aria-label="Search">
            <i class="fas fa-search"></i>
          </button>
          
          <!-- Theme Toggle -->
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
            <i class="fas ${themeManager.isDark ? 'fa-sun' : 'fa-moon'}"></i>
          </button>
          
          <!-- Language Toggle -->
          <button class="lang-toggle" id="langToggle" aria-label="Toggle language">
            ${i18n.currentLang === 'en' ? 'HI' : 'EN'}
          </button>
          
          <!-- Wishlist Icon -->
          <button class="wishlist-icon" id="wishlistIcon" aria-label="Wishlist">
            <i class="far fa-heart"></i>
            <span class="wishlist-count">0</span>
          </button>
          
          <!-- Cart Icon -->
          <button class="cart-icon" id="cartIcon" aria-label="Cart">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-count">0</span>
          </button>
        </div>
      </div>
      
      <!-- Search Bar (Hidden by default) -->
      <div class="search-bar" id="searchBar" style="display: none;">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            id="globalSearch" 
            placeholder="Search diyas, collections..." 
            aria-label="Global search"
            data-i18n-placeholder="search_placeholder"
          >
          <button class="search-close" id="searchClose" aria-label="Close search">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    `;

    this.element = header;
    this.attachEventListeners();
    this.updateAuthUI();
    this.updateCartCount();
    this.updateWishlistCount();
    
    return header;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Mobile menu toggle
    const menuToggle = this.element.querySelector('#menuToggle');
    const mainNav = this.element.querySelector('#mainNav');
    
    menuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    // Theme toggle
    const themeToggle = this.element.querySelector('#themeToggle');
    themeToggle?.addEventListener('click', () => {
      themeManager.toggle();
      const icon = themeToggle.querySelector('i');
      icon.className = themeManager.isDark ? 'fas fa-sun' : 'fas fa-moon';
      this.showNotification(`Switched to ${themeManager.isDark ? 'dark' : 'light'} mode`, 'info');
    });

    // Language toggle
    const langToggle = this.element.querySelector('#langToggle');
    langToggle?.addEventListener('click', () => {
      i18n.toggleLanguage();
      langToggle.textContent = i18n.currentLang === 'en' ? 'HI' : 'EN';
      this.showNotification(`Language switched to ${i18n.currentLang === 'en' ? 'English' : 'Hindi'}`, 'info');
    });

    // Cart icon
    const cartIcon = this.element.querySelector('#cartIcon');
    cartIcon?.addEventListener('click', () => window.location.hash = 'cart');

    // Wishlist icon
    const wishlistIcon = this.element.querySelector('#wishlistIcon');
    wishlistIcon?.addEventListener('click', () => {
      if (!authService.currentUser) {
        if (confirm('Please login to view your wishlist')) {
          window.location.hash = 'login?redirect=wishlist';
        }
      } else {
        window.location.hash = 'wishlist';
      }
    });

    // Logo click
    const logo = this.element.querySelector('.logo');
    logo?.addEventListener('click', () => window.location.hash = 'home');

    // Search toggle
    const searchToggle = this.element.querySelector('#searchToggle');
    const searchBar = this.element.querySelector('#searchBar');
    const searchClose = this.element.querySelector('#searchClose');
    const searchInput = this.element.querySelector('#globalSearch');

    searchToggle?.addEventListener('click', () => {
      this.isSearchOpen = !this.isSearchOpen;
      searchBar.style.display = this.isSearchOpen ? 'block' : 'none';
      if (this.isSearchOpen) {
        searchInput.focus();
        searchToggle.classList.add('active');
      } else {
        searchToggle.classList.remove('active');
        this.clearSearch();
      }
    });

    searchClose?.addEventListener('click', () => {
      this.isSearchOpen = false;
      searchBar.style.display = 'none';
      searchToggle.classList.remove('active');
      this.clearSearch();
    });

    // Search input with debounce
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        this.clearSearch();
        return;
      }
      
      this.searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Close search on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isSearchOpen) {
        searchClose.click();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mainNav?.classList.contains('active')) {
        if (!this.element.contains(e.target) || e.target.closest('.nav-link')) {
          mainNav.classList.remove('active');
          document.body.classList.remove('nav-open');
        }
      }
    });

    // Listen for auth changes
    window.addEventListener('authStateChanged', () => this.updateAuthUI());
    
    // Subscribe to cart changes
    cartService.subscribe(() => {
      this.updateCartCount();
      this.animateCartIcon();
    });
    
    // Subscribe to wishlist changes
    wishlistService.subscribe(() => {
      this.updateWishlistCount();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav?.classList.contains('active')) {
        mainNav.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  }

  /**
   * Update authentication UI
   */
  updateAuthUI() {
    const navAuth = this.element.querySelector('#navAuth');
    if (!navAuth) return;

    const user = authService.currentUser;

    if (user) {
      navAuth.innerHTML = `
        <div class="user-menu">
          <button class="btn btn-outline user-menu-btn">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">${this.truncateName(user.displayName || user.email?.split('@')[0] || 'Account')}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="user-dropdown">
            <div class="dropdown-header">
              <p class="user-email">${user.email}</p>
            </div>
            <a href="#profile" data-nav class="dropdown-item">
              <i class="fas fa-user"></i> <span data-i18n="my_profile">My Profile</span>
            </a>
            <a href="#orders" data-nav class="dropdown-item">
              <i class="fas fa-shopping-bag"></i> <span data-i18n="my_orders">My Orders</span>
            </a>
            <a href="#wishlist" data-nav class="dropdown-item">
              <i class="fas fa-heart"></i> <span data-i18n="wishlist">Wishlist</span>
              <span class="dropdown-badge" id="wishlistDropdownBadge">0</span>
            </a>
            <a href="#addresses" data-nav class="dropdown-item">
              <i class="fas fa-map-marker-alt"></i> <span data-i18n="addresses">Addresses</span>
            </a>
            ${user.role === 'admin' ? `
              <div class="dropdown-divider"></div>
              <a href="#admin" data-nav class="dropdown-item">
                <i class="fas fa-cog"></i> <span data-i18n="admin_panel">Admin Panel</span>
              </a>
            ` : ''}
            <div class="dropdown-divider"></div>
            <button id="logoutBtn" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i> <span data-i18n="logout">Logout</span>
            </button>
          </div>
        </div>
      `;

      // Update wishlist badge in dropdown
      this.updateWishlistDropdownBadge();

      const logoutBtn = navAuth.querySelector('#logoutBtn');
      logoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmed = confirm('Are you sure you want to logout?');
        if (confirmed) {
          await authService.signOut();
          window.location.hash = 'home';
          this.showNotification('Logged out successfully', 'success');
        }
      });

      const userMenuBtn = navAuth.querySelector('.user-menu-btn');
      const dropdown = navAuth.querySelector('.user-dropdown');
      
      userMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn?.contains(e.target)) {
          dropdown?.classList.remove('show');
        }
      });

    } else {
      navAuth.innerHTML = `
        <button class="btn btn-outline" id="loginBtn" data-nav data-href="login" data-i18n="login">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
        <button class="btn btn-primary" id="signupBtn" data-nav data-href="signup" data-i18n="signup">
          Sign Up
        </button>
      `;

      navAuth.querySelector('#loginBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'login';
      });

      navAuth.querySelector('#signupBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'signup';
      });
    }
    
    i18n.updatePageContent();
  }

  /**
   * Update cart count
   */
  updateCartCount() {
    const cartCount = this.element.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = cartService.getItemCount();
    }
  }

  /**
   * Update wishlist count
   */
  updateWishlistCount() {
    const wishlistCount = this.element.querySelector('.wishlist-count');
    if (wishlistCount) {
      wishlistCount.textContent = wishlistService.getWishlistCount();
    }
  }

  /**
   * Update wishlist badge in dropdown
   */
  updateWishlistDropdownBadge() {
    const badge = this.element.querySelector('#wishlistDropdownBadge');
    if (badge) {
      badge.textContent = wishlistService.getWishlistCount();
    }
  }

  /**
   * Animate cart icon when item added
   */
  animateCartIcon() {
    const cartIcon = this.element.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    }
  }

  /**
   * Perform global search
   */
  async performSearch(query) {
    const resultsContainer = this.element.querySelector('#searchResults');
    
    try {
      // Show loading
      resultsContainer.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
      resultsContainer.style.display = 'block';
      
      // Simulate API call - replace with actual search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results
      const mockResults = [
        { name: 'Premium Gold Diya', category: 'Diwali', price: '₹899' },
        { name: 'Wedding Special Diya Set', category: 'Wedding', price: '₹1,499' },
        { name: 'Temple Diya - Large', category: 'Temple', price: '₹599' },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      
      if (mockResults.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-no-results">
            <i class="fas fa-search"></i>
            <p>No results found for "${query}"</p>
            <p class="suggestion">Try different keywords or browse our collections</p>
          </div>
        `;
        return;
      }
      
      resultsContainer.innerHTML = `
        <div class="search-results-header">
          <span>Products (${mockResults.length})</span>
          <button class="view-all-results" data-query="${query}">View All</button>
        </div>
        <div class="search-results-list">
          ${mockResults.map(item => `
            <a href="#products?search=${encodeURIComponent(query)}" class="search-result-item">
              <div class="result-icon"><i class="fas fa-box"></i></div>
              <div class="result-details">
                <span class="result-name">${item.name}</span>
                <span class="result-category">${item.category}</span>
              </div>
              <span class="result-price">${item.price}</span>
            </a>
          `).join('')}
        </div>
      `;
      
      // Add view all click handler
      const viewAllBtn = resultsContainer.querySelector('.view-all-results');
      viewAllBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = `products?search=${encodeURIComponent(query)}`;
        this.closeSearch();
      });
      
    } catch (error) {
      console.error('Search error:', error);
      resultsContainer.innerHTML = '<div class="search-error">Error performing search. Please try again.</div>';
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    const resultsContainer = this.element.querySelector('#searchResults');
    const searchInput = this.element.querySelector('#globalSearch');
    
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
    }
    
    if (searchInput) {
      searchInput.value = '';
    }
  }

  /**
   * Close search
   */
  closeSearch() {
    this.isSearchOpen = false;
    const searchBar = this.element.querySelector('#searchBar');
    const searchToggle = this.element.querySelector('#searchToggle');
    
    if (searchBar) searchBar.style.display = 'none';
    if (searchToggle) searchToggle.classList.remove('active');
    
    this.clearSearch();
  }

  /**
   * Truncate long names
   */
  truncateName(name, maxLength = 15) {
    if (!name) return 'Account';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const event = new CustomEvent('showNotification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  /**
   * Update active navigation link
   */
  updateActiveLink(path) {
    this.element.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.includes(path)) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Get header element
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy header
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    console.log('🧹 Header destroyed');
  }
}

// ============================================
// HEADER STYLES
// ============================================

const style = document.createElement('style');
style.textContent = `
  .luxury-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(212,175,55,0.2);
  }

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .logo-text-wrapper {
    display: flex;
    flex-direction: column;
  }

  .logo-madhav {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #0F0F0F;
    text-transform: uppercase;
    line-height: 1.2;
  }

  .logo-art {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 3px;
    color: #D4AF37;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 2px;
  }

  .main-nav {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-list {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    color: #0F0F0F;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.2s ease;
    position: relative;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #D4AF37, #FF8C42);
    transition: width 0.2s ease;
  }

  .nav-link:hover {
    color: #D4AF37;
  }

  .nav-link:hover::after,
  .nav-link.active::after {
    width: 100%;
  }

  .nav-link.active {
    color: #D4AF37;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-actions button {
    background: none;
    border: none;
    cursor: pointer;
    color: #0F0F0F;
    font-size: 1.1rem;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;
    position: relative;
  }

  .header-actions button:hover {
    background: rgba(212,175,55,0.1);
    color: #D4AF37;
    transform: scale(1.1);
  }

  .cart-icon, .wishlist-icon {
    position: relative;
  }

  .cart-count, .wishlist-count {
    position: absolute;
    top: 0;
    right: 0;
    background: #D4AF37;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lang-toggle {
    font-weight: 600;
    font-size: 0.9rem !important;
    width: 40px;
  }

  .menu-toggle {
    display: none;
    font-size: 1.3rem;
  }

  /* User Menu */
  .user-menu {
    position: relative;
  }

  .user-menu-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(212,175,55,0.1);
    border: 1px solid rgba(212,175,55,0.2);
    border-radius: 50px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .user-menu-btn:hover {
    background: rgba(212,175,55,0.15);
    border-color: #D4AF37;
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 240px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 1px solid rgba(212,175,55,0.1);
    display: none;
    z-index: 1000;
  }

  .user-dropdown.show {
    display: block;
    animation: slideDown 0.2s ease;
  }

  .dropdown-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .user-email {
    font-size: 0.85rem;
    color: #666;
    word-break: break-all;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #0F0F0F;
    text-decoration: none;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .dropdown-item:hover {
    background: rgba(212,175,55,0.05);
    color: #D4AF37;
  }

  .dropdown-divider {
    height: 1px;
    background: rgba(0,0,0,0.05);
    margin: 0.5rem 0;
  }

  .dropdown-badge {
    margin-left: auto;
    background: #D4AF37;
    color: white;
    padding: 0.15rem 0.5rem;
    border-radius: 50px;
    font-size: 0.7rem;
  }

  /* Search Bar */
  .search-bar {
    padding: 1rem 2rem;
    border-top: 1px solid rgba(212,175,55,0.1);
    background: white;
  }

  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  .search-container input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid transparent;
    border-radius: 50px;
    background: #f5f5f5;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .search-container input:focus {
    outline: none;
    border-color: #D4AF37;
    background: white;
    box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
  }

  .search-close {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 0.5rem;
  }

  .search-close:hover {
    color: #D4AF37;
  }

  .search-results {
    max-width: 600px;
    margin: 0.5rem auto 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 1px solid rgba(212,175,55,0.1);
    overflow: hidden;
  }

  .search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .search-results-header span {
    font-weight: 600;
    color: #0F0F0F;
  }

  .view-all-results {
    background: none;
    border: none;
    color: #D4AF37;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .search-results-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .search-result-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s ease;
  }

  .search-result-item:hover {
    background: rgba(212,175,55,0.05);
  }

  .result-icon {
    width: 40px;
    height: 40px;
    background: #f5f5f5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #D4AF37;
  }

  .result-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .result-name {
    font-weight: 500;
    color: #0F0F0F;
  }

  .result-category {
    font-size: 0.8rem;
    color: #999;
  }

  .result-price {
    font-weight: 600;
    color: #D4AF37;
  }

  .search-loading,
  .search-no-results,
  .search-error {
    padding: 2rem;
    text-align: center;
    color: #666;
  }

  .search-loading i {
    margin-right: 0.5rem;
    color: #D4AF37;
  }

  .suggestion {
    font-size: 0.85rem;
    color: #999;
    margin-top: 0.5rem;
  }

  /* Animations */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  .bounce {
    animation: bounce 0.5s ease;
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .luxury-header {
      background: rgba(15,15,15,0.95);
    }

    .logo-madhav {
      color: #FFFFFF;
    }

    .nav-link {
      color: #FFFFFF;
    }

    .header-actions button {
      color: #FFFFFF;
    }

    .user-dropdown,
    .search-bar,
    .search-results {
      background: #1A1A1A;
      border-color: rgba(212,175,55,0.1);
    }

    .search-container input {
      background: #2A2A2A;
      color: #FFFFFF;
    }

    .result-name {
      color: #FFFFFF;
    }

    .dropdown-item {
      color: #FFFFFF;
    }

    .dropdown-item:hover {
      background: rgba(212,175,55,0.1);
    }

    .dropdown-divider {
      background: rgba(255,255,255,0.1);
    }

    .user-email {
      color: #CCCCCC;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .header-container {
      padding: 0.75rem 1rem;
    }

    .menu-toggle {
      display: block;
    }

    .logo-madhav {
      font-size: 14px;
    }

    .logo-art {
      font-size: 18px;
    }

    .main-nav {
      position: fixed;
      top: 70px;
      left: -100%;
      width: 100%;
      height: calc(100vh - 70px);
      background: white;
      flex-direction: column;
      align-items: flex-start;
      padding: 2rem;
      transition: left 0.3s ease;
      z-index: 999;
      overflow-y: auto;
    }

    .main-nav.active {
      left: 0;
    }

    .nav-list {
      flex-direction: column;
      width: 100%;
      gap: 1rem;
    }

    .nav-link {
      display: block;
      padding: 0.75rem 0;
      font-size: 1.1rem;
    }

    .nav-auth {
      width: 100%;
      margin-top: 2rem;
    }

    .nav-auth .btn {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .user-menu-btn {
      width: 100%;
      justify-content: space-between;
    }

    .user-dropdown {
      position: static;
      width: 100%;
      margin-top: 1rem;
      box-shadow: none;
    }

    .header-actions {
      gap: 0.5rem;
    }

    .search-bar {
      padding: 1rem;
    }
  }
`;

document.head.appendChild(style);

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const header = new Header();

// Export default for easy import
export default header;