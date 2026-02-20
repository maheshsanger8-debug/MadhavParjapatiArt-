import { authService } from './auth.js';
import { firestoreService } from './firestore.js';
import { storageService } from './storage.js';
import { adminService } from './admin.js';

// ============================================
// IMAGE CONFIGURATION - SIMPLIFIED
// ============================================
const IMAGE_CONFIG = {
  // PRIMARY DIYA IMAGE - Amazon Premium Diya
  premiumDiya: 'https://m.media-amazon.com/images/I/71J8vH-tSaL._SL1500_.jpg',
  
  // FALLBACK DIYA IMAGE - Pexels Diya
  fallbackDiya: 'https://images.pexels.com/photos/5722907/pexels-photo-5722907.jpeg?auto=compress&cs=tinysrgb&w=800',
  
  // PRIMARY FALLBACK - Premium placeholder
  fallback: 'https://via.placeholder.com/400x400/F5E6CA/D4AF37?text=Premium+Clay+Diya',
  
  // SECONDARY FALLBACK - Dark theme placeholder
  fallbackBackup: 'https://via.placeholder.com/400x400/0F0F0F/D4AF37?text=MP+Art',
  
  // TERTIARY FALLBACK - Base64 inline image
  fallbackBase64: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23F5E6CA\'/%3E%3Cpath d=\'M150 200L200 120L250 200L225 250L175 250L150 200Z\' fill=\'%23D4AF37\'/%3E%3Ccircle cx=\'200\' cy=\'190\' r=\'15\' fill=\'%23FF8C42\'/%3E%3Ctext x=\'200\' y=\'320\' font-family=\'Inter\' font-size=\'20\' fill=\'%230F0F0F\' text-anchor=\'middle\'%3EPremium Diya%3C/text%3E%3C/svg%3E',
  
  // Default product image
  defaultProduct: 'https://m.media-amazon.com/images/I/71J8vH-tSaL._SL1500_.jpg',
  
  // Error state image
  errorImage: 'https://via.placeholder.com/400x400/DC3545/FFFFFF?text=Error+Loading+Image'
};

// ============================================
// IMAGE LOADER UTILITY WITH FALLBACK CHAIN
// ============================================
const ImageLoader = {
  // Load image with multiple fallback attempts
  loadWithFallback: (imgElement, primarySrc, fallbackChain = [IMAGE_CONFIG.fallback, IMAGE_CONFIG.fallbackBackup, IMAGE_CONFIG.fallbackBase64]) => {
    if (!imgElement) return;
    
    let attemptCount = 0;
    const maxAttempts = fallbackChain.length + 1;
    
    const tryLoad = (src) => {
      imgElement.src = src;
    };
    
    // Remove any existing error listeners
    const newImgElement = imgElement.cloneNode(true);
    if (imgElement.parentNode) {
      imgElement.parentNode.replaceChild(newImgElement, imgElement);
    }
    imgElement = newImgElement;
    
    // Error handler with retry
    imgElement.addEventListener('error', function onError(e) {
      attemptCount++;
      
      if (attemptCount < maxAttempts) {
        // Try next fallback
        const nextSrc = fallbackChain[attemptCount - 1];
        console.warn(`Image load failed, trying fallback ${attemptCount}/${maxAttempts-1}`);
        imgElement.src = nextSrc;
      } else {
        // Ultimate fallback - remove listener to prevent loop
        imgElement.removeEventListener('error', onError);
        imgElement.src = IMAGE_CONFIG.fallbackBase64;
        console.error('All image fallbacks failed, using base64');
      }
    });
    
    // Start loading
    tryLoad(primarySrc);
  },
  
  // Generate image HTML with built-in fallback
  getImageHTML: (src, alt, className = '', width = '50px', height = '50px') => {
    // Sanitize inputs
    const safeAlt = alt.replace(/[<>]/g, '');
    const safeClass = className.replace(/[<>"]/g, '');
    const safeWidth = width.replace(/[^0-9px%]/g, '');
    const safeHeight = height.replace(/[^0-9px%]/g, '');
    
    // Check for flower images and replace with diya
    let finalSrc = src;
    if (finalSrc && finalSrc.includes('5998519')) {
      console.warn('❌ Flower image detected, replacing with premium diya');
      finalSrc = IMAGE_CONFIG.premiumDiya;
    }
    
    return `
      <img 
        src="${this.escapeHtml(finalSrc || IMAGE_CONFIG.fallback)}" 
        alt="${safeAlt}"
        class="${safeClass}"
        style="width: ${safeWidth}; height: ${safeHeight}; object-fit: cover; border-radius: 4px; background: #F5E6CA;"
        loading="lazy"
        onerror="this.onerror=null; window.ImageLoader && window.ImageLoader.loadWithFallback(this, '${this.escapeHtml(finalSrc)}')"
      >
    `;
  },
  
  // PURE CSS LOGO - NO IMAGE DEPENDENCY!
  getPremiumLogoHTML: () => {
    // Check dark mode
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDarkMode ? '#FFFFFF' : '#0F0F0F';
    
    return `
      <div class="premium-logo" style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
        <!-- MADHAV PRAJAPATI - PEHLE (Dynamic Color) -->
        <span style="font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 1.5px; color: ${textColor}; line-height: 1.2; margin-bottom: 4px; text-transform: uppercase;">MADHAV PRAJAPATI</span>
        <!-- ART - BAAD (Gold) -->
        <span style="font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #D4AF37; line-height: 1; text-transform: uppercase;">ART</span>
        <!-- Small Diya Icon -->
        <span style="margin-top: 8px; font-size: 24px; color: #D4AF37;">🪔</span>
      </div>
    `;
  },
  
  // Escape HTML
  escapeHtml: (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  // Fix any flower images in the entire page
  fixFlowerImages: () => {
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (img.src && img.src.includes('5998519')) {
        console.warn('❌ Found flower image, replacing with premium diya');
        img.src = IMAGE_CONFIG.premiumDiya;
      }
    });
  }
};

// Make ImageLoader globally available
window.ImageLoader = ImageLoader;

// ============================================
// ERROR BOUNDARY
// ============================================
class ErrorBoundary {
  static async render(componentFn, fallbackUI) {
    try {
      return await componentFn();
    } catch (error) {
      console.error('ErrorBoundary caught:', error);
      return fallbackUI || `<div class="error-state">
        <i class="fas fa-exclamation-triangle" style="color: #DC3545; font-size: 2rem;"></i>
        <p style="color: #666; margin-top: 1rem;">Something went wrong. Please try again.</p>
        <button onclick="location.reload()" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Retry</button>
      </div>`;
    }
  }
}

// ============================================
// PERFORMANCE UTILITIES
// ============================================
const PerformanceUtils = {
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  cache: new Map(),
  
  async getCached(key, fetchFn, ttl = 300000) {
    if (this.cache.has(key)) {
      const { data, timestamp } = this.cache.get(key);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
    
    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  },
  
  clearCache: () => {
    this.cache.clear();
  }
};

// ============================================
// MAIN ADMIN DASHBOARD CLASS
// ============================================
class AdminDashboard {
  constructor() {
    this.currentView = 'dashboard';
    this.isLoading = false;
    this.eventListeners = [];
    this.init();
  }

  async init() {
    try {
      if (!await authService.isAdmin()) {
        window.location.href = '/';
        return;
      }
      
      this.render();
      this.initEventListeners();
      await this.loadView('dashboard');
      
      // Fix any flower images that might appear
      setTimeout(() => {
        ImageLoader.fixFlowerImages();
      }, 500);
    } catch (error) {
      console.error('AdminDashboard init error:', error);
      this.showError('Failed to initialize admin panel. Please refresh the page.');
    }
  }

  render() {
    const app = document.getElementById('admin-app');
    if (!app) return;
    
    app.innerHTML = `
      <div class="admin-dashboard">
        <aside class="admin-sidebar" id="adminSidebar">
          <div class="admin-logo" style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 2rem;">
            <!-- PURE CSS LOGO - NO IMAGE DEPENDENCY! -->
            ${ImageLoader.getPremiumLogoHTML()}
            <h3 style="margin-top: 1rem; color: #D4AF37; font-size: 1rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; border-top: 1px solid rgba(212,175,55,0.3); padding-top: 1rem; width: 100%;">Admin Panel</h3>
          </div>
          
          <nav class="admin-nav">
            <button class="admin-nav-item active" data-view="dashboard">
              <i class="fas fa-chart-line"></i> Dashboard
            </button>
            <button class="admin-nav-item" data-view="products">
              <i class="fas fa-box"></i> Products
            </button>
            <button class="admin-nav-item" data-view="orders">
              <i class="fas fa-shopping-cart"></i> Orders
            </button>
            <button class="admin-nav-item" data-view="users">
              <i class="fas fa-users"></i> Users
            </button>
            <button class="admin-nav-item" data-view="settings">
              <i class="fas fa-cog"></i> Settings
            </button>
            <button class="admin-nav-item" id="logoutBtn">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </nav>
        </aside>
        
        <main class="admin-content">
          <div class="admin-header">
            <button class="menu-toggle" id="menuToggle">
              <i class="fas fa-bars"></i>
            </button>
            <h1 id="viewTitle">Dashboard</h1>
            <div class="admin-user">
              <span id="adminName">${this.escapeHtml(authService.currentUser?.displayName || 'Admin')}</span>
              <div class="admin-avatar">
                ${this.escapeHtml(authService.currentUser?.displayName?.charAt(0) || 'A')}
              </div>
            </div>
          </div>
          
          <div id="adminViewContainer">
            ${this.renderSkeletonLoader()}
          </div>
        </main>
      </div>
    `;
    
    // Update logo colors based on dark mode
    this.updateLogoForTheme();
  }
  
  // Update logo colors when theme changes
  updateLogoForTheme() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const madhavText = document.querySelector('.premium-logo span:first-child');
    if (madhavText) {
      madhavText.style.color = isDarkMode ? '#FFFFFF' : '#0F0F0F';
    }
  }
  
  renderSkeletonLoader() {
    return `
      <div class="skeleton-loader">
        <div class="skeleton-header"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
        <div class="skeleton-table"></div>
      </div>
      <style>
        .skeleton-loader { padding: 1rem; }
        .skeleton-header { height: 40px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; margin-bottom: 2rem; }
        .skeleton-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .skeleton-card { height: 120px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        .skeleton-table { height: 300px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @media (max-width: 768px) { .skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
      </style>
    `;
  }

  async loadView(view) {
    if (this.isLoading) return;
    this.isLoading = true;
    
    this.currentView = view;
    const titles = {
      dashboard: 'Dashboard',
      products: 'Product Manager',
      orders: 'Order Management',
      users: 'User Management',
      settings: 'Site Settings'
    };
    
    const titleEl = document.getElementById('viewTitle');
    if (titleEl) titleEl.textContent = titles[view] || 'Dashboard';

    const container = document.getElementById('adminViewContainer');
    if (!container) return;
    
    container.innerHTML = this.renderSkeletonLoader();

    try {
      await ErrorBoundary.render(async () => {
        switch(view) {
          case 'dashboard':
            await this.renderDashboard(container);
            break;
          case 'products':
            await this.renderProductManager(container);
            break;
          case 'orders':
            await this.renderOrderManager(container);
            break;
          case 'users':
            await this.renderUserManager(container);
            break;
          case 'settings':
            await this.renderSettings(container);
            break;
        }
      }, `<div class="error-state">Failed to load ${titles[view]}</div>`);
    } catch (error) {
      console.error('Error loading view:', error);
      this.showError(`Failed to load ${titles[view]}: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  async renderDashboard(container) {
    const stats = await PerformanceUtils.getCached(
      'dashboard-stats',
      () => adminService.getDashboardStats(),
      60000
    );
    
    const recentActivity = await PerformanceUtils.getCached(
      'recent-activity',
      () => adminService.getRecentActivity(10),
      30000
    );
    
    container.innerHTML = `
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Products</h3>
            <span class="stat-number">${stats.productsCount || 0}</span>
          </div>
          <div class="stat-icon"><i class="fas fa-box"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Orders</h3>
            <span class="stat-number">${stats.ordersCount || 0}</span>
          </div>
          <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Revenue</h3>
            <span class="stat-number">₹${(stats.totalRevenue || 0).toLocaleString()}</span>
          </div>
          <div class="stat-icon"><i class="fas fa-rupee-sign"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <h3>Total Users</h3>
            <span class="stat-number">${stats.usersCount || 0}</span>
          </div>
          <div class="stat-icon"><i class="fas fa-users"></i></div>
        </div>
      </div>
      
      <div class="admin-section">
        <div class="section-header">
          <h2>Low Stock Alert</h2>
          <span class="stock-badge ${(stats.lowStockCount || 0) > 0 ? 'low-stock' : ''}">
            ${stats.lowStockCount || 0} Products
          </span>
        </div>
        
        ${(stats.lowStockCount || 0) > 0 ? `
          <div class="product-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${(stats.lowStockProducts || []).map(product => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 1rem;">
                        ${ImageLoader.getImageHTML(
                          product.images?.[0] || IMAGE_CONFIG.premiumDiya, 
                          product.name || 'Product', 
                          'product-thumb', 
                          '40px', 
                          '40px'
                        )}
                        <span>${this.escapeHtml(product.name || 'Unnamed Product')}</span>
                      </div>
                    </td>
                    <td><span class="stock-badge low-stock">${product.stock || 0}</span></td>
                    <td>₹${product.price || 0}</td>
                    <td>
                      <button class="btn btn-outline btn-sm" data-view="products">Update Stock</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p style="color: #6C757D; text-align: center; padding: 2rem;">✨ All products have sufficient stock!</p>'}
      </div>
      
      <div class="admin-section">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <button class="btn btn-link" id="refreshActivityBtn" style="padding: 0.25rem 0.5rem;">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${(recentActivity || []).length > 0 ? recentActivity.map(activity => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem; border-bottom: 1px solid #E9ECEF;">
              <div style="width: 32px; height: 32px; background: rgba(212,175,55,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${this.getActivityIcon(activity.type)}" style="color: #D4AF37;"></i>
              </div>
              <div style="flex: 1;">
                <p style="font-weight: 500; margin: 0;">${this.escapeHtml(this.getActivityMessage(activity))}</p>
                <p style="font-size: 0.75rem; color: #6C757D; margin: 0;">
                  ${this.getTimeAgo(activity.timestamp?.toDate?.())}
                </p>
              </div>
            </div>
          `).join('') : '<p style="color: #6C757D; text-align: center; padding: 1rem;">No recent activity</p>'}
        </div>
      </div>
    `;
    
    const refreshBtn = container.querySelector('#refreshActivityBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        PerformanceUtils.cache.delete('recent-activity');
        this.loadView('dashboard');
      });
    }
  }

  async renderProductManager(container) {
    const products = await PerformanceUtils.getCached(
      'all-products',
      () => firestoreService.getProducts(),
      30000
    );
    
    container.innerHTML = `
      <div class="admin-section">
        <div class="section-header">
          <h2>Product Manager</h2>
          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-outline" id="refreshProductsBtn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
            <button class="btn btn-primary" id="addProductBtn">
              <i class="fas fa-plus"></i> Add New Product
            </button>
          </div>
        </div>
        
        <div id="productFormContainer" style="display: none;"></div>
        
        <div class="product-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${(products || []).map(product => `
                <tr>
                  <td>
                    ${ImageLoader.getImageHTML(
                      product.images?.[0] || IMAGE_CONFIG.premiumDiya, 
                      product.name || 'Product', 
                      'product-thumb', 
                      '50px', 
                      '50px'
                    )}
                  </td>
                  <td>${this.escapeHtml(product.name || 'Unnamed')}</td>
                  <td>₹${product.price || 0}</td>
                  <td><span class="stock-badge ${(product.stock || 0) < 10 ? 'low-stock' : ''}">${product.stock || 0}</span></td>
                  <td>${this.escapeHtml(product.category || 'Uncategorized')}</td>
                  <td>
                    <button class="btn-icon edit-product" data-id="${product.id}" title="Edit Product">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-product" data-id="${product.id}" title="Delete Product">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const refreshBtn = container.querySelector('#refreshProductsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        PerformanceUtils.cache.delete('all-products');
        this.loadView('products');
      });
    }

    this.attachProductEventListeners(container);
  }

  renderProductForm(product = null) {
    return `
      <div class="admin-section">
        <h3 style="margin-bottom: 1.5rem;">${product ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
        <form id="productForm" class="settings-form">
          <div class="form-group">
            <label>Product Name *</label>
            <input type="text" class="form-control" id="productName" value="${this.escapeHtml(product?.name || '')}" required maxlength="100">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Price (₹) *</label>
              <input type="number" class="form-control" id="productPrice" value="${product?.price || ''}" min="0" step="1" required>
            </div>
            <div class="form-group">
              <label>Stock *</label>
              <input type="number" class="form-control" id="productStock" value="${product?.stock || ''}" min="0" required>
            </div>
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select class="form-control" id="productCategory" required>
              <option value="">Select Category</option>
              <option value="diwali" ${product?.category === 'diwali' ? 'selected' : ''}>🪔 Diwali Collection</option>
              <option value="wedding" ${product?.category === 'wedding' ? 'selected' : ''}>💍 Wedding Diyas</option>
              <option value="temple" ${product?.category === 'temple' ? 'selected' : ''}>🛕 Temple Diyas</option>
              <option value="decorative" ${product?.category === 'decorative' ? 'selected' : ''}>🎨 Decorative</option>
              <option value="custom" ${product?.category === 'custom' ? 'selected' : ''}>✨ Custom Orders</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" id="productDescription" rows="4" maxlength="1000">${this.escapeHtml(product?.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Product Images</label>
            <div class="image-upload-area" id="imageUploadArea">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Click or drag images to upload</p>
              <p style="font-size: 0.75rem; color: #6C757D;">PNG, JPG up to 5MB (Max 5 images)</p>
              <input type="file" id="imageUpload" accept="image/*" multiple style="display: none;">
            </div>
            <div class="image-preview" id="imagePreview">
              ${product?.images?.map(img => `
                <div style="position: relative; display: inline-block; margin: 0.5rem;">
                  ${ImageLoader.getImageHTML(img, 'Product preview', 'preview-image', '100px', '100px')}
                  <button type="button" class="btn-icon" style="position: absolute; top: -8px; right: -8px; background: white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <i class="fas fa-times" style="color: #DC3545;"></i>
                  </button>
                </div>
              `).join('') || ''}
            </div>
          </div>
          <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
            <button type="button" class="btn btn-outline" id="cancelProductForm">Cancel</button>
            <button type="submit" class="btn btn-primary">${product ? '💾 Update Product' : '✨ Create Product'}</button>
          </div>
        </form>
      </div>
    `;
  }

  async renderOrderManager(container) {
    const orders = await PerformanceUtils.getCached(
      'all-orders',
      () => adminService.getAllOrders(),
      30000
    );
    
    container.innerHTML = `
      <div class="admin-section">
        <div class="section-header">
          <h2>Order Management</h2>
          <div style="display: flex; gap: 1rem;">
            <select id="orderStatusFilter" class="form-control" style="width: 150px;">
              <option value="all">📋 All Orders</option>
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="shipped">📦 Shipped</option>
              <option value="delivered">🏠 Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <button class="btn btn-outline" id="refreshOrdersBtn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        <div class="product-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${(orders || []).length > 0 ? orders.map(order => `
                <tr>
                  <td><strong>#${order.id?.slice(-6) || 'N/A'}</strong></td>
                  <td>${order.createdAt?.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'}</td>
                  <td>${this.escapeHtml(order.shippingAddress?.fullName || 'N/A')}</td>
                  <td><strong>₹${(order.total || 0).toLocaleString()}</strong></td>
                  <td>
                    <select class="form-control order-status" data-order-id="${order.id}" style="width: 130px; padding: 0.25rem 0.5rem;">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                      <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>📦 Shipped</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>🏠 Delivered</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span style="padding: 0.25rem 0.75rem; background: ${order.paymentStatus === 'completed' ? 'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)'}; color: ${order.paymentStatus === 'completed' ? '#28A745' : '#FFC107'}; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                      ${order.paymentStatus === 'completed' ? '💰 Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    <button class="btn-icon view-order" data-order-id="${order.id}" title="View Order Details">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; color: #D4AF37; opacity: 0.5;"></i>
                    <p style="margin-top: 1rem; color: #666;">No orders found</p>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const refreshBtn = container.querySelector('#refreshOrdersBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        PerformanceUtils.cache.delete('all-orders');
        this.loadView('orders');
      });
    }

    this.attachOrderEventListeners(container);
  }

  async renderUserManager(container) {
    const users = await PerformanceUtils.getCached(
      'all-users',
      () => adminService.getAllUsers(),
      60000
    );
    
    container.innerHTML = `
      <div class="admin-section">
        <div class="section-header">
          <h2>User Management</h2>
          <div style="display: flex; gap: 1rem;">
            <div style="position: relative;">
              <i class="fas fa-search" style="position: absolute; left: 12px; top: 12px; color: #6C757D;"></i>
              <input type="text" id="userSearch" class="form-control" placeholder="Search by name or email..." style="width: 250px; padding-left: 35px;">
            </div>
            <button class="btn btn-outline" id="refreshUsersBtn">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        <div class="product-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              ${(users || []).length > 0 ? users.map(user => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #D4AF37, #FF8C42); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; text-transform: uppercase;">
                        ${this.escapeHtml(user.name?.charAt(0) || user.email?.charAt(0) || 'U')}
                      </div>
                      <span style="font-weight: 500;">${this.escapeHtml(user.name || 'No Name')}</span>
                    </div>
                  </td>
                  <td>${this.escapeHtml(user.email || 'N/A')}</td>
                  <td>
                    <select class="form-control user-role" data-user-id="${user.id}" style="width: 100px; padding: 0.25rem 0.5rem;">
                      <option value="user" ${user.role === 'user' ? 'selected' : ''}>👤 User</option>
                      <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
                    </select>
                  </td>
                  <td><span class="badge" style="background: #D4AF37; color: white; padding: 0.25rem 0.75rem; border-radius: 20px;">${user.orders?.length || 0}</span></td>
                  <td>${user.createdAt?.toDate?.().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'}</td>
                  <td>
                    <button class="btn-icon delete-user" data-user-id="${user.id}" title="Delete User">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 2rem; color: #D4AF37; opacity: 0.5;"></i>
                    <p style="margin-top: 1rem; color: #666;">No users found</p>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const refreshBtn = container.querySelector('#refreshUsersBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        PerformanceUtils.cache.delete('all-users');
        this.loadView('users');
      });
    }

    this.attachUserEventListeners(container);
  }

  async renderSettings(container) {
    const settings = await PerformanceUtils.getCached(
      'site-settings',
      () => adminService.getSiteSettings(),
      60000
    );
    
    container.innerHTML = `
      <div class="admin-section">
        <h2 style="margin-bottom: 1.5rem;">⚙️ Site Settings</h2>
        <form id="settingsForm" class="settings-form">
          <div class="settings-group">
            <h3>📋 General Settings</h3>
            <div class="form-group">
              <label>Site Name</label>
              <input type="text" class="form-control" id="siteName" value="${this.escapeHtml(settings.siteName || 'Madhav Prajapati Art')}">
            </div>
            <div class="form-group">
              <label>Site Description</label>
              <textarea class="form-control" id="siteDescription" rows="2">${this.escapeHtml(settings.siteDescription || 'Luxury handcrafted clay diyas')}</textarea>
            </div>
          </div>
          
          <div class="settings-group">
            <h3>🎨 Logo & Branding</h3>
            <div class="form-group">
              <label>Current Logo</label>
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #F8F9FA; border-radius: 8px;">
                <!-- PURE CSS LOGO - NO IMAGE DEPENDENCY! -->
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                  <span style="font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; color: #0F0F0F; text-transform: uppercase;">MADHAV PRAJAPATI</span>
                  <span style="font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 800; color: #D4AF37; text-transform: uppercase; margin-top: 2px;">ART</span>
                </div>
                <button type="button" class="btn btn-outline btn-sm" id="changeLogoBtn">
                  <i class="fas fa-upload"></i> Change Logo
                </button>
              </div>
              <input type="file" id="logoUpload" accept="image/*" style="display: none;">
            </div>
          </div>
          
          <div class="settings-group">
            <h3>🖼️ Hero Banner</h3>
            <div class="form-group">
              <label>Current Banner</label>
              <div style="margin-bottom: 1rem; padding: 1rem; background: #F8F9FA; border-radius: 8px;">
                <img src="${settings.bannerImage || IMAGE_CONFIG.premiumDiya}" alt="Hero Banner" style="max-width: 100%; max-height: 150px; object-fit: contain; border-radius: 8px;" onerror="this.src='${IMAGE_CONFIG.fallbackDiya}'">
              </div>
              <div style="display: flex; gap: 1rem;">
                <button type="button" class="btn btn-outline" id="changeBannerBtn">
                  <i class="fas fa-upload"></i> Upload New Banner
                </button>
              </div>
              <input type="file" id="bannerUpload" accept="image/*" style="display: none;">
            </div>
            <div class="form-group">
              <label>Banner Title</label>
              <input type="text" class="form-control" id="bannerText" value="${this.escapeHtml(settings.bannerText || 'Illuminate Your Space')}">
            </div>
            <div class="form-group">
              <label>Banner Subtext</label>
              <input type="text" class="form-control" id="bannerSubtext" value="${this.escapeHtml(settings.bannerSubtext || 'Handcrafted clay diyas for every occasion')}">
            </div>
          </div>
          
          <div class="settings-group">
            <h3>✨ Features</h3>
            <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 1rem; padding: 1rem; background: #F8F9FA; border-radius: 8px;">
              <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                <span>🪔 Diwali Animation</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="diwaliAnimation" ${settings.diwaliAnimation ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </label>
              </label>
              <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                <span>🎵 Background Music</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="backgroundMusic" ${settings.backgroundMusic ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </label>
              </label>
            </div>
          </div>
          
          <div class="settings-group">
            <h3>📦 Shipping Settings</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Standard Shipping (₹)</label>
                <input type="number" class="form-control" id="shippingCost" value="${settings.shippingCost || 50}" min="0">
              </div>
              <div class="form-group">
                <label>Free Shipping Threshold (₹)</label>
                <input type="number" class="form-control" id="freeShippingThreshold" value="${settings.freeShippingThreshold || 999}" min="0">
              </div>
            </div>
            <div class="form-group">
              <label>Tax Rate (%)</label>
              <input type="number" class="form-control" id="taxRate" value="${settings.taxRate || 18}" min="0" max="100" step="0.1">
            </div>
          </div>
          
          <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #E9ECEF;">
            <button type="button" class="btn btn-outline" id="resetSettingsBtn">
              <i class="fas fa-undo"></i> Reset
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Save Settings
            </button>
          </div>
        </form>
      </div>
    `;

    this.attachSettingsEventListeners(container);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  attachProductEventListeners(container) {
    const addBtn = container.querySelector('#addProductBtn');
    const formContainer = container.querySelector('#productFormContainer');
    
    addBtn?.addEventListener('click', () => {
      formContainer.innerHTML = this.renderProductForm();
      formContainer.style.display = 'block';
      formContainer.scrollIntoView({ behavior: 'smooth' });
      this.attachProductFormListeners(formContainer);
    });

    container.querySelectorAll('.edit-product').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        
        try {
          const product = await firestoreService.getProduct(productId);
          formContainer.innerHTML = this.renderProductForm(product);
          formContainer.style.display = 'block';
          formContainer.scrollIntoView({ behavior: 'smooth' });
          this.attachProductFormListeners(formContainer, productId);
        } catch (error) {
          console.error('Error loading product:', error);
          this.showToast('Failed to load product details. Please try again.', 'error');
        }
      });
    });

    container.querySelectorAll('.delete-product').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        
        if (confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
          try {
            const result = await firestoreService.deleteProduct(productId);
            if (result.success) {
              await storageService.deleteProductImages(productId);
              PerformanceUtils.cache.delete('all-products');
              PerformanceUtils.cache.delete('dashboard-stats');
              this.showToast('✅ Product deleted successfully', 'success');
              await this.renderProductManager(container.parentElement);
            }
          } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('❌ Error deleting product: ' + error.message, 'error');
          }
        }
      });
    });
  }

  attachProductFormListeners(container, productId = null) {
    const form = container.querySelector('#productForm');
    const cancelBtn = container.querySelector('#cancelProductForm');
    const imageUploadArea = container.querySelector('#imageUploadArea');
    const imageUpload = container.querySelector('#imageUpload');
    const imagePreview = container.querySelector('#imagePreview');
    let uploadedImages = [];

    imageUploadArea?.addEventListener('click', () => imageUpload.click());

    imageUploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadArea.style.borderColor = '#D4AF37';
      imageUploadArea.style.background = 'rgba(212,175,55,0.05)';
    });

    imageUploadArea?.addEventListener('dragleave', (e) => {
      e.preventDefault();
      imageUploadArea.style.borderColor = '#DEE2E6';
      imageUploadArea.style.background = 'transparent';
    });

    imageUploadArea?.addEventListener('drop', async (e) => {
      e.preventDefault();
      imageUploadArea.style.borderColor = '#DEE2E6';
      imageUploadArea.style.background = 'transparent';
      
      const files = Array.from(e.dataTransfer.files);
      await this.handleImageUpload(files, imagePreview, uploadedImages);
    });

    imageUpload?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      await this.handleImageUpload(files, imagePreview, uploadedImages);
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      
      try {
        const productData = {
          name: container.querySelector('#productName')?.value?.trim(),
          price: parseFloat(container.querySelector('#productPrice')?.value) || 0,
          stock: parseInt(container.querySelector('#productStock')?.value) || 0,
          category: container.querySelector('#productCategory')?.value,
          description: container.querySelector('#productDescription')?.value?.trim() || '',
          images: uploadedImages.length > 0 ? uploadedImages : (productId ? undefined : [IMAGE_CONFIG.premiumDiya]),
          updatedAt: new Date()
        };

        if (!productData.name || !productData.price || !productData.category) {
          this.showToast('Please fill in all required fields', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = productId ? '💾 Update Product' : '✨ Create Product';
          return;
        }

        let result;
        if (productId) {
          result = await firestoreService.updateProduct(productId, productData);
        } else {
          productData.createdAt = new Date();
          result = await firestoreService.addProduct(productData);
        }

        if (result.success) {
          PerformanceUtils.cache.delete('all-products');
          PerformanceUtils.cache.delete('dashboard-stats');
          this.showToast(`✅ Product ${productId ? 'updated' : 'created'} successfully!`, 'success');
          container.style.display = 'none';
          await this.renderProductManager(document.getElementById('adminViewContainer'));
        }
      } catch (error) {
        console.error('Error saving product:', error);
        this.showToast('❌ Error saving product: ' + error.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = productId ? '💾 Update Product' : '✨ Create Product';
      }
    });

    cancelBtn?.addEventListener('click', () => {
      container.style.display = 'none';
    });
  }

  async handleImageUpload(files, previewContainer, uploadedImages) {
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024;
    
    if (uploadedImages.length + files.length > maxFiles) {
      this.showToast(`You can only upload up to ${maxFiles} images`, 'error');
      return;
    }

    for (const file of files) {
      if (file.size > maxSize) {
        this.showToast(`File ${file.name} is too large. Maximum size is 5MB.`, 'error');
        continue;
      }

      if (!file.type.startsWith('image/')) {
        this.showToast(`File ${file.name} is not an image.`, 'error');
        continue;
      }

      try {
        const result = await storageService.uploadProductImage(file);
        if (result.success) {
          uploadedImages.push(result.url);
          
          const imageElement = document.createElement('div');
          imageElement.style.position = 'relative';
          imageElement.style.display = 'inline-block';
          imageElement.style.margin = '0.5rem';
          imageElement.innerHTML = `
            <img src="${result.url}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px;" onerror="this.src='${IMAGE_CONFIG.fallbackDiya}'">
            <button type="button" class="btn-icon" style="position: absolute; top: -8px; right: -8px; background: white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
              <i class="fas fa-times" style="color: #DC3545;"></i>
            </button>
          `;
          
          imageElement.querySelector('button').addEventListener('click', () => {
            imageElement.remove();
            const index = uploadedImages.indexOf(result.url);
            if (index > -1) uploadedImages.splice(index, 1);
          });
          
          previewContainer.appendChild(imageElement);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        this.showToast(`Failed to upload ${file.name}: ${error.message}`, 'error');
      }
    }
  }

  attachOrderEventListeners(container) {
    const filterSelect = container.querySelector('#orderStatusFilter');
    
    const debouncedFilter = PerformanceUtils.debounce((status) => {
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const orderStatus = row.querySelector('.order-status')?.value;
        row.style.display = status === 'all' || orderStatus === status ? '' : 'none';
      });
    }, 300);

    filterSelect?.addEventListener('change', (e) => {
      debouncedFilter(e.target.value);
    });

    container.querySelectorAll('.order-status').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        const originalValue = e.target.dataset.originalValue || select.value;
        
        try {
          const result = await adminService.updateOrderStatus(orderId, newStatus);
          if (result.success) {
            e.target.dataset.originalValue = newStatus;
            PerformanceUtils.cache.delete('all-orders');
            PerformanceUtils.cache.delete('dashboard-stats');
            this.showToast('✅ Order status updated successfully', 'success');
          }
        } catch (error) {
          console.error('Error updating order status:', error);
          e.target.value = originalValue;
          this.showToast('❌ Failed to update order status', 'error');
        }
      });
      
      select.dataset.originalValue = select.value;
    });
  }

  attachUserEventListeners(container) {
    const searchInput = container.querySelector('#userSearch');
    
    const debouncedSearch = PerformanceUtils.debounce((query) => {
      const rows = container.querySelectorAll('#usersTableBody tr');
      let visibleCount = 0;
      
      rows.forEach(row => {
        if (row.id === 'noUsersResult') return;
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(query.toLowerCase());
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });
      
      const noResultsRow = container.querySelector('#noUsersResult');
      if (noResultsRow) noResultsRow.remove();
      
      if (visibleCount === 0) {
        const tbody = container.querySelector('#usersTableBody');
        const noResult = document.createElement('tr');
        noResult.id = 'noUsersResult';
        noResult.innerHTML = `
          <td colspan="6" style="text-align: center; padding: 3rem;">
            <i class="fas fa-search" style="font-size: 2rem; color: #D4AF37; opacity: 0.5;"></i>
            <p style="margin-top: 1rem; color: #666;">No users match your search</p>
          </td>
        `;
        tbody.appendChild(noResult);
      }
    }, 300);

    searchInput?.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });

    container.querySelectorAll('.user-role').forEach(select => {
      select.addEventListener('change', async (e) => {
        const userId = e.target.dataset.userId;
        const newRole = e.target.value;
        const originalValue = e.target.dataset.originalValue || select.value;
        
        if (confirm(`⚠️ Change user role to ${newRole}?`)) {
          try {
            const result = await adminService.updateUserRole(userId, newRole);
            if (result.success) {
              e.target.dataset.originalValue = newRole;
              PerformanceUtils.cache.delete('all-users');
              this.showToast(`✅ User role updated to ${newRole}`, 'success');
            }
          } catch (error) {
            console.error('Error updating user role:', error);
            e.target.value = originalValue;
            this.showToast('❌ Failed to update user role', 'error');
          }
        } else {
          e.target.value = originalValue;
        }
      });
      
      select.dataset.originalValue = select.value;
    });
  }

  attachSettingsEventListeners(container) {
    const form = container.querySelector('#settingsForm');
    const resetBtn = container.querySelector('#resetSettingsBtn');
    
    const changeLogoBtn = container.querySelector('#changeLogoBtn');
    const logoUpload = container.querySelector('#logoUpload');
    
    changeLogoBtn?.addEventListener('click', () => logoUpload.click());
    
    logoUpload?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const btn = changeLogoBtn;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      btn.disabled = true;
      
      try {
        const result = await adminService.uploadLogo(file);
        if (result.success) {
          PerformanceUtils.cache.delete('site-settings');
          this.showToast('✅ Logo updated successfully', 'success');
          setTimeout(() => location.reload(), 1500);
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        this.showToast('❌ Error uploading logo: ' + error.message, 'error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        logoUpload.value = '';
      }
    });

    const changeBannerBtn = container.querySelector('#changeBannerBtn');
    const bannerUpload = container.querySelector('#bannerUpload');
    
    changeBannerBtn?.addEventListener('click', () => bannerUpload.click());
    
    bannerUpload?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const btn = changeBannerBtn;
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      btn.disabled = true;
      
      try {
        const result = await adminService.uploadBanner(file);
        if (result.success) {
          PerformanceUtils.cache.delete('site-settings');
          this.showToast('✅ Banner updated successfully', 'success');
          setTimeout(() => location.reload(), 1500);
        }
      } catch (error) {
        console.error('Error uploading banner:', error);
        this.showToast('❌ Error uploading banner: ' + error.message, 'error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        bannerUpload.value = '';
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      submitBtn.disabled = true;
      
      try {
        const settings = {
          siteName: container.querySelector('#siteName')?.value?.trim(),
          siteDescription: container.querySelector('#siteDescription')?.value?.trim(),
          bannerText: container.querySelector('#bannerText')?.value?.trim(),
          bannerSubtext: container.querySelector('#bannerSubtext')?.value?.trim(),
          diwaliAnimation: container.querySelector('#diwaliAnimation')?.checked || false,
          backgroundMusic: container.querySelector('#backgroundMusic')?.checked || false,
          shippingCost: parseFloat(container.querySelector('#shippingCost')?.value) || 50,
          freeShippingThreshold: parseFloat(container.querySelector('#freeShippingThreshold')?.value) || 999,
          taxRate: parseFloat(container.querySelector('#taxRate')?.value) || 18
        };

        const result = await adminService.updateSiteSettings(settings);
        if (result.success) {
          PerformanceUtils.cache.delete('site-settings');
          this.showToast('✅ Settings saved successfully', 'success');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        this.showToast('❌ Error saving settings: ' + error.message, 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });

    resetBtn?.addEventListener('click', async () => {
      if (confirm('⚠️ Reset all settings to default values?')) {
        try {
          PerformanceUtils.cache.delete('site-settings');
          await this.renderSettings(container.parentElement);
          this.showToast('✅ Settings reset to defaults', 'success');
        } catch (error) {
          console.error('Error resetting settings:', error);
          this.showToast('❌ Error resetting settings', 'error');
        }
      }
    });
  }

  initEventListeners() {
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(item => {
      const handler = () => {
        document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        this.loadView(item.dataset.view);
      };
      
      item.addEventListener('click', handler);
      this.eventListeners.push({ element: item, type: 'click', handler });
    });

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    if (menuToggle && sidebar) {
      const handler = () => sidebar.classList.toggle('active');
      menuToggle.addEventListener('click', handler);
      this.eventListeners.push({ element: menuToggle, type: 'click', handler });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      const handler = async () => {
        try {
          await authService.signOut();
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
          this.showToast('❌ Error logging out', 'error');
        }
      };
      
      logoutBtn.addEventListener('click', handler);
      this.eventListeners.push({ element: logoutBtn, type: 'click', handler });
    }

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('adminSidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar?.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuToggle?.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      }
    });
    
    // Listen for dark mode changes to update logo color
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.updateLogoForTheme();
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  showToast(message, type = 'info') {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#17A2B8',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '9999',
      animation: 'slideIn 0.3s ease',
      fontWeight: '500'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    const container = document.getElementById('adminViewContainer');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #DC3545; margin-bottom: 1rem;"></i>
          <h2 style="color: #0F0F0F; margin-bottom: 1rem;">Something went wrong</h2>
          <p style="color: #6C757D; margin-bottom: 2rem;">${this.escapeHtml(message)}</p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="fas fa-sync-alt"></i> Refresh Page
          </button>
        </div>
      `;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return timestamp.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  getActivityIcon(type) {
    const icons = {
      order: 'fa-shopping-cart',
      product: 'fa-box',
      user: 'fa-user'
    };
    return icons[type] || 'fa-clock';
  }

  getActivityMessage(activity) {
    if (!activity) return 'Unknown activity';
    
    switch(activity.type) {
      case 'order':
        return `🛍️ New order #${activity.id?.slice(-6)} placed for ₹${activity.data?.total || 0}`;
      case 'product':
        return `✨ New product added: ${activity.data?.name || 'Unnamed'}`;
      case 'user':
        return `👤 New user registered: ${activity.data?.email || 'Unknown'}`;
      default:
        return '📝 Activity recorded';
    }
  }

  destroy() {
    this.eventListeners.forEach(({ element, type, handler }) => {
      element?.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }
}

// Initialize admin dashboard only if we're on the admin page
if (document.getElementById('admin-app')) {
  if (window.adminDashboard) {
    window.adminDashboard.destroy?.();
  }
  window.adminDashboard = new AdminDashboard();
  
  // Fix flower images on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      ImageLoader.fixFlowerImages();
    }, 500);
  });
}

// Export for use in other modules
export { AdminDashboard, IMAGE_CONFIG, ImageLoader, PerformanceUtils };