import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// CONTACT PAGE - Complete Contact Form with Validation
// CORRECT ADDRESS: Bagwali, Panchkula, Haryana
// ============================================
export class ContactPage {
  constructor(container) {
    this.container = container;
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: '',
      newsletter: false
    };
    this.errors = {};
    this.isSubmitting = false;
    this.init();
  }

  /**
   * Initialize contact page
   */
  init() {
    this.render();
    this.initEventListeners();
    this.initAnimations();
    console.log('✅ ContactPage initialized with Bagwali, Panchkula address');
  }

  /**
   * Render contact page
   */
  render() {
    this.container.innerHTML = `
      <div class="contact-page">
        <div class="contact-header">
          <h1 class="page-title" data-i18n="get_in_touch">Get in Touch</h1>
          <p class="page-subtitle" data-i18n="love_to_hear">We'd love to hear from you</p>
        </div>
        
        <!-- Contact Info Cards -->
        <div class="contact-info-grid">
          <!-- Visit Us Card - CORRECT ADDRESS: Bagwali, Panchkula -->
          <div class="contact-card glass-effect" data-animate="fadeInUp" data-delay="0">
            <div class="contact-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h3 data-i18n="visit_us">Visit Us</h3>
            <p>Madhav Prajapati Art Studio</p>
            <p><strong>Bagwali, Panchkula</strong></p>
            <p>Haryana 134113</p>
            <a href="https://maps.google.com/?q=Bagwali,Panchkula,Haryana" target="_blank" class="btn-link">
              <span data-i18n="get_directions">Get Directions</span> <i class="fas fa-arrow-right"></i>
            </a>
          </div>
          
          <!-- Call Us Card -->
          <div class="contact-card glass-effect" data-animate="fadeInUp" data-delay="100">
            <div class="contact-icon">
              <i class="fas fa-phone-alt"></i>
            </div>
            <h3 data-i18n="call_us">Call Us</h3>
            <p data-i18n="hours">Mon-Sat, 10am-7pm (IST)</p>
            <p class="contact-phone">+91 98765 43210</p>
            <div class="contact-actions">
              <a href="tel:+919876543210" class="btn btn-outline btn-sm">
                <i class="fas fa-phone"></i> <span data-i18n="call_now">Call Now</span>
              </a>
              <a href="https://wa.me/919876543210" class="btn btn-outline btn-sm whatsapp-btn" target="_blank">
                <i class="fab fa-whatsapp"></i> <span data-i18n="whatsapp">WhatsApp</span>
              </a>
            </div>
          </div>
          
          <!-- Email Us Card -->
          <div class="contact-card glass-effect" data-animate="fadeInUp" data-delay="200">
            <div class="contact-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <h3 data-i18n="email_us">Email Us</h3>
            <p data-i18n="general_inquiries">General Inquiries</p>
            <p class="contact-email">
              <a href="mailto:hello@madhavprajapati.art">hello@madhavprajapati.art</a>
            </p>
            <p data-i18n="custom_orders">Custom Orders</p>
            <p class="contact-email">
              <a href="mailto:custom@madhavprajapati.art">custom@madhavprajapati.art</a>
            </p>
          </div>
          
          <!-- Business Hours Card -->
          <div class="contact-card glass-effect" data-animate="fadeInUp" data-delay="300">
            <div class="contact-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3 data-i18n="business_hours">Business Hours (IST)</h3>
            <div class="hours-list">
              <div class="hour-row">
                <span data-i18n="mon_fri">Monday - Friday</span>
                <span>10:00 AM - 7:00 PM</span>
              </div>
              <div class="hour-row">
                <span data-i18n="sat">Saturday</span>
                <span>11:00 AM - 5:00 PM</span>
              </div>
              <div class="hour-row closed">
                <span data-i18n="sun">Sunday</span>
                <span data-i18n="closed">Closed</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Contact Form & Map Section -->
        <div class="contact-form-wrapper">
          <div class="contact-form-section glass-effect" data-animate="fadeInLeft" data-delay="400">
            <h2 data-i18n="send_message">Send us a Message</h2>
            <p class="form-description" data-i18n="form_description">
              Have a question or want to work together? Fill out the form below and we'll get back to you within 24 hours. Our studio is located in <strong>Bagwali, Panchkula</strong>.
            </p>
            
            <form id="contactForm" class="contact-form" novalidate>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="contactName">
                    <i class="fas fa-user"></i> <span data-i18n="your_name">Your Name *</span>
                  </label>
                  <input 
                    type="text" 
                    class="form-input ${this.errors.name ? 'error' : ''}" 
                    id="contactName" 
                    value="${this.escapeHtml(this.formData.name)}"
                    required 
                    maxlength="100"
                    placeholder="John Doe"
                  >
                  ${this.errors.name ? `<div class="error-message">${this.errors.name}</div>` : ''}
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="contactEmail">
                    <i class="fas fa-envelope"></i> <span data-i18n="email">Email *</span>
                  </label>
                  <input 
                    type="email" 
                    class="form-input ${this.errors.email ? 'error' : ''}" 
                    id="contactEmail" 
                    value="${this.escapeHtml(this.formData.email)}"
                    required 
                    maxlength="100"
                    placeholder="john@example.com"
                  >
                  ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="contactSubject">
                  <i class="fas fa-tag"></i> <span data-i18n="subject">Subject *</span>
                </label>
                <select class="form-input" id="contactSubject" required>
                  <option value="" disabled selected data-i18n="select_subject">Select a subject</option>
                  <option value="general" ${this.formData.subject === 'general' ? 'selected' : ''} data-i18n="general_inquiry">General Inquiry</option>
                  <option value="custom" ${this.formData.subject === 'custom' ? 'selected' : ''} data-i18n="custom_order">Custom Order</option>
                  <option value="support" ${this.formData.subject === 'support' ? 'selected' : ''} data-i18n="support">Support</option>
                  <option value="feedback" ${this.formData.subject === 'feedback' ? 'selected' : ''} data-i18n="feedback">Feedback</option>
                  <option value="collaboration" ${this.formData.subject === 'collaboration' ? 'selected' : ''} data-i18n="collaboration">Collaboration</option>
                  <option value="other" ${this.formData.subject === 'other' ? 'selected' : ''} data-i18n="other">Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label" for="contactMessage">
                  <i class="fas fa-comment"></i> <span data-i18n="message">Message *</span>
                </label>
                <textarea 
                  class="form-input ${this.errors.message ? 'error' : ''}" 
                  id="contactMessage" 
                  rows="5" 
                  required
                  placeholder="Tell us about your inquiry..."
                  maxlength="2000"
                >${this.escapeHtml(this.formData.message)}</textarea>
                <div class="character-count">
                  <span id="messageCount">${this.formData.message.length || 0}</span>/2000
                </div>
                ${this.errors.message ? `<div class="error-message">${this.errors.message}</div>` : ''}
              </div>
              
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="contactNewsletter" ${this.formData.newsletter ? 'checked' : ''}>
                  <span data-i18n="subscribe_newsletter">Subscribe to our newsletter for updates and offers</span>
                </label>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-large" id="submitBtn" ${this.isSubmitting ? 'disabled' : ''}>
                  ${this.isSubmitting 
                    ? '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="sending">Sending...</span>' 
                    : '<i class="fas fa-paper-plane"></i> <span data-i18n="send_message_btn">Send Message</span>'}
                </button>
                <button type="button" class="btn btn-outline" id="resetBtn">
                  <i class="fas fa-undo"></i> <span data-i18n="reset">Reset</span>
                </button>
              </div>
            </form>
          </div>
          
          <!-- Map Section - Panchkula, Haryana -->
          <div class="map-section glass-effect" data-animate="fadeInRight" data-delay="500">
            <h2 data-i18n="find_us">Find Us in Bagwali, Panchkula</h2>
            <div class="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54848.54848!2d76.848!3d30.694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f93d5a0b12345%3A0x1234567890abcdef!2sPanchkula%2C%20Haryana!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin" 
                width="100%" 
                height="350" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy"
                title="Madhav Prajapati Art Location in Bagwali, Panchkula"
              ></iframe>
            </div>
            <div class="map-actions">
              <a href="https://maps.google.com/?q=Bagwali,Panchkula,Haryana" target="_blank" class="btn btn-outline btn-sm">
                <i class="fas fa-directions"></i> <span data-i18n="get_directions">Get Directions to Bagwali</span>
              </a>
              <a href="https://maps.google.com/?q=30.694,76.848" target="_blank" class="btn btn-outline btn-sm">
                <i class="fas fa-map-pin"></i> <span data-i18n="view_larger_map">View Panchkula Map</span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- FAQ Section -->
        <div class="faq-section glass-effect" data-animate="fadeInUp" data-delay="600">
          <h2 data-i18n="frequently_asked">Frequently Asked Questions</h2>
          <div class="faq-grid">
            <div class="faq-item">
              <h3 data-i18n="faq_response_time">How quickly do you respond?</h3>
              <p data-i18n="faq_response_answer">We typically respond to all inquiries within 24 hours during business days from our Bagwali, Panchkula studio.</p>
            </div>
            <div class="faq-item">
              <h3 data-i18n="faq_custom_orders">Do you accept custom orders?</h3>
              <p data-i18n="faq_custom_answer">Yes! We love creating custom diyas for weddings, festivals, and special occasions. Visit us in Bagwali to discuss your ideas.</p>
            </div>
            <div class="faq-item">
              <h3 data-i18n="faq_visit">Can I visit your studio?</h3>
              <p data-i18n="faq_visit_answer">Absolutely! We welcome visitors by appointment at our Bagwali, Panchkula studio. Please contact us to schedule a visit.</p>
            </div>
            <div class="faq-item">
              <h3 data-i18n="faq_shipping">Do you ship internationally?</h3>
              <p data-i18n="faq_shipping_answer">Yes, we ship worldwide from Bagwali, Panchkula. Shipping costs and delivery times vary by location.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectSelect = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const newsletterCheck = document.getElementById('contactNewsletter');
    const resetBtn = document.getElementById('resetBtn');
    
    // Real-time validation
    nameInput?.addEventListener('input', (e) => {
      this.formData.name = e.target.value;
      this.validateField('name');
    });
    
    emailInput?.addEventListener('input', (e) => {
      this.formData.email = e.target.value;
      this.validateField('email');
    });
    
    subjectSelect?.addEventListener('change', (e) => {
      this.formData.subject = e.target.value;
    });
    
    messageInput?.addEventListener('input', (e) => {
      this.formData.message = e.target.value;
      this.validateField('message');
      this.updateCharacterCount();
    });
    
    newsletterCheck?.addEventListener('change', (e) => {
      this.formData.newsletter = e.target.checked;
    });
    
    // Form submission
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Reset button
    resetBtn?.addEventListener('click', () => {
      this.resetForm();
    });
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Validate form field
   */
  validateField(field) {
    switch(field) {
      case 'name':
        if (!this.formData.name || this.formData.name.length < 2) {
          this.errors.name = 'Name must be at least 2 characters';
        } else if (this.formData.name.length > 100) {
          this.errors.name = 'Name cannot exceed 100 characters';
        } else {
          delete this.errors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.formData.email) {
          this.errors.email = 'Email is required';
        } else if (!emailRegex.test(this.formData.email)) {
          this.errors.email = 'Please enter a valid email address';
        } else {
          delete this.errors.email;
        }
        break;
        
      case 'message':
        if (!this.formData.message || this.formData.message.length < 10) {
          this.errors.message = 'Message must be at least 10 characters';
        } else if (this.formData.message.length > 2000) {
          this.errors.message = 'Message cannot exceed 2000 characters';
        } else {
          delete this.errors.message;
        }
        break;
    }
    
    // Update UI
    this.updateFieldError(field);
  }

  /**
   * Update field error UI
   */
  updateFieldError(field) {
    const input = document.getElementById(`contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
    const errorDiv = input?.parentNode?.querySelector('.error-message');
    
    if (input) {
      if (this.errors[field]) {
        input.classList.add('error');
        if (!errorDiv) {
          const div = document.createElement('div');
          div.className = 'error-message';
          div.textContent = this.errors[field];
          input.parentNode.appendChild(div);
        } else {
          errorDiv.textContent = this.errors[field];
        }
      } else {
        input.classList.remove('error');
        if (errorDiv) {
          errorDiv.remove();
        }
      }
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    this.validateField('name');
    this.validateField('email');
    this.validateField('message');
    
    if (!this.formData.subject) {
      this.errors.subject = 'Please select a subject';
      const subjectSelect = document.getElementById('contactSubject');
      subjectSelect?.classList.add('error');
      
      // Add error message
      const parent = subjectSelect?.parentNode;
      if (parent && !parent.querySelector('.error-message')) {
        const div = document.createElement('div');
        div.className = 'error-message';
        div.textContent = this.errors.subject;
        parent.appendChild(div);
      }
    } else {
      delete this.errors.subject;
      const subjectSelect = document.getElementById('contactSubject');
      subjectSelect?.classList.remove('error');
      const errorDiv = subjectSelect?.parentNode?.querySelector('.error-message');
      if (errorDiv) errorDiv.remove();
    }
    
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (this.isSubmitting) return;
    
    // Get latest values
    this.formData = {
      name: document.getElementById('contactName')?.value || '',
      email: document.getElementById('contactEmail')?.value || '',
      subject: document.getElementById('contactSubject')?.value || '',
      message: document.getElementById('contactMessage')?.value || '',
      newsletter: document.getElementById('contactNewsletter')?.checked || false
    };
    
    if (!this.validateForm()) {
      this.showNotification('Please fix the errors in the form', 'error');
      return;
    }
    
    this.isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="sending">Sending...</span>';
    }
    
    try {
      // Simulate API call (replace with actual API)
      await this.sendContactForm(this.formData);
      
      // Show success message
      this.showSuccessMessage();
      
      // Log for debugging
      console.log('Contact form submitted from Bagwali, Panchkula:', this.formData);
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.showNotification('Failed to send message. Please try again.', 'error');
      
      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span data-i18n="send_message_btn">Send Message</span>';
      }
      
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Send contact form (simulated)
   */
  async sendContactForm(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would actually send the data to your backend
    // For now, we'll just return success
    return { success: true };
  }

  /**
   * Show success message
   */
  showSuccessMessage() {
    const formSection = document.querySelector('.contact-form-section');
    if (!formSection) return;
    
    formSection.innerHTML = `
      <div class="success-message">
        <i class="fas fa-check-circle"></i>
        <h2 data-i18n="thank_you">Thank You from Bagwali!</h2>
        <p data-i18n="message_sent">Your message has been sent successfully to our studio in Bagwali, Panchkula.</p>
        <p data-i18n="response_time">We'll get back to you within 24 hours.</p>
        <div class="success-details">
          <p><strong data-i18n="reference">Reference:</strong> #${this.generateReference()}</p>
          <p><strong data-i18n="email">Email:</strong> ${this.formData.email}</p>
        </div>
        <button class="btn btn-primary" id="sendAnotherBtn" data-i18n="send_another">
          <i class="fas fa-plus"></i> Send Another Message
        </button>
      </div>
    `;
    
    i18n.updatePageContent();
    
    // Add event listener for send another button
    document.getElementById('sendAnotherBtn')?.addEventListener('click', () => {
      this.resetForm();
      this.render();
      this.initEventListeners();
      this.initAnimations();
    });
  }

  /**
   * Generate reference number
   */
  generateReference() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MP${timestamp}${random}`;
  }

  /**
   * Reset form
   */
  resetForm() {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: '',
      newsletter: false
    };
    this.errors = {};
    this.isSubmitting = false;
    
    this.render();
    this.initEventListeners();
    this.initAnimations();
    
    this.showNotification('Form has been reset', 'info');
  }

  /**
   * Update character count
   */
  updateCharacterCount() {
    const countSpan = document.getElementById('messageCount');
    if (countSpan) {
      countSpan.textContent = this.formData.message.length;
    }
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
   * Clean up
   */
  destroy() {
    console.log('🧹 ContactPage destroyed');
  }
}