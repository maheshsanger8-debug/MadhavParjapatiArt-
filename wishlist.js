import { firestoreService } from './firestore.js';
import { authService } from './auth.js';
import { storageService } from './storage.js';
import { eventBus } from './eventBus.js';

export class WishlistService {
  constructor() {
    this.wishlist = [];
    this.wishlistDetails = new Map(); // Store product details
    this.listeners = [];
    this.isLoading = false;
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.init();
  }

  init() {
    this.loadLocalWishlist();
    this.setupAuthListener();
    this.setupStorageListener();
    this.loadWishlistDetails();
  }

  setupAuthListener() {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', (e) => {
      if (e.detail.user) {
        this.syncWishlistWithFirestore();
      } else {
        this.loadLocalWishlist();
        this.clearWishlistDetails();
      }
    });
  }

  setupStorageListener() {
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'wishlist') {
        this.loadLocalWishlist();
      }
    });
  }

  async loadLocalWishlist() {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      this.wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      this.notifyListeners();
      
      // Load details for wishlist items
      if (this.wishlist.length > 0) {
        await this.loadWishlistDetails();
      }
    } catch (error) {
      console.error('Error loading local wishlist:', error);
      this.wishlist = [];
    }
  }

  async loadWishlistDetails() {
    if (this.wishlist.length === 0) {
      this.wishlistDetails.clear();
      return;
    }

    this.isLoading = true;
    this.notifyListeners();

    try {
      // Load product details from Firestore
      const products = await firestoreService.getProductsByIds(this.wishlist);
      
      this.wishlistDetails.clear();
      products.forEach(product => {
        if (product) {
          this.wishlistDetails.set(product.id, product);
        }
      });

      // Remove any invalid product IDs
      const validIds = products.map(p => p.id).filter(id => id);
      if (validIds.length !== this.wishlist.length) {
        this.wishlist = validIds;
        this.saveWishlist();
      }
    } catch (error) {
      console.error('Error loading wishlist details:', error);
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async syncWishlistWithFirestore() {
    if (!authService.currentUser || this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      const userData = await firestoreService.getUser(authService.currentUser.uid);
      const firestoreWishlist = userData?.wishlist || [];
      
      // Merge local and Firestore wishlists
      const mergedWishlist = [...new Set([...this.wishlist, ...firestoreWishlist])];
      
      // Sync to Firestore
      if (mergedWishlist.length > 0) {
        await firestoreService.updateUser(authService.currentUser.uid, {
          wishlist: mergedWishlist
        });
      }
      
      // Update local state
      this.wishlist = mergedWishlist;
      localStorage.removeItem('wishlist');
      
      // Load details for new items
      await this.loadWishlistDetails();
      
      this.lastSyncTime = new Date();
      this.notifyListeners();
      
      // Dispatch sync event
      eventBus.emit('wishlist:synced', {
        count: this.wishlist.length,
        timestamp: this.lastSyncTime
      });
      
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      this.showNotification('Failed to sync wishlist', 'error');
    } finally {
      this.syncInProgress = false;
    }
  }

  async addToWishlist(productId, productData = null) {
    if (!productId) return false;
    
    // Check if already in wishlist
    if (this.wishlist.includes(productId)) {
      this.showNotification('Item already in wishlist', 'info');
      return false;
    }

    try {
      // Add to local wishlist
      this.wishlist.push(productId);
      
      // Add product details if provided
      if (productData) {
        this.wishlistDetails.set(productId, productData);
      }
      
      // Save to appropriate storage
      if (authService.currentUser) {
        await firestoreService.addToWishlist(authService.currentUser.uid, productId);
      } else {
        this.saveWishlist();
      }
      
      this.notifyListeners();
      
      // Dispatch events
      eventBus.emit('wishlist:added', { 
        productId, 
        productData,
        count: this.wishlist.length 
      });
      
      this.showNotification('Added to wishlist', 'success');
      
      // Track analytics
      this.trackEvent('add_to_wishlist', { productId });
      
      return true;
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      this.showNotification('Failed to add to wishlist', 'error');
      
      // Revert local change
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.wishlistDetails.delete(productId);
      
      return false;
    }
  }

  async removeFromWishlist(productId) {
    if (!productId) return false;
    
    const wasInWishlist = this.wishlist.includes(productId);
    
    try {
      // Remove from local wishlist
      this.wishlist = this.wishlist.filter(id => id !== productId);
      this.wishlistDetails.delete(productId);
      
      // Save to appropriate storage
      if (authService.currentUser) {
        await firestoreService.removeFromWishlist(authService.currentUser.uid, productId);
      } else {
        this.saveWishlist();
      }
      
      this.notifyListeners();
      
      // Dispatch events
      eventBus.emit('wishlist:removed', { 
        productId,
        count: this.wishlist.length 
      });
      
      if (wasInWishlist) {
        this.showNotification('Removed from wishlist', 'info');
      }
      
      // Track analytics
      this.trackEvent('remove_from_wishlist', { productId });
      
      return true;
      
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      this.showNotification('Failed to remove from wishlist', 'error');
      
      // Revert if removal failed and it was in wishlist
      if (wasInWishlist) {
        this.wishlist.push(productId);
        await this.loadWishlistDetails();
        this.notifyListeners();
      }
      
      return false;
    }
  }

  async toggleWishlist(productId, productData = null) {
    if (this.isInWishlist(productId)) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId, productData);
    }
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  getWishlist() {
    return this.wishlist;
  }

  getWishlistDetails() {
    return Array.from(this.wishlistDetails.values());
  }

  getWishlistCount() {
    return this.wishlist.length;
  }

  getProductDetails(productId) {
    return this.wishlistDetails.get(productId);
  }

  async clearWishlist() {
    if (this.wishlist.length === 0) return true;
    
    try {
      const productIds = [...this.wishlist];
      
      // Clear local wishlist
      this.wishlist = [];
      this.wishlistDetails.clear();
      
      // Clear from storage
      if (authService.currentUser) {
        await firestoreService.updateUser(authService.currentUser.uid, {
          wishlist: []
        });
      } else {
        localStorage.removeItem('wishlist');
      }
      
      this.notifyListeners();
      
      // Dispatch event
      eventBus.emit('wishlist:cleared', { 
        previousCount: productIds.length 
      });
      
      this.showNotification('Wishlist cleared', 'info');
      
      // Track analytics
      this.trackEvent('clear_wishlist', { count: productIds.length });
      
      return true;
      
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      this.showNotification('Failed to clear wishlist', 'error');
      return false;
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  clearWishlistDetails() {
    this.wishlistDetails.clear();
  }

  async moveToCart(productId) {
    try {
      // Import cart service dynamically to avoid circular dependency
      const { cartService } = await import('./cart.js');
      
      // Get product details
      const product = this.wishlistDetails.get(productId);
      
      // Add to cart
      await cartService.addToCart(productId, product);
      
      // Remove from wishlist
      await this.removeFromWishlist(productId);
      
      this.showNotification('Moved to cart', 'success');
      
      // Track analytics
      this.trackEvent('move_to_cart', { productId });
      
      return true;
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      this.showNotification('Failed to move to cart', 'error');
      return false;
    }
  }

  async moveAllToCart() {
    if (this.wishlist.length === 0) return true;
    
    try {
      const { cartService } = await import('./cart.js');
      let successCount = 0;
      let failCount = 0;
      
      for (const [productId, product] of this.wishlistDetails) {
        try {
          await cartService.addToCart(productId, product);
          await this.removeFromWishlist(productId);
          successCount++;
        } catch (error) {
          console.error(`Error moving product ${productId} to cart:`, error);
          failCount++;
        }
      }
      
      this.showNotification(
        `Moved ${successCount} items to cart${failCount > 0 ? `, ${failCount} failed` : ''}`,
        failCount > 0 ? 'warning' : 'success'
      );
      
      // Track analytics
      this.trackEvent('move_all_to_cart', { 
        success: successCount, 
        failed: failCount 
      });
      
      return failCount === 0;
      
    } catch (error) {
      console.error('Error moving all to cart:', error);
      this.showNotification('Failed to move items to cart', 'error');
      return false;
    }
  }

  async shareWishlist() {
    if (this.wishlist.length === 0) {
      this.showNotification('Wishlist is empty', 'info');
      return;
    }

    try {
      // Create shareable link
      const shareData = {
        title: 'My Wishlist - Madhav Prajapati Art',
        text: `Check out my wishlist of ${this.wishlist.length} handcrafted diyas!`,
        url: `${window.location.origin}/wishlist/shared?ids=${this.wishlist.join(',')}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        this.showNotification('Wishlist link copied to clipboard', 'success');
      }
      
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  }

  async exportWishlist() {
    const wishlistData = {
      exportDate: new Date().toISOString(),
      userId: authService.currentUser?.uid || 'guest',
      itemCount: this.wishlist.length,
      items: Array.from(this.wishlistDetails.values())
    };

    const blob = new Blob([JSON.stringify(wishlistData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wishlist-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showNotification('Wishlist exported successfully', 'success');
  }

  async importWishlist(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid wishlist format');
      }

      let imported = 0;
      let skipped = 0;

      for (const item of data.items) {
        if (item.id && !this.wishlist.includes(item.id)) {
          this.wishlist.push(item.id);
          this.wishlistDetails.set(item.id, item);
          imported++;
        } else {
          skipped++;
        }
      }

      await this.syncWishlistWithFirestore();
      
      this.showNotification(
        `Imported ${imported} items${skipped > 0 ? `, ${skipped} already in wishlist` : ''}`,
        'success'
      );

      return true;
      
    } catch (error) {
      console.error('Error importing wishlist:', error);
      this.showNotification('Failed to import wishlist', 'error');
      return false;
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener({
      items: this.wishlist,
      details: Array.from(this.wishlistDetails.values()),
      count: this.wishlist.length,
      isLoading: this.isLoading
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const state = {
      items: this.wishlist,
      details: Array.from(this.wishlistDetails.values()),
      count: this.wishlist.length,
      isLoading: this.isLoading
    };
    
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  trackEvent(eventName, data = {}) {
    // Track with Google Analytics if available
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...data,
        user_id: authService.currentUser?.uid || 'guest',
        wishlist_size: this.wishlist.length
      });
    }
    
    // Store in localStorage for analytics
    const events = JSON.parse(localStorage.getItem('wishlist_events') || '[]');
    events.push({
      event: eventName,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('wishlist_events', JSON.stringify(events.slice(-50))); // Keep last 50
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 
                           type === 'error' ? 'exclamation-circle' : 
                           'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Utility methods
  isEmpty() {
    return this.wishlist.length === 0;
  }

  getWishlistValue() {
    // Calculate total value of wishlist
    let total = 0;
    this.wishlistDetails.forEach(product => {
      total += product.price || 0;
    });
    return total;
  }

  getUniqueCategories() {
    const categories = new Set();
    this.wishlistDetails.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  }

  async checkPrices() {
    // Check for price changes in wishlist items
    const priceChanges = [];
    
    for (const [productId, product] of this.wishlistDetails) {
      try {
        const currentProduct = await firestoreService.getProduct(productId);
        if (currentProduct && currentProduct.price !== product.price) {
          priceChanges.push({
            productId,
            name: product.name,
            oldPrice: product.price,
            newPrice: currentProduct.price,
            change: currentProduct.price - product.price
          });
          
          // Update cached price
          product.price = currentProduct.price;
          this.wishlistDetails.set(productId, product);
        }
      } catch (error) {
        console.error(`Error checking price for ${productId}:`, error);
      }
    }
    
    if (priceChanges.length > 0) {
      this.notifyListeners();
      
      // Notify user of price changes
      priceChanges.forEach(change => {
        const changeType = change.change < 0 ? 'dropped' : 'increased';
        this.showNotification(
          `Price ${changeType} for ${change.name}: ₹${change.oldPrice} → ₹${change.newPrice}`,
          change.change < 0 ? 'success' : 'info'
        );
      });
    }
    
    return priceChanges;
  }
}

// Create and export singleton instance
export const wishlistService = new WishlistService();

// Add CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    background: white;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 9999;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 350px;
  }

  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }

  .notification-success {
    border-left: 4px solid #28a745;
  }

  .notification-success i {
    color: #28a745;
  }

  .notification-error {
    border-left: 4px solid #dc3545;
  }

  .notification-error i {
    color: #dc3545;
  }

  .notification-warning {
    border-left: 4px solid #ffc107;
  }

  .notification-warning i {
    color: #ffc107;
  }

  .notification-info {
    border-left: 4px solid #17a2b8;
  }

  .notification-info i {
    color: #17a2b8;
  }

  @media (max-width: 768px) {
    .notification {
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`;

document.head.appendChild(style);

export default wishlistService;