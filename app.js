import { authService } from './auth.js';
import { i18n } from './i18n.js';
import { themeManager } from './theme.js';
import { cartService } from './cart.js';
import { wishlistService } from './wishlist.js';
import { animationManager } from './animations.js';
import { HomePage } from './home.js';
import { ProductsPage } from './products.js';
import { ProductDetailPage } from './product-detail.js';
import { CartPage } from './cart.js';
import { CheckoutPage } from './checkout.js';
import { LoginPage } from './login.js';
import { AboutPage } from './about.js';
import { ContactPage } from './contact.js';
import { FAQPage } from './faq.js';
import { PrivacyPage } from './privacy.js';
import { TermsPage } from './terms.js';
import { AdminPanel } from './admin.js';
import { header } from './header.js';
import { footer } from './footer.js';
import { VirtualDiya } from './virtual-diya.js';

// ============================================
// MAIN APP CLASS - FIXED & OPTIMIZED
// ============================================
class App {
  constructor() {
    this.i18n = i18n;
    this.theme = themeManager;
    this.animations = animationManager;
    this.currentPage = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      this.renderLayout();
      this.initEventListeners();
      await this.initCart();
      await this.initWishlist();
      this.loadPreferences();
      this.initVirtualDiya();
      
      // Handle routing
      window.addEventListener('hashchange', () => this.handleRoute());
      window.addEventListener('load', () => this.handleRoute());
      
      this.isInitialized = true;
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      this.showError('Failed to initialize app. Please refresh the page.');
    }
  }

  // ============================================
  // LAYOUT RENDERING
  // ============================================
  renderLayout() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('❌ #app element not found');
      return;
    }
    
    app.innerHTML = '';
    
    // Add header
    try {
      app.appendChild(header.render());
    } catch (error) {
      console.error('❌ Failed to render header:', error);
      this.renderFallbackHeader(app);
    }
    
    // Add main content container
    const main = document.createElement('main');
    main.id = 'main-content';
    app.appendChild(main);
    
    // Add footer
    try {
      app.appendChild(footer.render());
    } catch (error) {
      console.error('❌ Failed to render footer:', error);
      this.renderFallbackFooter(app);
    }
  }

  renderFallbackHeader(app) {
    const fallbackHeader = document.createElement('header');
    fallbackHeader.className = 'luxury-header glass-effect';
    fallbackHeader.innerHTML = `
      <div class="header-container">
        <div class="logo">
          <span style="font-size: 1.5rem; font-weight: 700; color: #D4AF37;">MP Art</span>
        </div>
        <nav style="display: flex; gap: 2rem;">
          <a href="#home" style="color: #0F0F0F; text-decoration: none;">Home</a>
          <a href="#products" style="color: #0F0F0F; text-decoration: none;">Products</a>
          <a href="#about" style="color: #0F0F0F; text-decoration: none;">About</a>
        </nav>
      </div>
    `;
    app.appendChild(fallbackHeader);
  }

  renderFallbackFooter(app) {
    const fallbackFooter = document.createElement('footer');
    fallbackFooter.className = 'luxury-footer';
    fallbackFooter.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p>© 2026 Madhav Prajapati Art. All rights reserved.</p>
      </div>
    `;
    app.appendChild(fallbackFooter);
  }

  // ============================================
  // ROUTING
  // ============================================
  async handleRoute() {
    let hash = window.location.hash.slice(1) || 'home';
    if (!hash || hash === '') hash = 'home';
    
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
      console.error('❌ #main-content not found');
      return;
    }
    
    // Show loading spinner
    this.showLoading(mainContent);
    
    try {
      // Clean up previous page
      if (this.currentPage && typeof this.currentPage.destroy === 'function') {
        this.currentPage.destroy();
      }
      
      // Route to appropriate page
      switch(path) {
        case 'home':
          this.currentPage = new HomePage(mainContent);
          break;
        case 'products':
          this.currentPage = new ProductsPage(mainContent, params);
          break;
        case 'product-detail':
          this.currentPage = new ProductDetailPage(mainContent, params);
          break;
        case 'cart':
          this.currentPage = new CartPage(mainContent);
          break;
        case 'checkout':
          this.currentPage = new CheckoutPage(mainContent);
          break;
        case 'login':
          this.currentPage = new LoginPage(mainContent, params);
          break;
        case 'signup':
          this.currentPage = new LoginPage(mainContent, params, 'signup');
          break;
        case 'about':
          this.currentPage = new AboutPage(mainContent);
          break;
        case 'contact':
          this.currentPage = new ContactPage(mainContent);
          break;
        case 'faq':
          this.currentPage = new FAQPage(mainContent);
          break;
        case 'privacy':
          this.currentPage = new PrivacyPage(mainContent);
          break;
        case 'terms':
          this.currentPage = new TermsPage(mainContent);
          break;
        case 'admin':
          this.currentPage = new AdminPanel(mainContent);
          break;
        default:
          // 404 - Page not found
          this.renderNotFound(mainContent);
          return;
      }
      
      // Update active navigation
      this.updateActiveNav(path);
      
      // Animate page entrance
      this.animations.animateElement(mainContent, 'fadeInUp', 600);
      
    } catch (error) {
      console.error('❌ Error loading page:', error);
      this.renderError(mainContent, error);
    }
  }

  showLoading(container) {
    container.innerHTML = `
      <div class="loading-spinner" style="text-align: center; padding: 4rem 2rem;">
        <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(212,175,55,0.1); border-top-color: #D4AF37; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="margin-top: 1rem; color: #666; font-weight: 500;">Loading Madhav Prajapati Art...</p>
      </div>
    `;
  }

  renderNotFound(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 5rem 2rem; max-width: 600px; margin: 0 auto;">
        <span style="font-size: 6rem; color: #D4AF37; opacity: 0.5;">404</span>
        <h2 style="margin: 1rem 0; color: #0F0F0F;">Page Not Found</h2>
        <p style="color: #666; margin-bottom: 2rem;">The page you're looking for doesn't exist or has been moved.</p>
        <button onclick="window.location.hash='home'" class="btn btn-primary" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #D4AF37, #FF8C42); color: white; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-home"></i> Return Home
        </button>
      </div>
    `;
  }

  renderError(container, error) {
    container.innerHTML = `
      <div class="error-page" style="text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #DC3545; margin-bottom: 1rem;"></i>
        <h2 style="margin-bottom: 1rem; color: #0F0F0F;">Something Went Wrong</h2>
        <p style="color: #666; margin-bottom: 0.5rem;">${error.message || 'Failed to load page'}</p>
        <p style="color: #999; font-size: 0.85rem; margin-bottom: 2rem;">Please try refreshing the page</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="location.reload()" class="btn btn-outline" style="padding: 0.75rem 2rem; border: 2px solid #D4AF37; background: transparent; color: #D4AF37; border-radius: 50px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <button onclick="window.location.hash='home'" class="btn btn-primary" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #D4AF37, #FF8C42); color: white; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-home"></i> Go Home
          </button>
        </div>
      </div>
    `;
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  initEventListeners() {
    // Global click handler
    document.addEventListener('click', (e) => {
      // Navigation
      if (e.target.matches('[data-nav]') || e.target.closest('[data-nav]')) {
        this.handleNavigationClick(e);
      }
      
      // Add to cart
      if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
        this.handleAddToCartClick(e);
      }
      
      // Buy now
      if (e.target.matches('.buy-now') || e.target.closest('.buy-now')) {
        this.handleBuyNowClick(e);
      }
      
      // Wishlist
      if (e.target.matches('.wishlist-btn') || e.target.closest('.wishlist-btn')) {
        this.handleWishlistClick(e);
      }
    });
    
    // Custom events
    document.addEventListener('addToCart', async (e) => {
      const { product, quantity = 1, checkout = false } = e.detail;
      await this.addToCart(product, quantity, checkout);
    });
    
    // Auth state change
    window.addEventListener('authStateChanged', (e) => {
      this.handleAuthStateChange(e.detail.user);
    });
    
    // Theme change
    window.addEventListener('themeChanged', (e) => {
      this.handleThemeChange(e.detail.isDark);
    });
    
    // Network status
    window.addEventListener('online', () => {
      this.showNotification('You are back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.showNotification('You are offline. Some features may be unavailable.', 'error');
    });
  }

  handleNavigationClick(e) {
    e.preventDefault();
    const link = e.target.matches('[data-nav]') ? e.target : e.target.closest('[data-nav]');
    const href = link.getAttribute('href') || link.dataset.href;
    if (href) {
      window.location.hash = href;
    }
  }

  handleAddToCartClick(e) {
    e.preventDefault();
    const btn = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
    const product = {
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      price: parseFloat(btn.dataset.productPrice),
      image: btn.dataset.productImage,
      images: [btn.dataset.productImage]
    };
    this.addToCart(product);
  }

  handleBuyNowClick(e) {
    e.preventDefault();
    const btn = e.target.matches('.buy-now') ? e.target : e.target.closest('.buy-now');
    const product = {
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      price: parseFloat(btn.dataset.productPrice),
      image: btn.dataset.productImage,
      images: [btn.dataset.productImage]
    };
    this.addToCart(product, 1, true);
  }

  async handleWishlistClick(e) {
    e.preventDefault();
    const btn = e.target.matches('.wishlist-btn') ? e.target : e.target.closest('.wishlist-btn');
    const productId = btn.dataset.productId;
    
    if (!authService.currentUser) {
      const confirm = await this.showConfirm('Please login to add items to wishlist');
      if (confirm) {
        window.location.hash = `login?redirect=product-detail&id=${productId}`;
      }
      return;
    }
    
    const isInWishlist = wishlistService.isInWishlist(productId);
    
    if (isInWishlist) {
      await wishlistService.removeFromWishlist(productId);
      this.updateWishlistButton(btn, false);
      this.showNotification('Removed from wishlist', 'info');
    } else {
      await wishlistService.addToWishlist(productId);
      this.updateWishlistButton(btn, true);
      this.showNotification('Added to wishlist!', 'success');
    }
  }

  updateWishlistButton(btn, isActive) {
    const icon = btn.querySelector('i');
    if (isActive) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      btn.classList.add('active');
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      btn.classList.remove('active');
    }
  }

  handleAuthStateChange(user) {
    // Update UI based on auth state
    this.updateActiveNav(window.location.hash.slice(1) || 'home');
    
    if (user) {
      // Sync cart with Firestore
      cartService.syncCartWithFirestore();
      // Sync wishlist with Firestore
      wishlistService.syncWishlistWithFirestore();
    }
  }

  handleThemeChange(isDark) {
    // Update meta theme color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0F0F0F' : '#F5E6CA');
    }
  }

  // ============================================
  // CART MANAGEMENT
  // ============================================
  async initCart() {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        cartService.cart = cart;
        cartService.notifyListeners();
      } else {
        localStorage.setItem('cart', JSON.stringify([]));
      }
      console.log('✅ Cart initialized');
    } catch (e) {
      console.error('❌ Error initializing cart:', e);
      localStorage.setItem('cart', JSON.stringify([]));
    }
  }

  async addToCart(product, quantity = 1, checkout = false) {
    if (!product || !product.id) {
      this.showNotification('Invalid product', 'error');
      return;
    }
    
    try {
      await cartService.addItem(product, quantity);
      this.showNotification(`${product.name || 'Product'} added to cart!`, 'success');
      
      // Animate cart icon
      this.animateCartIcon();
      
      if (checkout) {
        setTimeout(() => window.location.hash = 'cart', 1000);
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      this.showNotification('Failed to add to cart', 'error');
    }
  }

  animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    }
  }

  // ============================================
  // WISHLIST MANAGEMENT
  // ============================================
  async initWishlist() {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const wishlist = JSON.parse(savedWishlist);
        wishlistService.wishlist = wishlist;
        wishlistService.notifyListeners();
      }
      console.log('✅ Wishlist initialized');
    } catch (e) {
      console.error('❌ Error initializing wishlist:', e);
    }
  }

  // ============================================
  // PREFERENCES
  // ============================================
  loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.theme.enable();
    }
    
    // Language
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      this.i18n.setLanguage(savedLang);
    }
    
    // Diwali mode
    const savedDiwali = localStorage.getItem('diwaliMode');
    if (savedDiwali === 'true') {
      this.animations.enableDiwaliMode();
    }
  }

  // ============================================
  // VIRTUAL DIYA
  // ============================================
  initVirtualDiya() {
    try {
      const virtualDiya = new VirtualDiya();
      document.body.appendChild(virtualDiya.render());
      console.log('✅ Virtual Diya initialized');
    } catch (error) {
      console.error('❌ Failed to initialize virtual diya:', error);
    }
  }

  // ============================================
  // UI UTILITIES
  // ============================================
  showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #D4AF37, #FF8C42)' : type === 'error' ? '#DC3545' : '#17A2B8'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 50px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
    
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showConfirm(message) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  }

  showError(message) {
    console.error(message);
    this.showNotification(message, 'error');
  }

  updateActiveNav(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href) {
        const linkPath = href.replace('#', '');
        if (linkPath === path || (path === '' && linkPath === 'home')) {
          link.classList.add('active');
        }
      }
    });
  }

  // ============================================
  // CLEANUP
  // ============================================
  destroy() {
    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }
    
    // Remove event listeners
    window.removeEventListener('hashchange', this.handleRoute);
    window.removeEventListener('load', this.handleRoute);
    
    console.log('🧹 App cleaned up');
  }
}

// ============================================
// INITIALIZE APP
// ============================================

// Make sure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}

// Add CSS animations for cart bounce
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
  
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  
  .bounce {
    animation: bounce 0.5s ease;
  }
  
  .cart-icon {
    transition: transform 0.2s ease;
  }
`;
document.head.appendChild(style);

export default window.app;