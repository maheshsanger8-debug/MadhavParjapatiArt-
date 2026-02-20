import { cartService } from './cart.js';
import { currencyFormatter } from './currency.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// CART ITEM COMPONENT - Premium Cart Item
// ============================================
export class CartItem {
  constructor(item) {
    this.item = item;
    this.element = null;
    this.imageFallback = 'https://via.placeholder.com/100x100/F5E6CA/D4AF37?text=Product+Image';
  }

  /**
   * Render cart item
   */
  render() {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item fade-in';
    itemElement.setAttribute('data-product-id', this.item.productId);
    itemElement.setAttribute('data-item-id', `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    
    // Calculate item total
    const itemTotal = this.item.price * this.item.quantity;
    
    itemElement.innerHTML = `
      <div class="cart-item-image-container">
        <img 
          src="${this.getImageUrl(this.item.image)}" 
          alt="${this.escapeHtml(this.item.name)}" 
          class="cart-item-image"
          loading="lazy"
          onerror="this.onerror=null; this.src='${this.imageFallback}';"
        >
        ${this.item.stock < 5 ? '<span class="stock-badge low-stock">Low Stock</span>' : ''}
      </div>
      
      <div class="cart-item-details">
        <h3 class="cart-item-title">${this.escapeHtml(this.item.name)}</h3>
        
        <div class="cart-item-price-row">
          <span class="cart-item-price-label" data-i18n="price">Price:</span>
          <span class="cart-item-price">${currencyFormatter.format(this.item.price)}</span>
        </div>
        
        <div class="cart-item-quantity-wrapper">
          <label for="quantity-${this.item.productId}" class="quantity-label" data-i18n="quantity">Quantity:</label>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease-btn" data-action="decrease" aria-label="Decrease quantity">
              <i class="fas fa-minus"></i>
            </button>
            
            <input 
              type="number" 
              id="quantity-${this.item.productId}"
              class="quantity-input" 
              value="${this.item.quantity}" 
              min="1" 
              max="${this.item.maxStock || 99}"
              readonly
              aria-label="Item quantity"
            >
            
            <button class="quantity-btn increase-btn" data-action="increase" aria-label="Increase quantity">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
        <div class="cart-item-actions">
          <button class="remove-btn" data-action="remove" aria-label="Remove item">
            <i class="fas fa-trash-alt"></i>
            <span data-i18n="remove">Remove</span>
          </button>
          
          <button class="save-for-later-btn" data-action="saveLater" aria-label="Save for later">
            <i class="far fa-bookmark"></i>
            <span data-i18n="save_for_later">Save for later</span>
          </button>
        </div>
      </div>
      
      <div class="cart-item-total-section">
        <div class="cart-item-total-label" data-i18n="total">Total:</div>
        <div class="cart-item-total">${currencyFormatter.format(itemTotal)}</div>
        <div class="cart-item-unit-price">(${currencyFormatter.format(this.item.price)} × ${this.item.quantity})</div>
      </div>
    `;

    this.element = itemElement;
    this.attachEventListeners(itemElement);
    this.attachQuantityInputListeners(itemElement);
    
    // Animate item entrance
    setTimeout(() => {
      animationManager.animateElement(itemElement, 'fadeInRight', 400);
    }, 50);
    
    return itemElement;
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
  attachEventListeners(element) {
    const decreaseBtn = element.querySelector('[data-action="decrease"]');
    const increaseBtn = element.querySelector('[data-action="increase"]');
    const removeBtn = element.querySelector('[data-action="remove"]');
    const saveLaterBtn = element.querySelector('[data-action="saveLater"]');

    // Decrease quantity
    decreaseBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const newQuantity = this.item.quantity - 1;
      if (newQuantity >= 1) {
        await this.updateQuantity(newQuantity);
        this.animateButton(decreaseBtn);
      } else {
        await this.removeItem();
      }
    });

    // Increase quantity
    increaseBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const newQuantity = this.item.quantity + 1;
      await this.updateQuantity(newQuantity);
      this.animateButton(increaseBtn);
    });

    // Remove item
    removeBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.removeItem();
    });

    // Save for later
    saveLaterBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.saveForLater();
    });
  }

  /**
   * Attach quantity input listeners
   */
  attachQuantityInputListeners(element) {
    const quantityInput = element.querySelector('.quantity-input');
    
    // Handle direct input changes (if we make it editable in future)
    quantityInput?.addEventListener('change', async (e) => {
      const newQuantity = parseInt(e.target.value, 10);
      if (newQuantity >= 1 && newQuantity !== this.item.quantity) {
        await this.updateQuantity(newQuantity);
      }
    });
  }

  /**
   * Update item quantity
   */
  async updateQuantity(newQuantity) {
    try {
      // Validate quantity
      if (newQuantity < 1) {
        await this.removeItem();
        return;
      }
      
      if (this.item.maxStock && newQuantity > this.item.maxStock) {
        this.showNotification(`Maximum quantity is ${this.item.maxStock}`, 'warning');
        return;
      }

      // Update in cart service
      await cartService.updateQuantity(this.item.productId, newQuantity);
      
      // Update local quantity
      this.item.quantity = newQuantity;
      
      // Update UI
      this.updateQuantityUI();
      this.updateTotalUI();
      
      // Show success notification
      this.showNotification('Quantity updated', 'success');
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showNotification('Failed to update quantity', 'error');
    }
  }

  /**
   * Update quantity UI
   */
  updateQuantityUI() {
    if (!this.element) return;
    
    const quantityInput = this.element.querySelector('.quantity-input');
    const quantityValue = this.element.querySelector('.quantity-value');
    
    if (quantityInput) {
      quantityInput.value = this.item.quantity;
    }
    
    if (quantityValue) {
      quantityValue.textContent = this.item.quantity;
    }
  }

  /**
   * Update total price UI
   */
  updateTotalUI() {
    if (!this.element) return;
    
    const totalElement = this.element.querySelector('.cart-item-total');
    const unitPriceElement = this.element.querySelector('.cart-item-unit-price');
    const itemTotal = this.item.price * this.item.quantity;
    
    if (totalElement) {
      totalElement.textContent = currencyFormatter.format(itemTotal);
    }
    
    if (unitPriceElement) {
      unitPriceElement.textContent = `(${currencyFormatter.format(this.item.price)} × ${this.item.quantity})`;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem() {
    // Show confirmation dialog
    const confirmed = await this.showConfirmDialog(
      'Remove Item',
      `Are you sure you want to remove ${this.item.name} from your cart?`
    );
    
    if (!confirmed) return;

    try {
      // Animate removal
      this.animateRemoval();
      
      // Remove from cart service
      await cartService.removeItem(this.item.productId);
      
      // Show success notification
      this.showNotification(`${this.item.name} removed from cart`, 'info');
      
    } catch (error) {
      console.error('Error removing item:', error);
      this.showNotification('Failed to remove item', 'error');
    }
  }

  /**
   * Save item for later
   */
  async saveForLater() {
    try {
      // Animate button
      const saveBtn = this.element.querySelector('[data-action="saveLater"]');
      this.animateButton(saveBtn);
      
      // Remove from cart and add to wishlist
      await cartService.removeItem(this.item.productId);
      
      // Import wishlist service dynamically to avoid circular dependency
      const { wishlistService } = await import('./wishlist.js');
      await wishlistService.addToWishlist(this.item.productId);
      
      // Show success notification
      this.showNotification(`${this.item.name} saved for later`, 'success');
      
    } catch (error) {
      console.error('Error saving for later:', error);
      this.showNotification('Failed to save item', 'error');
    }
  }

  /**
   * Animate button click
   */
  animateButton(button) {
    if (!button) return;
    
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200);
  }

  /**
   * Animate item removal
   */
  animateRemoval() {
    if (!this.element) return;
    
    this.element.classList.add('removing');
    
    // Remove after animation
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
      }
    }, 300);
  }

  /**
   * Show confirmation dialog
   */
  showConfirmDialog(title, message) {
    return new Promise((resolve) => {
      // Create modal if it doesn't exist
      let modal = document.querySelector('.confirm-modal');
      
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
          <div class="confirm-modal-content">
            <h3 class="confirm-modal-title"></h3>
            <p class="confirm-modal-message"></p>
            <div class="confirm-modal-actions">
              <button class="btn btn-outline confirm-cancel">Cancel</button>
              <button class="btn btn-primary confirm-ok">OK</button>
            </div>
          </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
          .confirm-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
          }
          
          .confirm-modal-content {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: scaleIn 0.3s ease;
          }
          
          .confirm-modal-title {
            margin-bottom: 1rem;
            color: #0F0F0F;
          }
          
          .confirm-modal-message {
            color: #666;
            margin-bottom: 2rem;
          }
          
          .confirm-modal-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          
          @media (prefers-color-scheme: dark) {
            .confirm-modal-content {
              background: #1A1A1A;
            }
            .confirm-modal-title {
              color: #FFFFFF;
            }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
      }
      
      // Set content
      modal.querySelector('.confirm-modal-title').textContent = title;
      modal.querySelector('.confirm-modal-message').textContent = message;
      
      // Show modal
      modal.style.display = 'flex';
      
      // Handle buttons
      const handleCancel = () => {
        modal.style.display = 'none';
        resolve(false);
        cleanup();
      };
      
      const handleOk = () => {
        modal.style.display = 'none';
        resolve(true);
        cleanup();
      };
      
      const cleanup = () => {
        cancelBtn.removeEventListener('click', handleCancel);
        okBtn.removeEventListener('click', handleOk);
      };
      
      const cancelBtn = modal.querySelector('.confirm-cancel');
      const okBtn = modal.querySelector('.confirm-ok');
      
      cancelBtn.addEventListener('click', handleCancel);
      okBtn.addEventListener('click', handleOk);
    });
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
   * Escape HTML to prevent XSS
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
   * Update item data
   */
  updateItem(newData) {
    this.item = { ...this.item, ...newData };
    this.updateQuantityUI();
    this.updateTotalUI();
  }

  /**
   * Get item element
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
// ADD CSS STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .cart-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: white;
    border-radius: 16px;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    position: relative;
    border: 1px solid rgba(212,175,55,0.1);
  }
  
  .cart-item:hover {
    box-shadow: 0 8px 20px rgba(212,175,55,0.15);
    transform: translateY(-2px);
  }
  
  .cart-item.removing {
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  }
  
  .cart-item-image-container {
    position: relative;
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }
  
  .cart-item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .stock-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    padding: 0.25rem 0.75rem;
    background: #DC3545;
    color: white;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(220,53,69,0.3);
  }
  
  .cart-item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .cart-item-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #0F0F0F;
    margin: 0;
  }
  
  .cart-item-price-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cart-item-price-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .cart-item-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #D4AF37;
  }
  
  .cart-item-quantity-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.5rem 0;
  }
  
  .quantity-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .cart-item-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #F8F9FA;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #0F0F0F;
  }
  
  .quantity-btn:hover {
    background: #D4AF37;
    color: white;
    transform: scale(1.05);
  }
  
  .quantity-btn.clicked {
    transform: scale(0.95);
  }
  
  .quantity-input {
    width: 50px;
    text-align: center;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    padding: 0.25rem;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  .cart-item-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  
  .remove-btn,
  .save-for-later-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: #666;
    transition: all 0.2s ease;
    border-radius: 6px;
  }
  
  .remove-btn:hover {
    color: #DC3545;
    background: rgba(220,53,69,0.1);
  }
  
  .save-for-later-btn:hover {
    color: #D4AF37;
    background: rgba(212,175,55,0.1);
  }
  
  .cart-item-total-section {
    text-align: right;
    min-width: 120px;
  }
  
  .cart-item-total-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .cart-item-total {
    font-size: 1.3rem;
    font-weight: 700;
    color: #D4AF37;
    line-height: 1.2;
  }
  
  .cart-item-unit-price {
    font-size: 0.75rem;
    color: #999;
    margin-top: 0.25rem;
  }
  
  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .cart-item {
      background: #1A1A1A;
      border-color: rgba(212,175,55,0.1);
    }
    
    .cart-item-title {
      color: #FFFFFF;
    }
    
    .cart-item-price-label,
    .quantity-label,
    .cart-item-total-label {
      color: #CCCCCC;
    }
    
    .quantity-btn {
      background: #2A2A2A;
      color: #FFFFFF;
    }
    
    .quantity-input {
      background: #2A2A2A;
      border-color: #404040;
      color: #FFFFFF;
    }
    
    .remove-btn,
    .save-for-later-btn {
      color: #CCCCCC;
    }
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .cart-item {
      flex-direction: column;
      gap: 1rem;
    }
    
    .cart-item-image-container {
      width: 100%;
      height: 200px;
    }
    
    .cart-item-total-section {
      text-align: left;
    }
    
    .cart-item-actions {
      flex-wrap: wrap;
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

document.head.appendChild(style);