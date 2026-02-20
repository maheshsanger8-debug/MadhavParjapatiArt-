import { firestoreService } from './firestore.js';
import { authService } from './auth.js';
import { cartService } from './cart.js';
import { currencyFormatter } from './currency.js';
import { i18n } from './i18n.js';

// ============================================
// ORDER SERVICE - Complete Order Management
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class OrderService {
  constructor() {
    this.taxRate = 0.18; // 18% GST
    this.shippingRates = {
      standard: 50,
      express: 100,
      free: 0
    };
    this.freeShippingThreshold = 999;
    this.listeners = [];
    this.orders = [];
  }

  /**
   * Create new order
   */
  async createOrder(orderData) {
    try {
      // Validate user authentication
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to place an order');
      }

      // Validate order data
      const validation = this.validateOrder(orderData);
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.errors.join('. '),
          errors: validation.errors
        };
      }

      // Calculate order totals
      const subtotal = cartService.getCartTotal();
      const shipping = this.calculateShipping(subtotal, orderData.shippingMethod);
      const tax = this.calculateTax(subtotal);
      const discount = cartService.getDiscount?.() || 0;
      const total = subtotal + shipping + tax - discount;

      // Validate cart is not empty
      if (subtotal <= 0 || cartService.cart.length === 0) {
        throw new Error('Cannot place order with empty cart');
      }

      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Prepare order object
      const order = {
        orderNumber,
        userId: authService.currentUser.uid,
        userEmail: authService.currentUser.email,
        userDisplayName: authService.currentUser.displayName || '',
        items: cartService.cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          image: item.image || ''
        })),
        subtotal,
        shipping,
        tax,
        discount,
        total,
        shippingAddress: {
          fullName: orderData.address.fullName?.trim(),
          phone: orderData.address.phone?.trim(),
          email: orderData.address.email || authService.currentUser.email,
          addressLine1: orderData.address.addressLine1?.trim(),
          addressLine2: orderData.address.addressLine2?.trim() || '',
          city: orderData.address.city?.trim(),
          state: orderData.address.state?.trim(),
          pincode: orderData.address.pincode?.trim(),
          country: orderData.address.country || 'India'
        },
        billingAddress: orderData.billingAddress || orderData.address,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed successfully'
        }],
        shippingMethod: orderData.shippingMethod || 'standard',
        estimatedDelivery: this.calculateDeliveryDate(orderData.shippingMethod),
        notes: orderData.notes || '',
        couponCode: orderData.couponCode || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create order in Firestore
      const result = await firestoreService.createOrder(order);

      if (result.success) {
        // Clear cart after successful order
        await cartService.clearCart();
        
        // Add to local orders list
        this.orders.unshift({ id: result.orderId, ...order });
        
        // Notify listeners
        this.notifyListeners('orderCreated', { orderId: result.orderId, order });
        
        // Log analytics event
        this.logOrderEvent('purchase', order);
        
        return { 
          success: true, 
          orderId: result.orderId,
          orderNumber,
          order,
          message: 'Order placed successfully!'
        };
      }
      
      return result;

    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create order',
        errors: [error.message]
      };
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(status = null) {
    try {
      if (!authService.isAuthenticated()) {
        return [];
      }

      const filters = { userId: authService.currentUser.uid };
      if (status) {
        filters.status = status;
      }

      const orders = await firestoreService.getOrders(filters);
      this.orders = orders;
      return orders;

    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const result = await firestoreService.getOrder(orderId);
      
      if (!result.success) {
        return null;
      }

      // Verify ownership (unless admin)
      if (result.order.userId !== authService.currentUser?.uid && 
          !(await authService.isAdmin())) {
        throw new Error('Unauthorized access to order');
      }

      return result.order;

    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason = '') {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      const result = await firestoreService.cancelOrder(orderId, reason);

      if (result.success) {
        this.notifyListeners('orderCancelled', { orderId, reason });
        
        // Refund if payment was made
        if (order.paymentStatus === 'completed') {
          await this.processRefund(orderId);
        }
      }

      return result;

    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process refund
   */
  async processRefund(orderId) {
    try {
      // Implement refund logic here
      // This would integrate with payment gateway
      
      await firestoreService.updatePaymentStatus(orderId, 'refunded', {
        refundedAt: new Date(),
        refundMethod: 'original'
      });

      return { success: true };

    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track order
   */
  async trackOrder(orderNumber) {
    try {
      const orders = await firestoreService.getOrders({ orderNumber });
      return orders[0] || null;

    } catch (error) {
      console.error('Error tracking order:', error);
      return null;
    }
  }

  /**
   * Calculate delivery date
   */
  calculateDeliveryDate(shippingMethod, orderDate = new Date()) {
    const date = new Date(orderDate);
    const deliveryDays = shippingMethod === 'express' ? 2 : 5;
    
    // Add delivery days
    date.setDate(date.getDate() + deliveryDays);
    
    // Skip Sundays (if Sunday, add one day)
    if (date.getDay() === 0) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  /**
   * Calculate shipping cost
   */
  calculateShipping(subtotal, method = 'standard') {
    if (subtotal >= this.freeShippingThreshold) {
      return this.shippingRates.free;
    }
    return this.shippingRates[method] || this.shippingRates.standard;
  }

  /**
   * Calculate tax
   */
  calculateTax(subtotal) {
    return subtotal * this.taxRate;
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = 'MP';
    
    // Check if order number already exists
    let orderNumber;
    let exists = true;
    
    while (exists) {
      orderNumber = `${prefix}${timestamp}${random}`;
      const existing = await this.trackOrder(orderNumber);
      exists = !!existing;
    }
    
    return orderNumber;
  }

  /**
   * Validate order data
   */
  validateOrder(orderData) {
    const errors = [];

    // Address validation
    if (!orderData.address) {
      errors.push('Shipping address is required');
    } else {
      if (!orderData.address.fullName?.trim()) {
        errors.push('Full name is required');
      }
      
      const phone = orderData.address.phone?.replace(/\D/g, '');
      if (!phone || !/^[0-9]{10}$/.test(phone)) {
        errors.push('Valid 10-digit phone number is required');
      }
      
      if (!orderData.address.addressLine1?.trim()) {
        errors.push('Address line 1 is required');
      }
      
      if (!orderData.address.city?.trim()) {
        errors.push('City is required');
      }
      
      if (!orderData.address.state?.trim()) {
        errors.push('State is required');
      }
      
      const pincode = orderData.address.pincode?.replace(/\D/g, '');
      if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
        errors.push('Valid 6-digit pincode is required');
      }
    }

    // Payment method validation
    if (!orderData.paymentMethod) {
      errors.push('Payment method is required');
    } else if (!['cod', 'card', 'upi', 'netbanking'].includes(orderData.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    // Shipping method validation
    if (orderData.shippingMethod && !['standard', 'express'].includes(orderData.shippingMethod)) {
      errors.push('Invalid shipping method');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format order for display
   */
  formatOrder(order) {
    return {
      ...order,
      formattedSubtotal: currencyFormatter.format(order.subtotal),
      formattedShipping: currencyFormatter.format(order.shipping),
      formattedTax: currencyFormatter.format(order.tax),
      formattedDiscount: order.discount ? currencyFormatter.format(order.discount) : null,
      formattedTotal: currencyFormatter.format(order.total),
      formattedDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      estimatedDeliveryDate: order.estimatedDelivery?.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  }

  /**
   * Get order status badge
   */
  getStatusBadge(status) {
    const badges = {
      pending: { class: 'badge-warning', icon: '⏳', text: 'Pending' },
      confirmed: { class: 'badge-info', icon: '✅', text: 'Confirmed' },
      processing: { class: 'badge-info', icon: '⚙️', text: 'Processing' },
      shipped: { class: 'badge-primary', icon: '📦', text: 'Shipped' },
      delivered: { class: 'badge-success', icon: '🏠', text: 'Delivered' },
      cancelled: { class: 'badge-danger', icon: '❌', text: 'Cancelled' },
      refunded: { class: 'badge-secondary', icon: '💰', text: 'Refunded' }
    };
    
    return badges[status] || badges.pending;
  }

  /**
   * Get payment status badge
   */
  getPaymentStatusBadge(status) {
    const badges = {
      pending: { class: 'badge-warning', icon: '⏳', text: 'Payment Pending' },
      completed: { class: 'badge-success', icon: '✅', text: 'Paid' },
      failed: { class: 'badge-danger', icon: '❌', text: 'Payment Failed' },
      refunded: { class: 'badge-secondary', icon: '💰', text: 'Refunded' }
    };
    
    return badges[status] || badges.pending;
  }

  /**
   * Log order event (analytics)
   */
  logOrderEvent(event, order) {
    const eventDetail = {
      orderId: order.orderId || order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      items: order.items?.length,
      paymentMethod: order.paymentMethod
    };

    window.dispatchEvent(new CustomEvent(event, {
      detail: eventDetail
    }));

    // Google Analytics integration (if available)
    if (window.gtag) {
      window.gtag('event', event, eventDetail);
    }
  }

  /**
   * Subscribe to order changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      listener({ type, data, orders: this.orders });
    });
  }

  /**
   * Get order summary statistics
   */
  getOrderStats(orders) {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0,
      averageOrderValue: 0
    };

    orders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      stats.totalSpent += order.total || 0;
    });

    stats.averageOrderValue = stats.total > 0 ? stats.totalSpent / stats.total : 0;

    return stats;
  }

  /**
   * Check if order can be cancelled
   */
  canCancel(order) {
    return ['pending', 'confirmed'].includes(order.status);
  }

  /**
   * Check if order can be returned
   */
  canReturn(order) {
    if (order.status !== 'delivered') return false;
    
    const deliveryDate = new Date(order.updatedAt);
    const today = new Date();
    const daysSinceDelivery = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= 7; // 7-day return policy
  }

  /**
   * Get estimated delivery range
   */
  getDeliveryRange(shippingMethod) {
    if (shippingMethod === 'express') {
      return '2-3 business days';
    }
    return '5-7 business days';
  }

  /**
   * Clean up
   */
  destroy() {
    this.listeners = [];
    this.orders = [];
    console.log('🧹 OrderService destroyed');
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const orderService = new OrderService();

// Export default for easy import
export default orderService;