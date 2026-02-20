import { firestoreService } from './firestore.js';
import { cartService } from './cart.js';
import { wishlistService } from './wishlist.js';
import { currencyFormatter } from './currency.js';
import { Reviews } from './reviews.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// PRODUCT DETAIL PAGE - Complete Product Detail Component
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class ProductDetailPage {
  constructor(container, params) {
    this.container = container;
    this.productId = params.get('id');
    this.product = null;
    this.selectedImage = 0;
    this.quantity = 1;
    this.relatedProducts = [];
    this.imageFallback = 'https://via.placeholder.com/800x800/F5E6CA/D4AF37?text=Handcrafted+Diya';
    this.init();
  }

  /**
   * Initialize product detail page
   */
  async init() {
    await this.loadProduct();
    if (this.product) {
      await this.loadRelatedProducts();
      this.render();
      this.initEventListeners();
      this.initAnimations();
      console.log('✅ ProductDetailPage initialized for:', this.product.name);
    } else {
      this.renderNotFound();
    }
  }

  /**
   * Load product from Firestore
   */
  async loadProduct() {
    try {
      const result = await firestoreService.getProduct(this.productId);
      if (result.success) {
        this.product = result.product;
      } else {
        this.product = null;
      }
    } catch (error) {
      console.error('Error loading product:', error);
      this.product = null;
    }
  }

  /**
   * Load related products
   */
  async loadRelatedProducts() {
    try {
      const result = await firestoreService.getProducts({
        category: this.product.category,
        limit: 4,
        activeOnly: true
      });
      
      if (result.success) {
        // Filter out current product
        this.relatedProducts = result.products
          .filter(p => p.id !== this.productId)
          .slice(0, 4);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      this.relatedProducts = [];
    }
  }

  /**
   * Render product detail page
   */
  render() {
    const isInWishlist = wishlistService.isInWishlist(this.productId);
    const discount = this.calculateDiscount();
    
    this.container.innerHTML = `
      <div class="product-detail-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb" data-animate="fadeInDown">
          <a href="#home" data-nav>Home</a> <i class="fas fa-chevron-right"></i>
          <a href="#products" data-nav>Products</a> <i class="fas fa-chevron-right"></i>
          <a href="#products?category=${this.product.category}" data-nav>${this.getCategoryName(this.product.category)}</a> <i class="fas fa-chevron-right"></i>
          <span>${this.product.name}</span>
        </div>
        
        <div class="product-detail-container">
          <!-- Gallery Section -->
          <div class="product-gallery" data-animate="fadeInLeft">
            <div class="main-image" id="mainImageContainer">
              <img 
                src="${this.getImageUrl(this.product.images?.[this.selectedImage])}" 
                alt="${this.escapeHtml(this.product.name)}" 
                id="mainProductImage"
                onerror="this.onerror=null; this.src='${this.imageFallback}';"
              >
              
              <button class="zoom-btn" id="zoomBtn" aria-label="Zoom image">
                <i class="fas fa-search-plus"></i>
              </button>
              
              <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                      data-product-id="${this.product.id}"
                      aria-label="Add to wishlist">
                <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
              </button>
              
              <button class="share-btn" id="shareBtn" aria-label="Share product">
                <i class="fas fa-share-alt"></i>
              </button>
            </div>
            
            <div class="image-thumbnails">
              ${this.product.images?.map((img, index) => `
                <div class="thumbnail ${index === this.selectedImage ? 'active' : ''}" 
                     data-image-index="${index}"
                     onclick="document.getElementById('mainProductImage').src='${this.getImageUrl(img)}'">
                  <img src="${this.getImageUrl(img)}" alt="${this.product.name} - View ${index + 1}" loading="lazy">
                </div>
              `).join('') || ''}
            </div>
          </div>
          
          <!-- Product Info Section -->
          <div class="product-info-section" data-animate="fadeInRight">
            <span class="product-category">${this.getCategoryName(this.product.category)}</span>
            
            <h1 class="product-title">${this.escapeHtml(this.product.name)}</h1>
            
            <div class="product-rating-container">
              <div class="product-rating">
                ${this.renderRating(this.product.rating || 0)}
              </div>
              <span class="rating-count">(${this.product.reviews || 0} reviews)</span>
              
              ${this.product.soldCount ? `
                <span class="sold-count">
                  <i class="fas fa-fire"></i> ${this.product.soldCount}+ sold
                </span>
              ` : ''}
            </div>
            
            <div class="product-price-container">
              <div class="product-price">
                ${currencyFormatter.format(this.product.price)}
                ${this.product.originalPrice ? `
                  <span class="original-price">${currencyFormatter.format(this.product.originalPrice)}</span>
                  <span class="discount-badge">-${discount}%</span>
                ` : ''}
              </div>
              
              ${this.product.price < 500 ? `
                <span class="price-tag best-price">
                  <i class="fas fa-tag"></i> Best Price
                </span>
              ` : ''}
            </div>
            
            <div class="product-meta">
              <div class="stock-status ${this.product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${this.product.stock > 0 
                  ? `<i class="fas fa-check-circle"></i> <span data-i18n="in_stock">In Stock</span> (${this.product.stock} available)` 
                  : `<i class="fas fa-times-circle"></i> <span data-i18n="out_of_stock">Out of Stock</span>`}
              </div>
              <div class="product-sku">SKU: ${this.product.sku || 'MP-' + this.productId.slice(-6)}</div>
            </div>
            
            <!-- Features Grid -->
            <div class="product-features-grid">
              <div class="feature-item">
                <i class="fas fa-leaf"></i>
                <div>
                  <strong>100% Natural</strong>
                  <span>Eco-friendly clay</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-paint-brush"></i>
                <div>
                  <strong>Hand-painted</strong>
                  <span>Traditional motifs</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-fire"></i>
                <div>
                  <strong>Heat-resistant</strong>
                  <span>Safe for oil lamps</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-gem"></i>
                <div>
                  <strong>Premium Finish</strong>
                  <span>Gold leaf accents</span>
                </div>
              </div>
            </div>
            
            <!-- Description -->
            <div class="product-description">
              <h3 data-i18n="description">Description</h3>
              <p>${this.product.description || 'No description available.'}</p>
            </div>
            
            <!-- Dimensions -->
            ${this.product.dimensions ? `
              <div class="product-dimensions">
                <h3 data-i18n="dimensions">Dimensions</h3>
                <div class="dimensions-grid">
                  <div class="dimension-item">
                    <span class="dimension-label">Height</span>
                    <span class="dimension-value">${this.product.dimensions.height} cm</span>
                  </div>
                  <div class="dimension-item">
                    <span class="dimension-label">Width</span>
                    <span class="dimension-value">${this.product.dimensions.width} cm</span>
                  </div>
                  <div class="dimension-item">
                    <span class="dimension-label">Weight</span>
                    <span class="dimension-value">${this.product.dimensions.weight} g</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Quantity Selector -->
            <div class="quantity-selector">
              <span class="quantity-label" data-i18n="quantity">Quantity:</span>
              <div class="quantity-controls">
                <button class="quantity-btn" id="decreaseQty" ${this.product.stock <= 0 ? 'disabled' : ''}>
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" id="quantityInput" value="${this.quantity}" min="1" max="${this.product.stock}" readonly>
                <button class="quantity-btn" id="increaseQty" ${this.product.stock <= 0 ? 'disabled' : ''}>
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <span class="max-stock">Max: ${this.product.stock}</span>
            </div>
            
            <!-- Action Buttons -->
            <div class="product-actions">
              <button class="btn btn-primary btn-large" id="addToCartBtn" ${this.product.stock <= 0 ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i> <span data-i18n="add_to_cart">Add to Cart</span>
              </button>
              
              <button class="btn btn-outline btn-large" id="buyNowBtn" ${this.product.stock <= 0 ? 'disabled' : ''}>
                <i class="fas fa-bolt"></i> <span data-i18n="buy_now">Buy Now</span>
              </button>
            </div>
            
            <!-- Delivery Info -->
            <div class="delivery-info">
              <div class="delivery-row">
                <i class="fas fa-truck"></i>
                <span><strong>Free Shipping</strong> on orders above ₹999</span>
              </div>
              <div class="delivery-row">
                <i class="fas fa-clock"></i>
                <span>Estimated delivery: <strong>5-7 business days</strong></span>
              </div>
              <div class="delivery-row">
                <i class="fas fa-map-marker-alt"></i>
                <span>Handcrafted in <strong>Bagwali, Panchkula</strong></span>
              </div>
              <div class="delivery-row">
                <i class="fas fa-undo-alt"></i>
                <span><strong>7-day easy returns</strong></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="product-reviews" id="reviewsContainer" data-animate="fadeInUp" data-delay="200"></div>
        
        <!-- Related Products -->
        ${this.renderRelatedProducts()}
      </div>
    `;
    
    i18n.updatePageContent();
    this.loadReviews();
  }

  /**
   * Render related products
   */
  renderRelatedProducts() {
    if (!this.relatedProducts || this.relatedProducts.length === 0) {
      return '';
    }
    
    return `
      <div class="related-products" data-animate="fadeInUp" data-delay="300">
        <h2 data-i18n="you_may_also_like">You May Also Like</h2>
        <div class="related-grid">
          ${this.relatedProducts.map(product => `
            <div class="product-card" onclick="window.location.hash='product-detail?id=${product.id}'">
              <div class="product-image">
                <img src="${this.getImageUrl(product.images?.[0])}" alt="${product.name}" loading="lazy">
                ${product.stock < 5 ? '<span class="product-badge limited">Limited</span>' : ''}
              </div>
              <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${currencyFormatter.format(product.price)}</div>
                <div class="product-rating">
                  ${this.renderRating(product.rating || 0)}
                  <span>(${product.reviews || 0})</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render rating stars
   */
  renderRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars += '<i class="fas fa-star"></i>';
      else if (i === fullStars && halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
      else stars += '<i class="far fa-star"></i>';
    }
    return stars;
  }

  /**
   * Load reviews
   */
  async loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (reviewsContainer) {
      try {
        const reviews = new Reviews(this.productId);
        reviewsContainer.appendChild(await reviews.render());
      } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsContainer.innerHTML = '<p class="error-message">Failed to load reviews</p>';
      }
    }
  }

  /**
   * Render not found
   */
  renderNotFound() {
    this.container.innerHTML = `
      <div class="product-not-found">
        <i class="fas fa-box-open"></i>
        <h2 data-i18n="product_not_found">Product Not Found</h2>
        <p data-i18n="product_not_found_msg">The product you're looking for doesn't exist or has been removed.</p>
        <button class="btn btn-primary" data-nav data-href="products" data-i18n="browse_products">Browse Products</button>
      </div>
    `;
    i18n.updatePageContent();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Image gallery
    document.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.imageIndex);
        this.selectedImage = index;
        
        const mainImage = document.getElementById('mainProductImage');
        if (mainImage) {
          mainImage.src = this.getImageUrl(this.product.images[this.selectedImage]);
        }
        
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Zoom button
    const zoomBtn = document.getElementById('zoomBtn');
    zoomBtn?.addEventListener('click', () => {
      this.openZoomModal();
    });

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    shareBtn?.addEventListener('click', () => {
      this.shareProduct();
    });

    // Quantity controls
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantityInput');

    decreaseBtn?.addEventListener('click', () => {
      if (this.quantity > 1) {
        this.quantity--;
        quantityInput.value = this.quantity;
      }
    });

    increaseBtn?.addEventListener('click', () => {
      if (this.quantity < this.product.stock) {
        this.quantity++;
        quantityInput.value = this.quantity;
      }
    });

    // Add to cart
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      
      addToCartBtn.disabled = true;
      addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      
      try {
        await cartService.addItem(this.product, this.quantity);
        this.animateAddToCart();
        window.app.showNotification(`${this.product.name} added to cart!`, 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        window.app.showNotification('Failed to add to cart', 'error');
      } finally {
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> <span data-i18n="add_to_cart">Add to Cart</span>';
      }
    });

    // Buy now
    const buyNowBtn = document.getElementById('buyNowBtn');
    buyNowBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      
      buyNowBtn.disabled = true;
      buyNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      
      try {
        await cartService.addItem(this.product, this.quantity);
        window.location.hash = 'checkout';
      } catch (error) {
        console.error('Error during buy now:', error);
        window.app.showNotification('Failed to process', 'error');
        buyNowBtn.disabled = false;
        buyNowBtn.innerHTML = '<i class="fas fa-bolt"></i> <span data-i18n="buy_now">Buy Now</span>';
      }
    });

    // Wishlist
    const wishlistBtn = document.querySelector('.wishlist-btn');
    wishlistBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.toggleWishlist(wishlistBtn);
    });
  }

  /**
   * Toggle wishlist
   */
  async toggleWishlist(btn) {
    const icon = btn.querySelector('i');
    const isInWishlist = wishlistService.isInWishlist(this.productId);
    
    btn.disabled = true;
    
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(this.productId);
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.classList.remove('active');
        window.app.showNotification('Removed from wishlist', 'info');
      } else {
        await wishlistService.addToWishlist(this.productId);
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.classList.add('active');
        window.app.showNotification('Added to wishlist!', 'success');
        this.animateWishlist(btn);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      window.app.showNotification('Failed to update wishlist', 'error');
    } finally {
      btn.disabled = false;
    }
  }

  /**
   * Open zoom modal
   */
  openZoomModal() {
    const modal = document.createElement('div');
    modal.className = 'zoom-modal';
    modal.innerHTML = `
      <div class="zoom-modal-content">
        <button class="zoom-modal-close"><i class="fas fa-times"></i></button>
        <img src="${this.getImageUrl(this.product.images?.[this.selectedImage])}" alt="${this.product.name}">
        <div class="zoom-modal-nav">
          <button class="zoom-nav-prev"><i class="fas fa-chevron-left"></i></button>
          <span>${this.selectedImage + 1} / ${this.product.images?.length || 1}</span>
          <button class="zoom-nav-next"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    modal.querySelector('.zoom-modal-close').addEventListener('click', () => {
      modal.remove();
      document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = '';
      }
    });
  }

  /**
   * Share product
   */
  async shareProduct() {
    const shareData = {
      title: this.product.name,
      text: this.product.description || 'Check out this beautiful handcrafted diya from Madhav Prajapati Art',
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      window.app.showNotification('Link copied to clipboard!', 'success');
    }
  }

  /**
   * Animate add to cart
   */
  animateAddToCart() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    }
  }

  /**
   * Animate wishlist
   */
  animateWishlist(btn) {
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 500);
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Get image URL with fallback
   */
  getImageUrl(image) {
    if (!image) return this.imageFallback;
    
    // Check for flower images
    if (image.includes('5998519')) {
      return this.imageFallback;
    }
    
    return image;
  }

  /**
   * Get category name
   */
  getCategoryName(category) {
    const categories = {
      diwali: 'Diwali Collection',
      wedding: 'Wedding Diyas',
      temple: 'Temple Diyas',
      decorative: 'Decorative',
      custom: 'Custom Orders',
      uncategorized: 'Diyas'
    };
    return categories[category] || category;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount() {
    if (!this.product.originalPrice || !this.product.price) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 ProductDetailPage destroyed');
  }
}

// ============================================
// ADDITIONAL STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .breadcrumb {
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }
  
  .breadcrumb a {
    color: #666;
    text-decoration: none;
  }
  
  .breadcrumb a:hover {
    color: #D4AF37;
  }
  
  .breadcrumb i {
    margin: 0 0.5rem;
    color: #999;
    font-size: 0.7rem;
  }
  
  .breadcrumb span {
    color: #D4AF37;
  }
  
  .zoom-btn {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #D4AF37;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 2;
  }
  
  .zoom-btn:hover {
    background: #D4AF37;
    color: white;
  }
  
  .zoom-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .zoom-modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .zoom-modal-content img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .zoom-modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .zoom-modal-nav {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    color: white;
  }
  
  .zoom-nav-prev,
  .zoom-nav-next {
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .zoom-nav-prev:hover,
  .zoom-nav-next:hover {
    background: rgba(255,255,255,0.3);
  }
  
  .product-features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(212,175,55,0.05);
    border-radius: 12px;
  }
  
  .feature-item i {
    color: #D4AF37;
    font-size: 1.2rem;
  }
  
  .feature-item div {
    display: flex;
    flex-direction: column;
  }
  
  .feature-item strong {
    font-size: 0.9rem;
    color: #0F0F0F;
  }
  
  .feature-item span {
    font-size: 0.8rem;
    color: #666;
  }
  
  .dimensions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 0.5rem;
  }
  
  .dimension-item {
    text-align: center;
    padding: 0.75rem;
    background: #F8F9FA;
    border-radius: 8px;
  }
  
  .dimension-label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .dimension-value {
    font-weight: 600;
    color: #D4AF37;
  }
  
  .price-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: rgba(40,167,69,0.1);
    color: #28A745;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .sold-count {
    color: #FF8C42;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .max-stock {
    font-size: 0.8rem;
    color: #999;
    margin-left: 0.5rem;
  }
  
  @media (prefers-color-scheme: dark) {
    .feature-item strong {
      color: #FFFFFF;
    }
    
    .feature-item span {
      color: #CCCCCC;
    }
    
    .dimension-item {
      background: #2A2A2A;
    }
    
    .dimension-label {
      color: #CCCCCC;
    }
    
    .breadcrumb a {
      color: #CCCCCC;
    }
  }
`;

document.head.appendChild(style);