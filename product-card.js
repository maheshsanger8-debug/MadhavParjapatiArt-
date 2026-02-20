import { currencyFormatter } from './currency.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';
import { wishlistService } from './wishlist.js';

// ============================================
// PRODUCT CARD - Premium Product Card Component
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class ProductCard {
  constructor(product) {
    this.product = product;
    this.element = null;
    this.imageFallback = 'https://via.placeholder.com/400x400/F5E6CA/D4AF37?text=Handcrafted+Diya';
  }

  /**
   * Render product card
   */
  render() {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    card.setAttribute('data-product-id', this.product.id);
    card.setAttribute('data-product-name', this.product.name);
    card.setAttribute('data-product-price', this.product.price);
    card.setAttribute('data-animate', 'fadeInUp');
    
    // Determine badge
    const badge = this.getBadge();
    
    // Check if product is in wishlist
    const isInWishlist = wishlistService.isInWishlist(this.product.id);
    
    // Get image URL
    const imageUrl = this.getImageUrl(this.product.images?.[0]);
    
    // Calculate discount if applicable
    const hasDiscount = this.product.originalPrice && this.product.originalPrice > this.product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100)
      : 0;

    card.innerHTML = `
      <div class="product-image">
        <img 
          src="${imageUrl}" 
          alt="${this.escapeHtml(this.product.name)}" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${this.imageFallback}';"
        >
        ${badge ? `<span class="product-badge ${badge.type}">${badge.text}</span>` : ''}
        <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                data-product-id="${this.product.id}"
                aria-label="Add to wishlist">
          <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
        </button>
        ${this.product.stock === 0 ? '<span class="product-badge out-of-stock" data-i18n="out_of_stock">Out of Stock</span>' : ''}
      </div>
      
      <div class="product-info">
        <h3 class="product-title">${this.escapeHtml(this.product.name)}</h3>
        
        <div class="product-price-container">
          <div class="product-price">
            ${currencyFormatter.format(this.product.price)}
            ${hasDiscount ? `
              <span class="original-price">${currencyFormatter.format(this.product.originalPrice)}</span>
              <span class="discount-badge">-${discountPercent}%</span>
            ` : ''}
          </div>
        </div>
        
        <div class="product-rating">
          ${this.renderRating(this.product.rating || 0)}
          <span>(${this.product.reviews || 0})</span>
        </div>
        
        <div class="product-meta">
          ${this.product.stock > 0 ? `
            <span class="stock-status in-stock">
              <i class="fas fa-check-circle"></i> <span data-i18n="in_stock">In Stock</span>
            </span>
          ` : `
            <span class="stock-status out-of-stock">
              <i class="fas fa-times-circle"></i> <span data-i18n="out_of_stock">Out of Stock</span>
            </span>
          `}
          
          ${this.product.soldCount ? `
            <span class="sold-count">
              <i class="fas fa-fire"></i> ${this.product.soldCount}+ <span data-i18n="sold">sold</span>
            </span>
          ` : ''}
        </div>
        
        <div class="product-actions">
          <button class="btn btn-outline add-to-cart" 
                  data-product-id="${this.product.id}"
                  data-product-name="${this.escapeHtml(this.product.name)}"
                  data-product-price="${this.product.price}"
                  data-product-image="${imageUrl}"
                  ${this.product.stock === 0 ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i>
            <span data-i18n="add_to_cart">Add to Cart</span>
          </button>
          
          <button class="btn btn-primary buy-now"
                  data-product-id="${this.product.id}"
                  data-product-name="${this.escapeHtml(this.product.name)}"
                  data-product-price="${this.product.price}"
                  data-product-image="${imageUrl}"
                  ${this.product.stock === 0 ? 'disabled' : ''}>
            <i class="fas fa-bolt"></i>
            <span data-i18n="buy_now">Buy Now</span>
          </button>
        </div>
        
        ${this.product.fastDelivery ? `
          <div class="product-feature">
            <i class="fas fa-truck"></i> <span data-i18n="fast_delivery">Express Delivery Available</span>
          </div>
        ` : ''}
      </div>
    `;

    this.element = card;
    this.attachEventListeners(card);
    
    return card;
  }

  /**
   * Get appropriate badge
   */
  getBadge() {
    if (this.product.stock === 0) {
      return { type: 'out-of-stock', text: 'Out of Stock' };
    }
    
    if (this.product.badge) {
      return { type: this.product.badge.toLowerCase(), text: this.product.badge };
    }
    
    if (this.product.isNew) {
      return { type: 'new', text: 'New' };
    }
    
    if (this.product.isFeatured) {
      return { type: 'featured', text: 'Featured' };
    }
    
    if (this.product.stock < 5 && this.product.stock > 0) {
      return { type: 'limited', text: 'Limited Stock' };
    }
    
    if (this.product.discount && this.product.discount > 20) {
      return { type: 'sale', text: `-${this.product.discount}%` };
    }
    
    return null;
  }

  /**
   * Get image URL with fallback
   */
  getImageUrl(image) {
    if (!image) return this.imageFallback;
    
    // Check for flower images and replace
    if (image.includes('5998519')) {
      console.warn('❌ Flower image detected, using fallback');
      return this.imageFallback;
    }
    
    return image;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners(card) {
    // Card click for navigation
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('.wishlist-btn')) {
        window.location.hash = `product-detail?id=${this.product.id}`;
      }
    });

    // Add to cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.product.stock === 0) {
          this.showNotification('Out of stock', 'error');
          return;
        }
        
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
          await this.addToCart();
          this.animateAddToCart();
        } finally {
          addToCartBtn.disabled = false;
          addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> <span data-i18n="add_to_cart">Add to Cart</span>';
        }
      });
    }

    // Buy now button
    const buyNowBtn = card.querySelector('.buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.product.stock === 0) {
          this.showNotification('Out of stock', 'error');
          return;
        }
        
        buyNowBtn.disabled = true;
        buyNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
          await this.buyNow();
        } finally {
          buyNowBtn.disabled = false;
          buyNowBtn.innerHTML = '<i class="fas fa-bolt"></i> <span data-i18n="buy_now">Buy Now</span>';
        }
      });
    }

    // Wishlist button
    const wishlistBtn = card.querySelector('.wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.toggleWishlist(wishlistBtn);
      });
    }
  }

  /**
   * Add to cart
   */
  async addToCart() {
    const event = new CustomEvent('addToCart', {
      detail: {
        product: {
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          images: [this.getImageUrl(this.product.images?.[0])]
        },
        quantity: 1
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Buy now
   */
  async buyNow() {
    const event = new CustomEvent('addToCart', {
      detail: {
        product: {
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          images: [this.getImageUrl(this.product.images?.[0])]
        },
        quantity: 1,
        checkout: true
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Toggle wishlist
   */
  async toggleWishlist(btn) {
    const icon = btn.querySelector('i');
    const isInWishlist = icon.classList.contains('fas');
    
    btn.disabled = true;
    
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(this.product.id);
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.classList.remove('active');
        this.showNotification('Removed from wishlist', 'info');
      } else {
        await wishlistService.addToWishlist(this.product.id);
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.classList.add('active');
        this.showNotification('Added to wishlist!', 'success');
        this.animateWishlist(btn);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      this.showNotification('Failed to update wishlist', 'error');
    } finally {
      btn.disabled = false;
    }
  }

  /**
   * Animate add to cart
   */
  animateAddToCart() {
    const card = this.element;
    card.classList.add('added-to-cart');
    setTimeout(() => card.classList.remove('added-to-cart'), 500);
    
    // Animate cart icon
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
   * Render rating stars
   */
  renderRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
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
   * Update product data
   */
  updateProduct(newData) {
    this.product = { ...this.product, ...newData };
    this.render();
  }

  /**
   * Get product element
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }
}

// ============================================
// ADDITIONAL STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .product-card {
    position: relative;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    border: 1px solid rgba(212,175,55,0.1);
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(212,175,55,0.15);
    border-color: rgba(212,175,55,0.3);
  }
  
  .product-card.added-to-cart {
    animation: addedPulse 0.5s ease;
  }
  
  @keyframes addedPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(212,175,55,0.3); }
    100% { transform: scale(1); }
  }
  
  .product-image {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f5f5f5;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .product-card:hover .product-image img {
    transform: scale(1.08);
  }
  
  .product-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 0.35rem 1rem;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .product-badge.new {
    background: linear-gradient(135deg, #28A745, #5CB85C);
    color: white;
  }
  
  .product-badge.featured {
    background: linear-gradient(135deg, #D4AF37, #FF8C42);
    color: white;
  }
  
  .product-badge.sale {
    background: linear-gradient(135deg, #DC3545, #FF6B6B);
    color: white;
  }
  
  .product-badge.limited {
    background: linear-gradient(135deg, #FF8C42, #FF6B6B);
    color: white;
  }
  
  .product-badge.out-of-stock {
    background: #666;
    color: white;
  }
  
  .wishlist-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #D4AF37;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 2;
  }
  
  .wishlist-btn:hover {
    background: #D4AF37;
    color: white;
    transform: scale(1.1);
  }
  
  .wishlist-btn.active {
    background: #D4AF37;
    color: white;
  }
  
  .wishlist-btn.pulse {
    animation: pulse 0.5s ease;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  .product-info {
    padding: 1.25rem;
  }
  
  .product-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #0F0F0F;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-price-container {
    margin-bottom: 0.5rem;
  }
  
  .product-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #D4AF37;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .original-price {
    font-size: 0.9rem;
    color: #999;
    text-decoration: line-through;
    font-weight: 400;
  }
  
  .discount-badge {
    font-size: 0.7rem;
    background: rgba(40,167,69,0.1);
    color: #28A745;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #D4AF37;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }
  
  .product-rating span {
    color: #666;
    margin-left: 0.25rem;
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.8rem;
  }
  
  .stock-status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stock-status.in-stock {
    color: #28A745;
  }
  
  .stock-status.out-of-stock {
    color: #DC3545;
  }
  
  .sold-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #FF8C42;
  }
  
  .product-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .product-actions .btn {
    flex: 1;
    padding: 0.6rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .product-feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: #666;
  }
  
  .product-feature i {
    color: #D4AF37;
  }
  
  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .product-card {
      background: #1A1A1A;
      border-color: rgba(212,175,55,0.1);
    }
    
    .product-title {
      color: #FFFFFF;
    }
    
    .product-rating span {
      color: #CCCCCC;
    }
    
    .product-feature {
      color: #CCCCCC;
    }
    
    .wishlist-btn {
      background: #2A2A2A;
      color: #D4AF37;
    }
    
    .wishlist-btn:hover {
      background: #D4AF37;
      color: #0F0F0F;
    }
  }
  
  /* Mobile Responsive */
  @media (max-width: 768px) {
    .product-actions {
      flex-direction: column;
    }
    
    .product-actions .btn {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);