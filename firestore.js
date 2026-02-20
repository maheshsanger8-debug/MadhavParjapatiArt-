import { db } from './init.js';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
  runTransaction,
  writeBatch,
  startAt,
  endAt,
  startAfter,
  endBefore,
  limitToLast
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ============================================
// FIRESTORE SERVICE - Complete Database Operations
// For Madhav Prajapati Art - Handcrafted Clay Diyas
// ============================================

export class FirestoreService {
  constructor() {
    this.collections = {
      products: 'products',
      orders: 'orders',
      users: 'users',
      settings: 'settings',
      reviews: 'reviews',
      coupons: 'coupons',
      addresses: 'addresses',
      notifications: 'notifications',
      categories: 'categories',
      wishlist: 'wishlist'
    };
    
    this.cache = new Map();
    this.listeners = new Map();
  }

  // ============================================
  // PRODUCT METHODS
  // ============================================

  /**
   * Get products with advanced filtering
   */
  async getProducts(filters = {}) {
    try {
      let q = collection(db, this.collections.products);
      const constraints = [];
      
      // Category filter
      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }
      
      // Price range filter
      if (filters.minPrice !== undefined && filters.minPrice !== '') {
        constraints.push(where('price', '>=', Number(filters.minPrice)));
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
        constraints.push(where('price', '<=', Number(filters.maxPrice)));
      }
      
      // Rating filter
      if (filters.minRating && filters.minRating > 0) {
        constraints.push(where('rating', '>=', filters.minRating));
      }
      
      // Stock filter
      if (filters.inStockOnly) {
        constraints.push(where('stock', '>', 0));
      }
      
      // Active products only
      if (filters.activeOnly !== false) {
        constraints.push(where('isActive', '==', true));
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }
      
      // Sorting
      if (filters.sortBy) {
        switch(filters.sortBy) {
          case 'price-low':
            constraints.push(orderBy('price', 'asc'));
            break;
          case 'price-high':
            constraints.push(orderBy('price', 'desc'));
            break;
          case 'rating':
            constraints.push(orderBy('rating', 'desc'));
            break;
          case 'popular':
            constraints.push(orderBy('soldCount', 'desc'));
            break;
          case 'discount':
            constraints.push(orderBy('discount', 'desc'));
            break;
          default:
            constraints.push(orderBy('createdAt', 'desc'));
        }
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }
      
      // Limit
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      // Pagination
      if (filters.startAfter) {
        constraints.push(startAfter(filters.startAfter));
      }
      if (filters.endAt) {
        constraints.push(endAt(filters.endAt));
      }
      
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      return {
        success: true,
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        firstDoc: snapshot.docs[0]
      };
      
    } catch (error) {
      console.error('Error getting products:', error);
      return { 
        success: false, 
        error: error.message,
        products: [] 
      };
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(productId) {
    try {
      const docRef = doc(db, this.collections.products, productId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Product not found' };
      }
      
      return { 
        success: true,
        product: {
          id: docSnap.id, 
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date()
        }
      };
      
    } catch (error) {
      console.error('Error getting product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add new product
   */
  async addProduct(productData) {
    try {
      // Validate required fields
      if (!productData.name || !productData.price) {
        return { success: false, error: 'Name and price are required' };
      }

      const product = {
        ...productData,
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        category: productData.category || 'uncategorized',
        price: Number(productData.price),
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
        stock: Number(productData.stock) || 0,
        images: productData.images || [],
        tags: productData.tags || [],
        specifications: productData.specifications || {},
        dimensions: productData.dimensions || {},
        weight: productData.weight || null,
        isActive: productData.isActive !== false,
        isFeatured: productData.isFeatured || false,
        onSale: productData.onSale || false,
        discount: productData.discount ? Number(productData.discount) : 0,
        rating: 0,
        reviewCount: 0,
        soldCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collections.products), product);
      
      return { 
        success: true, 
        id: docRef.id,
        message: 'Product added successfully'
      };
      
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    try {
      const docRef = doc(db, this.collections.products, productId);
      
      // Remove undefined fields
      Object.keys(productData).forEach(key => 
        productData[key] === undefined && delete productData[key]
      );

      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true,
        message: 'Product updated successfully'
      };
      
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, this.collections.products, productId));
      return { 
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update product stock
   */
  async updateProductStock(productId, quantity, operation = 'decrease') {
    try {
      const docRef = doc(db, this.collections.products, productId);
      
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists()) {
          throw new Error('Product not found');
        }
        
        const currentStock = docSnap.data().stock || 0;
        const newStock = operation === 'decrease' 
          ? currentStock - quantity 
          : currentStock + quantity;
        
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }
        
        transaction.update(docRef, { 
          stock: newStock,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Increment product sold count
   */
  async incrementSoldCount(productId, quantity = 1) {
    try {
      const docRef = doc(db, this.collections.products, productId);
      await updateDoc(docRef, {
        soldCount: increment(quantity),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error incrementing sold count:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search products by name/description
   */
  async searchProducts(searchTerm, limit = 20) {
    try {
      const q = query(
        collection(db, this.collections.products),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // ============================================
  // ORDER METHODS
  // ============================================

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      // Validate order data
      if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
        return { success: false, error: 'Invalid order data' };
      }

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const shipping = orderData.shippingCost || 50;
      const tax = subtotal * (orderData.taxRate || 0.18);
      const discount = orderData.discount || 0;
      const total = subtotal + shipping + tax - discount;

      const order = {
        ...orderData,
        orderNumber: await this.generateOrderNumber(),
        subtotal,
        shipping,
        tax,
        discount,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{
          status: 'pending',
          timestamp: serverTimestamp(),
          note: 'Order placed'
        }]
      };

      // Create order in transaction
      const orderRef = await runTransaction(db, async (transaction) => {
        // Create order
        const orderDocRef = doc(collection(db, this.collections.orders));
        transaction.set(orderDocRef, order);
        
        // Update user's orders array
        if (orderData.userId) {
          const userRef = doc(db, this.collections.users, orderData.userId);
          transaction.update(userRef, {
            orders: arrayUnion(orderDocRef.id),
            updatedAt: serverTimestamp()
          });
        }
        
        // Update product stocks
        for (const item of orderData.items) {
          const productRef = doc(db, this.collections.products, item.productId);
          transaction.update(productRef, {
            stock: increment(-item.quantity),
            soldCount: increment(item.quantity),
            updatedAt: serverTimestamp()
          });
        }
        
        return orderDocRef;
      });

      return { 
        success: true, 
        orderId: orderRef.id,
        orderNumber: order.orderNumber,
        message: 'Order created successfully'
      };
      
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MP${timestamp}${random}`;
  }

  /**
   * Get orders with filters
   */
  async getOrders(filters = {}) {
    try {
      let q = collection(db, this.collections.orders);
      const constraints = [];
      
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      if (filters.paymentStatus) {
        constraints.push(where('paymentStatus', '==', filters.paymentStatus));
      }
      
      if (filters.startDate) {
        constraints.push(where('createdAt', '>=', filters.startDate));
      }
      
      if (filters.endDate) {
        constraints.push(where('createdAt', '<=', filters.endDate));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  /**
   * Get single order
   */
  async getOrder(orderId) {
    try {
      const docRef = doc(db, this.collections.orders, orderId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Order not found' };
      }
      
      return { 
        success: true,
        order: {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || new Date()
        }
      };
      
    } catch (error) {
      console.error('Error getting order:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, note = '') {
    try {
      const docRef = doc(db, this.collections.orders, orderId);
      
      await updateDoc(docRef, { 
        status,
        updatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status,
          timestamp: serverTimestamp(),
          note
        })
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, paymentStatus, paymentDetails = {}) {
    try {
      const docRef = doc(db, this.collections.orders, orderId);
      
      await updateDoc(docRef, { 
        paymentStatus,
        paymentDetails,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason = '') {
    try {
      const docRef = doc(db, this.collections.orders, orderId);
      
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists()) {
          throw new Error('Order not found');
        }
        
        const orderData = docSnap.data();
        
        // Restore stock
        for (const item of orderData.items) {
          const productRef = doc(db, this.collections.products, item.productId);
          transaction.update(productRef, {
            stock: increment(item.quantity),
            soldCount: increment(-item.quantity)
          });
        }
        
        // Update order status
        transaction.update(docRef, {
          status: 'cancelled',
          cancellationReason: reason,
          updatedAt: serverTimestamp(),
          statusHistory: arrayUnion({
            status: 'cancelled',
            timestamp: serverTimestamp(),
            note: reason
          })
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // USER METHODS
  // ============================================

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const docRef = doc(db, this.collections.users, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return { 
        id: docSnap.id, 
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date()
      };
      
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, this.collections.users),
        where('email', '==', email),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
      
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Create user profile
   */
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      const user = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'user',
        isActive: true,
        cart: [],
        wishlist: [],
        orders: [],
        addresses: [],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        }
      };
      
      await setDoc(userRef, user);
      
      return { 
        success: true,
        message: 'User profile created successfully'
      };
      
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters = {}) {
    try {
      let q = collection(db, this.collections.users);
      const constraints = [];
      
      if (filters.role) {
        constraints.push(where('role', '==', filters.role));
      }
      
      if (filters.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      q = query(q, ...constraints);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId, role) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      await updateDoc(userRef, { 
        role,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      await updateDoc(userRef, { 
        isActive: false,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // CART METHODS
  // ============================================

  /**
   * Add item to cart
   */
  async addToCart(userId, product) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
        addedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, {
        cart: arrayUnion(cartItem),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartQuantity(userId, productId, quantity) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userSnap.data();
        const cart = userData.cart || [];
        
        const updatedCart = cart.map(item => 
          item.productId === productId 
            ? { ...item, quantity }
            : item
        );
        
        transaction.update(userRef, { 
          cart: updatedCart,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove from cart
   */
  async removeFromCart(userId, productId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userSnap.data();
        const cart = userData.cart || [];
        
        const updatedCart = cart.filter(item => item.productId !== productId);
        
        transaction.update(userRef, { 
          cart: updatedCart,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cart
   */
  async clearCart(userId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      await updateDoc(userRef, { 
        cart: [],
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // WISHLIST METHODS
  // ============================================

  /**
   * Add to wishlist
   */
  async addToWishlist(userId, productId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      await updateDoc(userRef, { 
        wishlist: arrayUnion(productId),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove from wishlist
   */
  async removeFromWishlist(userId, productId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      await updateDoc(userRef, { 
        wishlist: arrayRemove(productId),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get wishlist with product details
   */
  async getWishlistWithDetails(userId) {
    try {
      const userSnap = await getDoc(doc(db, this.collections.users, userId));
      if (!userSnap.exists()) {
        return [];
      }
      
      const wishlistIds = userSnap.data().wishlist || [];
      if (wishlistIds.length === 0) {
        return [];
      }
      
      // Get product details for all wishlist items
      const products = await Promise.all(
        wishlistIds.map(id => this.getProduct(id))
      );
      
      return products.filter(p => p.success).map(p => p.product);
      
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  // ============================================
  // REVIEW METHODS
  // ============================================

  /**
   * Add review
   */
  async addReview(productId, reviewData) {
    try {
      const review = {
        ...reviewData,
        productId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        helpful: 0,
        verified: false
      };
      
      const reviewRef = await addDoc(collection(db, this.collections.reviews), review);
      
      // Update product rating
      await this.updateProductRating(productId);
      
      return { success: true, reviewId: reviewRef.id };
      
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId, limit = 10) {
    try {
      const q = query(
        collection(db, this.collections.reviews),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  /**
   * Update product rating based on reviews
   */
  async updateProductRating(productId) {
    try {
      const reviews = await this.getProductReviews(productId, 1000);
      
      if (reviews.length === 0) {
        return { success: true };
      }
      
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      const productRef = doc(db, this.collections.products, productId);
      await updateDoc(productRef, {
        rating: avgRating,
        reviewCount: reviews.length,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating product rating:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId) {
    try {
      const reviewRef = doc(db, this.collections.reviews, reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1)
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking review helpful:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // ADDRESS METHODS
  // ============================================

  /**
   * Add address
   */
  async addAddress(userId, addressData) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      const address = {
        ...addressData,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp()
      };
      
      await updateDoc(userRef, {
        addresses: arrayUnion(address),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, addressId: address.id };
      
    } catch (error) {
      console.error('Error adding address:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update address
   */
  async updateAddress(userId, addressId, addressData) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userSnap.data();
        const addresses = userData.addresses || [];
        
        const updatedAddresses = addresses.map(addr => 
          addr.id === addressId 
            ? { ...addr, ...addressData, updatedAt: serverTimestamp() }
            : addr
        );
        
        transaction.update(userRef, { 
          addresses: updatedAddresses,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(userId, addressId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userSnap.data();
        const addresses = userData.addresses || [];
        
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        
        transaction.update(userRef, { 
          addresses: updatedAddresses,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(userId, addressId) {
    try {
      const userRef = doc(db, this.collections.users, userId);
      
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        
        const userData = userSnap.data();
        const addresses = userData.addresses || [];
        
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }));
        
        transaction.update(userRef, { 
          addresses: updatedAddresses,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error setting default address:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // COUPON METHODS
  // ============================================

  /**
   * Validate coupon
   */
  async validateCoupon(code) {
    try {
      const q = query(
        collection(db, this.collections.coupons),
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { success: false, error: 'Invalid coupon code' };
      }
      
      const coupon = snapshot.docs[0].data();
      const now = new Date();
      
      if (coupon.validUntil && coupon.validUntil.toDate() < now) {
        return { success: false, error: 'Coupon has expired' };
      }
      
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { success: false, error: 'Coupon usage limit reached' };
      }
      
      return { 
        success: true, 
        coupon: {
          id: snapshot.docs[0].id,
          ...coupon
        }
      };
      
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply coupon
   */
  async applyCoupon(orderId, couponId) {
    try {
      const couponRef = doc(db, this.collections.coupons, couponId);
      
      await runTransaction(db, async (transaction) => {
        const couponSnap = await transaction.get(couponRef);
        if (!couponSnap.exists()) {
          throw new Error('Coupon not found');
        }
        
        transaction.update(couponRef, {
          usedCount: increment(1)
        });
        
        const orderRef = doc(db, this.collections.orders, orderId);
        transaction.update(orderRef, {
          couponId,
          updatedAt: serverTimestamp()
        });
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // SITE SETTINGS
  // ============================================

  /**
   * Get site settings
   */
  async getSiteSettings() {
    try {
      const docRef = doc(db, this.collections.settings, 'site');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const defaultSettings = {
          siteName: 'Madhav Prajapati Art',
          siteDescription: 'Luxury handcrafted clay diyas from Bagwali, Panchkula',
          logo: 'madhav-logo.svg',
          favicon: 'favicon.ico',
          primaryColor: '#D4AF37',
          secondaryColor: '#FF8C42',
          diwaliAnimation: false,
          backgroundMusic: false,
          bannerImage: 'https://m.media-amazon.com/images/I/71J8vH-tSaL._SL1500_.jpg',
          bannerText: 'Illuminate Your Space',
          bannerSubtext: 'Handcrafted clay diyas for every occasion',
          shippingCost: 50,
          freeShippingThreshold: 999,
          taxRate: 18,
          contactEmail: 'hello@madhavprajapati.art',
          contactPhone: '+91 98765 43210',
          address: 'Bagwali, Panchkula, Haryana 134113',
          socialMedia: {
            instagram: 'https://instagram.com/madhavprajapati.art',
            facebook: 'https://facebook.com/madhavprajapati.art',
            pinterest: 'https://pinterest.com/madhavprajapati.art',
            youtube: 'https://youtube.com/@madhavprajapati.art'
          },
          updatedAt: serverTimestamp()
        };
        
        await setDoc(docRef, defaultSettings);
        return defaultSettings;
      }
      
      return docSnap.data();
      
    } catch (error) {
      console.error('Error getting site settings:', error);
      return null;
    }
  }

  /**
   * Update site settings
   */
  async updateSiteSettings(settings) {
    try {
      const docRef = doc(db, this.collections.settings, 'site');
      await updateDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating site settings:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // NOTIFICATION METHODS
  // ============================================

  /**
   * Create notification
   */
  async createNotification(userId, notification) {
    try {
      const notif = {
        ...notification,
        userId,
        read: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, this.collections.notifications), notif);
      return { success: true };
      
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    try {
      let q = query(
        collection(db, this.collections.notifications),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    try {
      const notifRef = doc(db, this.collections.notifications, notificationId);
      await updateDoc(notifRef, { read: true });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(userId) {
    try {
      const notifications = await this.getUserNotifications(userId, true);
      
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        const ref = doc(db, this.collections.notifications, notif.id);
        batch.update(ref, { read: true });
      });
      
      await batch.commit();
      return { success: true };
      
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // REAL-TIME LISTENERS
  // ============================================

  /**
   * Listen to products
   */
  listenToProducts(callback, filters = {}) {
    let q = collection(db, this.collections.products);
    const constraints = [];
    
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    q = query(q, ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      callback(products);
    }, (error) => {
      console.error('Error in products listener:', error);
    });
    
    // Store listener for cleanup
    const listenerId = `products_${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return { unsubscribe, listenerId };
  }

  /**
   * Listen to orders
   */
  listenToOrders(callback, userId = null) {
    let q = collection(db, this.collections.orders);
    
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      callback(orders);
    }, (error) => {
      console.error('Error in orders listener:', error);
    });
    
    const listenerId = `orders_${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return { unsubscribe, listenerId };
  }

  /**
   * Listen to user cart
   */
  listenToUserCart(userId, callback) {
    const userRef = doc(db, this.collections.users, userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data().cart || []);
      }
    }, (error) => {
      console.error('Error in cart listener:', error);
    });
    
    const listenerId = `cart_${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return { unsubscribe, listenerId };
  }

  /**
   * Listen to single document
   */
  listenToDocument(collection, docId, callback) {
    const docRef = doc(db, collection, docId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in ${collection} listener:`, error);
    });
    
    const listenerId = `${collection}_${docId}_${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return { unsubscribe, listenerId };
  }

  /**
   * Remove listener
   */
  removeListener(listenerId) {
    if (this.listeners.has(listenerId)) {
      const unsubscribe = this.listeners.get(listenerId);
      unsubscribe();
      this.listeners.delete(listenerId);
      return true;
    }
    return false;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log('🧹 All Firestore listeners removed');
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  /**
   * Create batch write
   */
  createBatch() {
    return writeBatch(db);
  }

  /**
   * Execute batch
   */
  async commitBatch(batch) {
    try {
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error committing batch:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run transaction
   */
  async runTransaction(updateFunction) {
    try {
      const result = await runTransaction(db, updateFunction);
      return { success: true, result };
    } catch (error) {
      console.error('Error in transaction:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // STATISTICS METHODS
  // ============================================

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      const [products, orders, users] = await Promise.all([
        getDocs(collection(db, this.collections.products)),
        getDocs(collection(db, this.collections.orders)),
        getDocs(collection(db, this.collections.users))
      ]);
      
      const orderData = orders.docs.map(doc => doc.data());
      const totalRevenue = orderData.reduce((sum, order) => sum + (order.total || 0), 0);
      
      const lowStockProducts = products.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.stock < 10);
      
      return {
        productsCount: products.size,
        ordersCount: orders.size,
        totalRevenue,
        usersCount: users.size,
        lowStockProducts,
        lowStockCount: lowStockProducts.length,
        recentOrders: orderData.slice(0, 5)
      };
      
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get sales report
   */
  async getSalesReport(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collections.orders),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      return {
        orders,
        totalSales,
        totalOrders,
        averageOrderValue
      };
      
    } catch (error) {
      console.error('Error getting sales report:', error);
      throw error;
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const firestoreService = new FirestoreService();

// Export default for easy import
export default firestoreService;