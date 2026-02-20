import { authService } from './auth.js';
import { firestoreService } from './firestore.js';
import { db } from './init.js';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ============================================
// CART SERVICE - Complete Shopping Cart Management
// ============================================
export class CartService {
  constructor() {
    this.cart = [];
    this.listeners = [];
    this.savedForLater = [];
    this.promoCode = null;
    this.discount = 0;
    this.shippingCost = 50;
    this.freeShippingThreshold = 999;
    this.taxRate = 0.18;
    this.init();
  }

  /**
   * Initialize cart service
   */
  init() {
    this.loadLocalCart();
    this.loadSavedForLater();
    this.loadPromoCode();
    
    window.addEventListener('authStateChanged', (e) => {
      if (e.detail.user) {
        this.syncCartWithFirestore();
        this.syncSavedForLater();
      } else {
        this.loadLocalCart();
        this.loadSavedForLater();
      }
    });
    
    console.log('✅ CartService initialized');
  }

  // ============================================
  // CART OPERATIONS
  // ============================================

  /**
   * Load cart from localStorage
   */
  loadLocalCart() {
    try {
      const savedCart = localStorage.getItem('cart');
      this.cart = savedCart ? JSON.parse(savedCart) : [];
      console.log(`📦 Loaded ${this.cart.length} items from local cart`);
    } catch (error) {
      console.error('Error loading local cart:', error);
      this.cart = [];
    }
  }

  /**
   * Load saved for later items
   */
  loadSavedForLater() {
    try {
      const saved = localStorage.getItem('savedForLater');
      this.savedForLater = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved for later:', error);
      this.savedForLater = [];
    }
  }

  /**
   * Load promo code
   */
  loadPromoCode() {
    try {
      const saved = localStorage.getItem('promoCode');
      if (saved) {
        const { code, discount } = JSON.parse(saved);
        this.promoCode = code;
        this.discount = discount;
      }
    } catch (error) {
      console.error('Error loading promo code:', error);
    }
  }

  /**
   * Sync cart with Firestore
   */
  async syncCartWithFirestore() {
    if (!authService.currentUser) return;
    
    try {
      const userData = await firestoreService.getUser(authService.currentUser.uid);
      const firestoreCart = userData?.cart || [];
      
      // Merge local cart with Firestore cart
      const mergedCart = this.mergeCarts(this.cart, firestoreCart);
      
      // Update Firestore with merged cart
      for (const item of mergedCart) {
        await firestoreService.addToCart(authService.currentUser.uid, {
          id: item.productId,
          name: item.name,
          price: item.price,
          images: [item.image]
        });
      }
      
      this.cart = mergedCart;
      localStorage.removeItem('cart');
      this.notifyListeners();
      
      // Listen to real-time updates
      firestoreService.listenToUserCart(authService.currentUser.uid, (cart) => {
        this.cart = cart;
        this.notifyListeners();
      });
      
      console.log('🔄 Cart synced with Firestore');
    } catch (error) {
      console.error('Error syncing cart with Firestore:', error);
    }
  }

  /**
   * Sync saved for later with Firestore
   */
  async syncSavedForLater() {
    if (!authService.currentUser) return;
    
    try {
      const userData = await firestoreService.getUser(authService.currentUser.uid);
      const firestoreSaved = userData?.savedForLater || [];
      
      // Merge local saved with Firestore saved
      const mergedSaved = this.mergeSavedItems(this.savedForLater, firestoreSaved);
      
      this.savedForLater = mergedSaved;
      localStorage.removeItem('savedForLater');
      
      console.log('🔄 Saved items synced with Firestore');
    } catch (error) {
      console.error('Error syncing saved items:', error);
    }
  }

  /**
   * Merge local and Firestore carts
   */
  mergeCarts(localCart, firestoreCart) {
    const merged = [...firestoreCart];
    
    localCart.forEach(localItem => {
      const existing = merged.find(item => item.productId === localItem.id);
      if (existing) {
        existing.quantity += localItem.quantity;
      } else {
        merged.push({
          productId: localItem.id,
          name: localItem.name,
          price: localItem.price,
          image: localItem.image,
          quantity: localItem.quantity,
          addedAt: new Date().toISOString()
        });
      }
    });
    
    return merged;
  }

  /**
   * Merge saved items
   */
  mergeSavedItems(localSaved, firestoreSaved) {
    const merged = [...firestoreSaved];
    
    localSaved.forEach(localItem => {
      const existing = merged.find(item => item.productId === localItem.productId);
      if (!existing) {
        merged.push(localItem);
      }
    });
    
    return merged;
  }

  /**
   * Add item to cart
   */
  async addItem(product, quantity = 1) {
    try {
      // Validate product
      if (!product || !product.id) {
        throw new Error('Invalid product');
      }

      // Check stock (if available)
      if (product.stock !== undefined && quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available`);
      }

      const existingItem = this.cart.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Check if new quantity exceeds stock
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock !== undefined && newQuantity > product.stock) {
          throw new Error(`Cannot add more than ${product.stock} items`);
        }
        existingItem.quantity = newQuantity;
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || 'placeholder.jpg',
          quantity,
          maxStock: product.stock || 99,
          addedAt: new Date().toISOString()
        });
      }
      
      // Save to appropriate storage
      if (authService.currentUser) {
        await firestoreService.addToCart(authService.currentUser.uid, product);
      } else {
        this.saveToLocalStorage();
      }
      
      this.notifyListeners();
      this.dispatchCartEvent('itemAdded', { product, quantity });
      
      console.log(`✅ Added ${quantity} x ${product.name} to cart`);
      return { success: true, cart: this.cart };
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(productId) {
    try {
      const removedItem = this.cart.find(item => item.productId === productId);
      this.cart = this.cart.filter(item => item.productId !== productId);
      
      if (authService.currentUser) {
        await firestoreService.removeFromCart(authService.currentUser.uid, productId);
      } else {
        this.saveToLocalStorage();
      }
      
      this.notifyListeners();
      this.dispatchCartEvent('itemRemoved', { productId, item: removedItem });
      
      console.log(`✅ Removed item ${productId} from cart`);
      return { success: true };
      
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update item quantity
   */
  async updateQuantity(productId, quantity) {
    try {
      const item = this.cart.find(item => item.productId === productId);
      
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      // Validate quantity
      if (quantity < 1) {
        return await this.removeItem(productId);
      }
      
      if (item.maxStock && quantity > item.maxStock) {
        throw new Error(`Maximum quantity is ${item.maxStock}`);
      }
      
      const oldQuantity = item.quantity;
      item.quantity = quantity;
      
      if (authService.currentUser) {
        await firestoreService.updateCartQuantity(authService.currentUser.uid, productId, quantity);
      } else {
        this.saveToLocalStorage();
      }
      
      this.notifyListeners();
      this.dispatchCartEvent('quantityUpdated', { productId, oldQuantity, newQuantity: quantity });
      
      console.log(`✅ Updated quantity for ${productId}: ${quantity}`);
      return { success: true };
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      this.cart = [];
      
      if (authService.currentUser) {
        const userRef = doc(db, 'users', authService.currentUser.uid);
        await updateDoc(userRef, { cart: [] });
      } else {
        localStorage.removeItem('cart');
      }
      
      this.notifyListeners();
      this.dispatchCartEvent('cartCleared', {});
      
      console.log('✅ Cart cleared');
      return { success: true };
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Move item to saved for later
   */
  async moveToSaved(productId) {
    try {
      const item = this.cart.find(item => item.productId === productId);
      
      if (!item) {
        throw new Error('Item not found in cart');
      }
      
      // Remove from cart
      await this.removeItem(productId);
      
      // Add to saved for later
      this.savedForLater.push({
        ...item,
        savedAt: new Date().toISOString()
      });
      
      if (authService.currentUser) {
        // Sync with Firestore
        const userRef = doc(db, 'users', authService.currentUser.uid);
        await updateDoc(userRef, {
          savedForLater: arrayUnion(item)
        });
      } else {
        this.saveSavedForLater();
      }
      
      this.dispatchCartEvent('movedToSaved', { productId, item });
      
      console.log(`✅ Moved ${productId} to saved for later`);
      return { success: true };
      
    } catch (error) {
      console.error('Error moving to saved:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Move item from saved to cart
   */
  async moveToCart(productId) {
    try {
      const item = this.savedForLater.find(item => item.productId === productId);
      
      if (!item) {
        throw new Error('Item not found in saved');
      }
      
      // Remove from saved
      this.savedForLater = this.savedForLater.filter(item => item.productId !== productId);
      
      // Add to cart
      await this.addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image
      }, item.quantity);
      
      if (authService.currentUser) {
        // Sync with Firestore
        const userRef = doc(db, 'users', authService.currentUser.uid);
        await updateDoc(userRef, {
          savedForLater: arrayRemove(item)
        });
      } else {
        this.saveSavedForLater();
      }
      
      this.dispatchCartEvent('movedToCart', { productId, item });
      
      console.log(`✅ Moved ${productId} to cart`);
      return { success: true };
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code) {
    try {
      // Define valid promo codes
      const promoCodes = {
        'DIWALI20': { discount: 20, type: 'percentage' },
        'FESTIVE15': { discount: 15, type: 'percentage' },
        'SAVE100': { discount: 100, type: 'fixed' },
        'FREESHIP': { discount: 0, type: 'freeshipping' }
      };
      
      const promo = promoCodes[code.toUpperCase()];
      
      if (!promo) {
        throw new Error('Invalid promo code');
      }
      
      this.promoCode = code.toUpperCase();
      
      if (promo.type === 'percentage') {
        this.discount = this.getSubtotal() * (promo.discount / 100);
      } else if (promo.type === 'fixed') {
        this.discount = promo.discount;
      } else if (promo.type === 'freeshipping') {
        this.shippingCost = 0;
      }
      
      // Save to localStorage
      localStorage.setItem('promoCode', JSON.stringify({
        code: this.promoCode,
        discount: this.discount
      }));
      
      this.notifyListeners();
      this.dispatchCartEvent('promoApplied', { code, discount: this.discount });
      
      console.log(`✅ Promo code ${code} applied`);
      return { success: true, discount: this.discount };
      
    } catch (error) {
      console.error('Error applying promo code:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove promo code
   */
  removePromoCode() {
    this.promoCode = null;
    this.discount = 0;
    this.shippingCost = 50;
    localStorage.removeItem('promoCode');
    this.notifyListeners();
    this.dispatchCartEvent('promoRemoved', {});
    
    console.log('✅ Promo code removed');
    return { success: true };
  }

  // ============================================
  // CALCULATIONS
  // ============================================

  /**
   * Get cart subtotal
   */
  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get shipping cost
   */
  getShipping() {
    const subtotal = this.getSubtotal();
    
    // Free shipping over threshold
    if (subtotal >= this.freeShippingThreshold) {
      return 0;
    }
    
    return this.shippingCost;
  }

  /**
   * Get tax amount
   */
  getTax() {
    return this.getSubtotal() * this.taxRate;
  }

  /**
   * Get discount amount
   */
  getDiscount() {
    return this.discount;
  }

  /**
   * Get cart total
   */
  getTotal() {
    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const tax = this.getTax();
    const discount = this.getDiscount();
    
    return subtotal + shipping + tax - discount;
  }

  /**
   * Get item count
   */
  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Get unique item count
   */
  getUniqueItemCount() {
    return this.cart.length;
  }

  /**
   * Check if cart is empty
   */
  isEmpty() {
    return this.cart.length === 0;
  }

  /**
   * Get cart weight (for shipping calculation)
   */
  getCartWeight() {
    return this.cart.reduce((weight, item) => weight + (item.weight || 0.2) * item.quantity, 0);
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate cart for checkout
   */
  validateForCheckout() {
    const errors = [];
    
    if (this.isEmpty()) {
      errors.push('Cart is empty');
    }
    
    // Check stock availability
    this.cart.forEach(item => {
      if (item.maxStock && item.quantity > item.maxStock) {
        errors.push(`${item.name} exceeds available stock`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  /**
   * Save cart to localStorage
   */
  saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  /**
   * Save saved for later to localStorage
   */
  saveSavedForLater() {
    localStorage.setItem('savedForLater', JSON.stringify(this.savedForLater));
  }

  // ============================================
  // EVENT HANDLING
  // ============================================

  /**
   * Subscribe to cart changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Immediately notify with current cart
    listener({
      cart: this.cart,
      savedForLater: this.savedForLater,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      tax: this.getTax(),
      discount: this.getDiscount(),
      total: this.getTotal(),
      itemCount: this.getItemCount(),
      promoCode: this.promoCode
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const data = {
      cart: this.cart,
      savedForLater: this.savedForLater,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      tax: this.getTax(),
      discount: this.getDiscount(),
      total: this.getTotal(),
      itemCount: this.getItemCount(),
      promoCode: this.promoCode
    };
    
    this.listeners.forEach(listener => listener(data));
    
    // Update cart count badge
    this.updateCartCountBadge();
    
    // Update localStorage for non-authenticated users
    if (!authService.currentUser) {
      this.saveToLocalStorage();
    }
  }

  /**
   * Dispatch cart event
   */
  dispatchCartEvent(type, data) {
    const event = new CustomEvent('cartUpdated', {
      detail: { type, data, cart: this.cart }
    });
    window.dispatchEvent(event);
  }

  /**
   * Update cart count badge in UI
   */
  updateCartCountBadge() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = this.getItemCount();
      
      // Animate if count changes
      cartCount.classList.add('pulse');
      setTimeout(() => cartCount.classList.remove('pulse'), 300);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get cart summary
   */
  getSummary() {
    return {
      items: this.cart,
      savedForLater: this.savedForLater,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      tax: this.getTax(),
      discount: this.getDiscount(),
      total: this.getTotal(),
      itemCount: this.getItemCount(),
      uniqueItemCount: this.getUniqueItemCount(),
      promoCode: this.promoCode,
      isEmpty: this.isEmpty()
    };
  }

  /**
   * Get item by product ID
   */
  getItem(productId) {
    return this.cart.find(item => item.productId === productId);
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId) {
    return this.cart.some(item => item.productId === productId);
  }

  /**
   * Get quantity of specific product
   */
  getItemQuantity(productId) {
    const item = this.getItem(productId);
    return item ? item.quantity : 0;
  }

  /**
   * Clear all data (cart + saved + promo)
   */
  async clearAll() {
    await this.clearCart();
    this.savedForLater = [];
    this.removePromoCode();
    this.saveSavedForLater();
    this.notifyListeners();
  }

  /**
   * Destroy service (cleanup)
   */
  destroy() {
    this.listeners = [];
    this.cart = [];
    this.savedForLater = [];
    this.promoCode = null;
    this.discount = 0;
    console.log('🧹 CartService destroyed');
  }
}

// ============================================
// ADD CSS ANIMATIONS
// ============================================
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .cart-count.pulse {
    animation: pulse 0.3s ease;
  }
`;
document.head.appendChild(style);

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const cartService = new CartService();

// Export default for easy import
export default cartService;