import { cartService } from './cart.js';
import { orderService } from './orders.js';
import { authService } from './auth.js';
import { currencyFormatter } from './currency.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// CHECKOUT PAGE - Complete 3-Step Checkout Process
// ============================================
export class CheckoutPage {
  constructor(container) {
    this.container = container;
    this.currentStep = 1;
    this.orderData = {
      address: {
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      paymentMethod: '',
      shippingMethod: 'standard',
      billingSameAsShipping: true,
      billingAddress: {},
      notes: '',
      saveAddress: false
    };
    this.errors = {};
    this.isProcessing = false;
    this.init();
  }

  /**
   * Initialize checkout page
   */
  init() {
    // Check authentication
    if (!authService.isAuthenticated()) {
      window.location.hash = 'login?redirect=checkout';
      return;
    }
    
    // Check if cart is empty
    if (cartService.getItemCount() === 0) {
      window.location.hash = 'cart';
      return;
    }
    
    // Load saved addresses
    this.loadSavedAddresses();
    
    this.render();
    this.initEventListeners();
    this.initAnimations();
    
    console.log('✅ CheckoutPage initialized');
  }

  /**
   * Load saved addresses for user
   */
  async loadSavedAddresses() {
    try {
      if (authService.currentUser?.userData?.addresses) {
        this.savedAddresses = authService.currentUser.userData.addresses;
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      this.savedAddresses = [];
    }
  }

  /**
   * Render checkout page
   */
  render() {
    const cartSummary = cartService.getSummary();
    
    this.container.innerHTML = `
      <div class="checkout-page">
        <div class="checkout-header">
          <h1 class="page-title" data-i18n="checkout">Secure Checkout</h1>
          <p data-i18n="checkout_subtitle">Complete your purchase of handcrafted clay diyas</p>
          
          <!-- Checkout Steps -->
          <div class="checkout-steps">
            <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
              <span class="step-number">${this.currentStep > 1 ? '✓' : '1'}</span>
              <span class="step-label" data-i18n="shipping">Shipping</span>
            </div>
            <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
              <span class="step-number">${this.currentStep > 2 ? '✓' : '2'}</span>
              <span class="step-label" data-i18n="payment">Payment</span>
            </div>
            <div class="step ${this.currentStep >= 3 ? 'active' : ''}">
              <span class="step-number">3</span>
              <span class="step-label" data-i18n="review">Review</span>
            </div>
          </div>
        </div>
        
        <div class="checkout-layout">
          <!-- Main Checkout Form -->
          <div class="checkout-form-section">
            <div id="checkoutFormContainer">
              ${this.renderCurrentStep()}
            </div>
          </div>
          
          <!-- Order Summary Sidebar -->
          <div class="checkout-sidebar">
            <div class="order-summary">
              <h3 data-i18n="order_summary">Order Summary</h3>
              
              <div class="order-items">
                ${cartService.cart.map(item => this.renderOrderItem(item)).join('')}
              </div>
              
              <div class="summary-row">
                <span data-i18n="subtotal">Subtotal</span>
                <span>${currencyFormatter.format(cartSummary.subtotal)}</span>
              </div>
              
              <div class="summary-row">
                <span data-i18n="shipping">Shipping</span>
                <span id="shippingDisplay">${currencyFormatter.format(cartSummary.shipping)}</span>
              </div>
              
              ${cartSummary.discount > 0 ? `
                <div class="summary-row discount">
                  <span data-i18n="discount">Discount</span>
                  <span>-${currencyFormatter.format(cartSummary.discount)}</span>
                </div>
              ` : ''}
              
              <div class="summary-row">
                <span data-i18n="tax">Tax (18% GST)</span>
                <span id="taxDisplay">${currencyFormatter.format(cartSummary.tax)}</span>
              </div>
              
              <div class="summary-row total">
                <span data-i18n="total">Total</span>
                <span id="totalDisplay">${currencyFormatter.format(cartSummary.total)}</span>
              </div>
            </div>
            
            <div class="secure-badge">
              <i class="fas fa-lock"></i>
              <span data-i18n="secure_checkout">Secure 256-bit SSL encrypted checkout</span>
            </div>
            
            <div class="back-to-cart">
              <a href="#cart" data-nav>
                <i class="fas fa-arrow-left"></i>
                <span data-i18n="back_to_cart">Back to Cart</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Render order item
   */
  renderOrderItem(item) {
    return `
      <div class="order-item">
        <img src="${item.image || 'placeholder.jpg'}" alt="${this.escapeHtml(item.name)}" class="order-item-image" onerror="this.src='https://via.placeholder.com/60x60/F5E6CA/D4AF37?text=Diya'">
        <div class="order-item-details">
          <div class="order-item-name">${this.escapeHtml(item.name)}</div>
          <div class="order-item-price">${currencyFormatter.format(item.price)} × ${item.quantity}</div>
        </div>
        <div class="order-item-total">${currencyFormatter.format(item.price * item.quantity)}</div>
      </div>
    `;
  }

  /**
   * Render current step
   */
  renderCurrentStep() {
    switch(this.currentStep) {
      case 1: return this.renderShippingStep();
      case 2: return this.renderPaymentStep();
      case 3: return this.renderReviewStep();
      default: return '';
    }
  }

  /**
   * Render shipping step
   */
  renderShippingStep() {
    return `
      <div class="checkout-step fade-in">
        <h2><i class="fas fa-truck"></i> <span data-i18n="shipping_address">Shipping Address</span></h2>
        
        ${this.savedAddresses?.length > 0 ? `
          <div class="saved-addresses">
            <h3 data-i18n="saved_addresses">Saved Addresses</h3>
            <div class="address-grid">
              ${this.savedAddresses.map((addr, index) => `
                <div class="address-card" data-address-index="${index}">
                  <p><strong>${this.escapeHtml(addr.fullName)}</strong></p>
                  <p>${this.escapeHtml(addr.addressLine1)}</p>
                  <p>${this.escapeHtml(addr.city)}, ${this.escapeHtml(addr.state)} - ${addr.pincode}</p>
                  <p>📞 ${addr.phone}</p>
                  <button type="button" class="btn btn-outline btn-sm select-address" data-address-index="${index}">
                    <span data-i18n="select">Select</span>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <form id="shippingForm" class="address-form">
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label" data-i18n="full_name">Full Name *</label>
              <input type="text" class="form-control ${this.errors.fullName ? 'error' : ''}" 
                     id="fullName" value="${this.escapeHtml(this.orderData.address.fullName || authService.currentUser?.displayName || '')}" 
                     required maxlength="100">
              ${this.errors.fullName ? `<div class="error-message">${this.errors.fullName}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="phone">Phone Number *</label>
              <input type="tel" class="form-control ${this.errors.phone ? 'error' : ''}" 
                     id="phone" value="${this.escapeHtml(this.orderData.address.phone || '')}" 
                     required pattern="[0-9]{10}" maxlength="10" placeholder="9876543210">
              ${this.errors.phone ? `<div class="error-message">${this.errors.phone}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="email">Email *</label>
              <input type="email" class="form-control ${this.errors.email ? 'error' : ''}" 
                     id="email" value="${authService.currentUser?.email || ''}" 
                     required readonly>
            </div>
            
            <div class="form-group full-width">
              <label class="form-label" data-i18n="address_line1">Address Line 1 *</label>
              <input type="text" class="form-control ${this.errors.addressLine1 ? 'error' : ''}" 
                     id="addressLine1" value="${this.escapeHtml(this.orderData.address.addressLine1 || '')}" 
                     required placeholder="House/Flat No., Building, Street">
              ${this.errors.addressLine1 ? `<div class="error-message">${this.errors.addressLine1}</div>` : ''}
            </div>
            
            <div class="form-group full-width">
              <label class="form-label" data-i18n="address_line2">Address Line 2 (Optional)</label>
              <input type="text" class="form-control" id="addressLine2" 
                     value="${this.escapeHtml(this.orderData.address.addressLine2 || '')}" 
                     placeholder="Landmark, Area, Colony">
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="city">City *</label>
              <input type="text" class="form-control ${this.errors.city ? 'error' : ''}" 
                     id="city" value="${this.escapeHtml(this.orderData.address.city || '')}" required>
              ${this.errors.city ? `<div class="error-message">${this.errors.city}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="state">State *</label>
              <input type="text" class="form-control ${this.errors.state ? 'error' : ''}" 
                     id="state" value="${this.escapeHtml(this.orderData.address.state || '')}" required>
              ${this.errors.state ? `<div class="error-message">${this.errors.state}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="pincode">Pincode *</label>
              <input type="text" class="form-control ${this.errors.pincode ? 'error' : ''}" 
                     id="pincode" value="${this.escapeHtml(this.orderData.address.pincode || '')}" 
                     required pattern="[0-9]{6}" maxlength="6">
              ${this.errors.pincode ? `<div class="error-message">${this.errors.pincode}</div>` : ''}
            </div>
            
            <div class="form-group">
              <label class="form-label" data-i18n="country">Country</label>
              <select class="form-control" id="country">
                <option value="India" ${this.orderData.address.country === 'India' ? 'selected' : ''}>India</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <h3 data-i18n="shipping_method">Shipping Method</h3>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="shippingMethod" value="standard" 
                       ${this.orderData.shippingMethod === 'standard' ? 'checked' : ''}>
                <span>
                  <strong data-i18n="standard_shipping">Standard Shipping</strong>
                  <span class="shipping-desc">(5-7 business days) - ₹50</span>
                </span>
              </label>
              <label class="radio-label">
                <input type="radio" name="shippingMethod" value="express" 
                       ${this.orderData.shippingMethod === 'express' ? 'checked' : ''}>
                <span>
                  <strong data-i18n="express_shipping">Express Shipping</strong>
                  <span class="shipping-desc">(2-3 business days) - ₹100</span>
                </span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="saveAddress" ${this.orderData.saveAddress ? 'checked' : ''}>
              <span data-i18n="save_address">Save this address for future orders</span>
            </label>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="billingSame" ${this.orderData.billingSameAsShipping ? 'checked' : ''}>
              <span data-i18n="billing_same">Billing address same as shipping</span>
            </label>
          </div>
          
          <div id="billingAddress" style="display: ${this.orderData.billingSameAsShipping ? 'none' : 'block'};">
            <h3 data-i18n="billing_address">Billing Address</h3>
            <!-- Billing address fields (similar to shipping) -->
          </div>
          
          <div class="form-group">
            <label class="form-label" data-i18n="order_notes">Order Notes (Optional)</label>
            <textarea class="form-control" id="orderNotes" rows="3" 
                      placeholder="Special instructions for delivery">${this.escapeHtml(this.orderData.notes || '')}</textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" data-nav data-href="cart">
              <i class="fas fa-arrow-left"></i> <span data-i18n="back_to_cart">Back to Cart</span>
            </button>
            <button type="submit" class="btn btn-primary" id="continueToPayment">
              <i class="fas fa-arrow-right"></i> <span data-i18n="continue_to_payment">Continue to Payment</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Render payment step
   */
  renderPaymentStep() {
    return `
      <div class="checkout-step fade-in">
        <h2><i class="fas fa-credit-card"></i> <span data-i18n="payment_method">Payment Method</span></h2>
        
        <form id="paymentForm" class="payment-form">
          <div class="payment-methods">
            <label class="payment-method ${this.orderData.paymentMethod === 'cod' ? 'selected' : ''}">
              <input type="radio" name="paymentMethod" value="cod" ${this.orderData.paymentMethod === 'cod' ? 'checked' : ''}>
              <div class="payment-method-content">
                <i class="fas fa-money-bill-wave"></i>
                <div>
                  <h4 data-i18n="cash_on_delivery">Cash on Delivery</h4>
                  <p data-i18n="cod_desc">Pay when you receive your order</p>
                </div>
              </div>
            </label>
            
            <label class="payment-method ${this.orderData.paymentMethod === 'card' ? 'selected' : ''}">
              <input type="radio" name="paymentMethod" value="card" ${this.orderData.paymentMethod === 'card' ? 'checked' : ''}>
              <div class="payment-method-content">
                <i class="fas fa-credit-card"></i>
                <div>
                  <h4 data-i18n="card_payment">Credit/Debit Card</h4>
                  <p data-i18n="card_desc">Visa, Mastercard, RuPay, Amex</p>
                </div>
              </div>
            </label>
            
            <label class="payment-method ${this.orderData.paymentMethod === 'upi' ? 'selected' : ''}">
              <input type="radio" name="paymentMethod" value="upi" ${this.orderData.paymentMethod === 'upi' ? 'checked' : ''}>
              <div class="payment-method-content">
                <i class="fas fa-mobile-alt"></i>
                <div>
                  <h4 data-i18n="upi">UPI</h4>
                  <p data-i18n="upi_desc">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
            </label>
            
            <label class="payment-method ${this.orderData.paymentMethod === 'netbanking' ? 'selected' : ''}">
              <input type="radio" name="paymentMethod" value="netbanking" ${this.orderData.paymentMethod === 'netbanking' ? 'checked' : ''}>
              <div class="payment-method-content">
                <i class="fas fa-university"></i>
                <div>
                  <h4 data-i18n="net_banking">Net Banking</h4>
                  <p data-i18n="netbanking_desc">All major banks supported</p>
                </div>
              </div>
            </label>
          </div>
          
          <!-- Card Details (shown when card selected) -->
          <div id="cardDetails" class="payment-details" style="display: ${this.orderData.paymentMethod === 'card' ? 'block' : 'none'};">
            <h3 data-i18n="card_details">Card Details</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label" data-i18n="card_number">Card Number</label>
                <input type="text" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19">
              </div>
              <div class="form-group">
                <label class="form-label" data-i18n="expiry_date">Expiry Date</label>
                <input type="text" class="form-control" placeholder="MM/YY" maxlength="5">
              </div>
              <div class="form-group">
                <label class="form-label" data-i18n="cvv">CVV</label>
                <input type="password" class="form-control" placeholder="123" maxlength="3">
              </div>
              <div class="form-group full-width">
                <label class="form-label" data-i18n="card_name">Name on Card</label>
                <input type="text" class="form-control" placeholder="John Doe">
              </div>
            </div>
          </div>
          
          <!-- UPI Details -->
          <div id="upiDetails" class="payment-details" style="display: ${this.orderData.paymentMethod === 'upi' ? 'block' : 'none'};">
            <h3 data-i18n="upi_details">UPI Details</h3>
            <div class="form-group">
              <label class="form-label" data-i18n="upi_id">UPI ID</label>
              <input type="text" class="form-control" placeholder="username@okhdfcbank">
            </div>
            <p class="info-text" data-i18n="upi_info">You will be redirected to your UPI app to complete payment</p>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" id="backToShipping">
              <i class="fas fa-arrow-left"></i> <span data-i18n="back_to_shipping">Back to Shipping</span>
            </button>
            <button type="submit" class="btn btn-primary" id="reviewOrder">
              <i class="fas fa-check"></i> <span data-i18n="review_order">Review Order</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Render review step
   */
  renderReviewStep() {
    const subtotal = cartService.getSubtotal();
    const shipping = cartService.getShipping();
    const tax = cartService.getTax();
    const discount = cartService.getDiscount();
    const total = cartService.getTotal();
    
    return `
      <div class="checkout-step fade-in">
        <h2><i class="fas fa-clipboard-check"></i> <span data-i18n="review_order">Review Your Order</span></h2>
        
        <div class="review-sections">
          <div class="review-section">
            <div class="review-header">
              <h3 data-i18n="shipping_address">Shipping Address</h3>
              <button class="btn btn-link" id="editShipping">
                <i class="fas fa-edit"></i> <span data-i18n="edit">Edit</span>
              </button>
            </div>
            <div class="review-content">
              <p><strong>${this.escapeHtml(this.orderData.address.fullName)}</strong></p>
              <p>📞 ${this.orderData.address.phone}</p>
              <p>✉️ ${authService.currentUser?.email}</p>
              <p>📍 ${this.escapeHtml(this.orderData.address.addressLine1)}</p>
              ${this.orderData.address.addressLine2 ? `<p>${this.escapeHtml(this.orderData.address.addressLine2)}</p>` : ''}
              <p>${this.escapeHtml(this.orderData.address.city)}, ${this.escapeHtml(this.orderData.address.state)} - ${this.orderData.address.pincode}</p>
              <p>${this.orderData.address.country}</p>
            </div>
          </div>
          
          <div class="review-section">
            <div class="review-header">
              <h3 data-i18n="shipping_method">Shipping Method</h3>
              <button class="btn btn-link" id="editShippingMethod">
                <i class="fas fa-edit"></i> <span data-i18n="edit">Edit</span>
              </button>
            </div>
            <div class="review-content">
              <p><strong>${this.orderData.shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}</strong></p>
              <p>${this.orderData.shippingMethod === 'express' ? '2-3 business days' : '5-7 business days'}</p>
            </div>
          </div>
          
          <div class="review-section">
            <div class="review-header">
              <h3 data-i18n="payment_method">Payment Method</h3>
              <button class="btn btn-link" id="editPayment">
                <i class="fas fa-edit"></i> <span data-i18n="edit">Edit</span>
              </button>
            </div>
            <div class="review-content">
              <p><strong>${this.getPaymentMethodLabel(this.orderData.paymentMethod)}</strong></p>
            </div>
          </div>
          
          <div class="review-section">
            <h3 data-i18n="order_items">Order Items</h3>
            <div class="order-items-review">
              ${cartService.cart.map(item => `
                <div class="review-item">
                  <img src="${item.image || 'placeholder.jpg'}" alt="${this.escapeHtml(item.name)}" class="review-item-image">
                  <div class="review-item-details">
                    <p class="review-item-name">${this.escapeHtml(item.name)}</p>
                    <p class="review-item-price">${currencyFormatter.format(item.price)} × ${item.quantity}</p>
                  </div>
                  <p class="review-item-total">${currencyFormatter.format(item.price * item.quantity)}</p>
                </div>
              `).join('')}
            </div>
          </div>
          
          ${this.orderData.notes ? `
            <div class="review-section">
              <h3 data-i18n="order_notes">Order Notes</h3>
              <div class="review-content">
                <p>${this.escapeHtml(this.orderData.notes)}</p>
              </div>
            </div>
          ` : ''}
          
          <div class="review-total">
            <div class="summary-row">
              <span data-i18n="subtotal">Subtotal</span>
              <span>${currencyFormatter.format(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span data-i18n="shipping">Shipping</span>
              <span>${currencyFormatter.format(shipping)}</span>
            </div>
            ${discount > 0 ? `
              <div class="summary-row discount">
                <span data-i18n="discount">Discount</span>
                <span>-${currencyFormatter.format(discount)}</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span data-i18n="tax">Tax (18% GST)</span>
              <span>${currencyFormatter.format(tax)}</span>
            </div>
            <div class="summary-row total">
              <span data-i18n="total">Total</span>
              <span>${currencyFormatter.format(total)}</span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-outline" id="backToPayment">
            <i class="fas fa-arrow-left"></i> <span data-i18n="back">Back</span>
          </button>
          <button class="btn btn-primary btn-large" id="placeOrderBtn" ${this.isProcessing ? 'disabled' : ''}>
            ${this.isProcessing ? '<i class="fas fa-spinner fa-spin"></i> Processing...' : '<i class="fas fa-check-circle"></i> Place Order'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    if (this.currentStep === 1) {
      this.initShippingListeners();
    } else if (this.currentStep === 2) {
      this.initPaymentListeners();
    } else if (this.currentStep === 3) {
      this.initReviewListeners();
    }
    
    // Shipping method change listener
    document.querySelectorAll('input[name="shippingMethod"]')?.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.orderData.shippingMethod = e.target.value;
        this.updateShippingDisplay();
      });
    });
    
    // Billing address checkbox
    document.getElementById('billingSame')?.addEventListener('change', (e) => {
      this.orderData.billingSameAsShipping = e.target.checked;
      const billingDiv = document.getElementById('billingAddress');
      if (billingDiv) {
        billingDiv.style.display = e.target.checked ? 'none' : 'block';
      }
    });
  }

  /**
   * Initialize shipping step listeners
   */
  initShippingListeners() {
    // Select saved address
    document.querySelectorAll('.select-address').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.addressIndex;
        this.selectSavedAddress(index);
      });
    });
    
    const form = document.getElementById('shippingForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateAndProceedToPayment();
    });
  }

  /**
   * Initialize payment step listeners
   */
  initPaymentListeners() {
    // Payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.orderData.paymentMethod = e.target.value;
        this.updatePaymentDetails(e.target.value);
      });
    });
    
    const form = document.getElementById('paymentForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.proceedToReview();
    });
    
    const backBtn = document.getElementById('backToShipping');
    backBtn?.addEventListener('click', () => {
      this.goToStep(1);
    });
  }

  /**
   * Initialize review step listeners
   */
  initReviewListeners() {
    document.getElementById('editShipping')?.addEventListener('click', () => {
      this.goToStep(1);
    });
    
    document.getElementById('editShippingMethod')?.addEventListener('click', () => {
      this.goToStep(1);
    });
    
    document.getElementById('editPayment')?.addEventListener('click', () => {
      this.goToStep(2);
    });
    
    document.getElementById('backToPayment')?.addEventListener('click', () => {
      this.goToStep(2);
    });
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn?.addEventListener('click', async () => {
      await this.placeOrder();
    });
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Select saved address
   */
  selectSavedAddress(index) {
    const address = this.savedAddresses[index];
    if (address) {
      this.orderData.address = { ...address };
      
      // Update form fields
      document.getElementById('fullName').value = address.fullName || '';
      document.getElementById('phone').value = address.phone || '';
      document.getElementById('addressLine1').value = address.addressLine1 || '';
      document.getElementById('addressLine2').value = address.addressLine2 || '';
      document.getElementById('city').value = address.city || '';
      document.getElementById('state').value = address.state || '';
      document.getElementById('pincode').value = address.pincode || '';
      
      this.showNotification('Address selected', 'success');
    }
  }

  /**
   * Validate shipping form and proceed to payment
   */
  validateAndProceedToPayment() {
    this.errors = {};
    
    // Get form values
    const formData = {
      fullName: document.getElementById('fullName')?.value?.trim(),
      phone: document.getElementById('phone')?.value?.trim(),
      addressLine1: document.getElementById('addressLine1')?.value?.trim(),
      addressLine2: document.getElementById('addressLine2')?.value?.trim(),
      city: document.getElementById('city')?.value?.trim(),
      state: document.getElementById('state')?.value?.trim(),
      pincode: document.getElementById('pincode')?.value?.trim(),
      country: document.getElementById('country')?.value
    };
    
    const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked')?.value;
    const saveAddress = document.getElementById('saveAddress')?.checked;
    const billingSame = document.getElementById('billingSame')?.checked;
    const notes = document.getElementById('orderNotes')?.value?.trim();
    
    // Validate
    if (!formData.fullName) this.errors.fullName = 'Full name is required';
    if (!formData.phone) {
      this.errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      this.errors.phone = 'Enter a valid 10-digit phone number';
    }
    if (!formData.addressLine1) this.errors.addressLine1 = 'Address is required';
    if (!formData.city) this.errors.city = 'City is required';
    if (!formData.state) this.errors.state = 'State is required';
    if (!formData.pincode) {
      this.errors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      this.errors.pincode = 'Enter a valid 6-digit pincode';
    }
    
    if (Object.keys(this.errors).length > 0) {
      this.render();
      this.initEventListeners();
      this.showNotification('Please fix the errors in the form', 'error');
      return;
    }
    
    // Save order data
    this.orderData.address = formData;
    this.orderData.shippingMethod = shippingMethod;
    this.orderData.saveAddress = saveAddress;
    this.orderData.billingSameAsShipping = billingSame;
    this.orderData.notes = notes;
    
    // Go to payment step
    this.goToStep(2);
  }

  /**
   * Proceed to review step
   */
  proceedToReview() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    
    if (!paymentMethod) {
      this.showNotification('Please select a payment method', 'error');
      return;
    }
    
    this.orderData.paymentMethod = paymentMethod;
    this.goToStep(3);
  }

  /**
   * Place order
   */
  async placeOrder() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    try {
      const result = await orderService.createOrder(this.orderData);
      
      if (result.success) {
        this.showOrderSuccess(result.orderId);
      } else {
        this.showNotification(result.error || 'Failed to place order', 'error');
        this.isProcessing = false;
        if (placeOrderBtn) {
          placeOrderBtn.disabled = false;
          placeOrderBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      this.showNotification('An error occurred. Please try again.', 'error');
      this.isProcessing = false;
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
      }
    }
  }

  /**
   * Show order success page
   */
  showOrderSuccess(orderId) {
    this.container.innerHTML = `
      <div class="order-success fade-in">
        <i class="fas fa-check-circle"></i>
        <h2 data-i18n="order_placed">Order Placed Successfully!</h2>
        <p data-i18n="thank_you">Thank you for your purchase!</p>
        <div class="order-number">#${orderId.slice(-8).toUpperCase()}</div>
        <p data-i18n="order_confirmation">We've sent a confirmation email to ${authService.currentUser?.email}</p>
        <p data-i18n="tracking_info">You can track your order in the My Orders section.</p>
        <div class="success-actions">
          <button class="btn btn-primary" data-nav data-href="products">
            <i class="fas fa-shopping-bag"></i> <span data-i18n="continue_shopping">Continue Shopping</span>
          </button>
          <button class="btn btn-outline" data-nav data-href="orders">
            <i class="fas fa-box"></i> <span data-i18n="view_orders">View Orders</span>
          </button>
        </div>
      </div>
    `;
    i18n.updatePageContent();
  }

  /**
   * Update shipping display in sidebar
   */
  updateShippingDisplay() {
    const cartSummary = cartService.getSummary();
    document.getElementById('shippingDisplay').textContent = currencyFormatter.format(cartSummary.shipping);
    document.getElementById('taxDisplay').textContent = currencyFormatter.format(cartSummary.tax);
    document.getElementById('totalDisplay').textContent = currencyFormatter.format(cartSummary.total);
  }

  /**
   * Update payment details visibility
   */
  updatePaymentDetails(method) {
    document.getElementById('cardDetails').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('upiDetails').style.display = method === 'upi' ? 'block' : 'none';
    
    // Update selected class
    document.querySelectorAll('.payment-method').forEach(el => {
      el.classList.remove('selected');
      if (el.querySelector(`input[value="${method}"]`)) {
        el.classList.add('selected');
      }
    });
  }

  /**
   * Go to specific step
   */
  goToStep(step) {
    this.currentStep = step;
    this.render();
    this.initEventListeners();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
   * Get payment method label
   */
  getPaymentMethodLabel(method) {
    const labels = {
      cod: 'Cash on Delivery',
      card: 'Credit/Debit Card',
      upi: 'UPI',
      netbanking: 'Net Banking'
    };
    return labels[method] || method;
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
    console.log('🧹 CheckoutPage destroyed');
  }
}