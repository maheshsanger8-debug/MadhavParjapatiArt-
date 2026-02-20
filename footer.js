import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// FOOTER COMPONENT - Premium Footer for Madhav Prajapati Art
// Bagwali, Panchkula - Handcrafted Clay Diyas
// ============================================

export class Footer {
  constructor() {
    this.element = null;
    this.currentYear = new Date().getFullYear();
  }

  /**
   * Render footer
   */
  render() {
    const footer = document.createElement('footer');
    footer.className = 'luxury-footer';
    footer.setAttribute('data-animate', 'fadeInUp');
    
    footer.innerHTML = `
      <div class="footer-container">
        <!-- Main Footer Content -->
        <div class="footer-content">
          <!-- Brand Section -->
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-madhav">MADHAV PRAJAPATI</span>
              <span class="logo-art">ART</span>
            </div>
            <p class="footer-tagline" data-i18n="footer_tagline">
              Handcrafted with love, illuminated with tradition.
            </p>
            <p class="footer-location">
              <i class="fas fa-map-marker-alt"></i> Bagwali, Panchkula, Haryana 134113
            </p>
            
            <!-- Social Links -->
            <div class="social-links">
              <a href="https://instagram.com/madhavprajapati.art" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com/madhavprajapati.art" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="https://pinterest.com/madhavprajapati.art" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <i class="fab fa-pinterest"></i>
              </a>
              <a href="https://youtube.com/@madhavprajapati.art" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i class="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
          
          <!-- Links Sections -->
          <div class="footer-links">
            <!-- Shop Links -->
            <div class="link-group">
              <h4><i class="fas fa-store"></i> <span data-i18n="shop">Shop</span></h4>
              <ul>
                <li><a href="#products" data-nav data-i18n="all_products">All Products</a></li>
                <li><a href="#products?category=diwali" data-nav data-i18n="diwali_collection">Diwali Collection</a></li>
                <li><a href="#products?category=wedding" data-nav data-i18n="wedding_diyas">Wedding Diyas</a></li>
                <li><a href="#products?category=temple" data-nav data-i18n="temple_diyas">Temple Diyas</a></li>
                <li><a href="#products?category=decorative" data-nav data-i18n="decorative">Decorative</a></li>
                <li><a href="#products?category=custom" data-nav data-i18n="custom_orders">Custom Orders</a></li>
              </ul>
            </div>
            
            <!-- Support Links -->
            <div class="link-group">
              <h4><i class="fas fa-headset"></i> <span data-i18n="support">Support</span></h4>
              <ul>
                <li><a href="#faq" data-nav data-i18n="faq">FAQ</a></li>
                <li><a href="#shipping" data-nav data-i18n="shipping_policy">Shipping Policy</a></li>
                <li><a href="#returns" data-nav data-i18n="returns_policy">Returns & Exchanges</a></li>
                <li><a href="#track-order" data-nav data-i18n="track_order">Track Order</a></li>
                <li><a href="#contact" data-nav data-i18n="contact_us">Contact Us</a></li>
              </ul>
            </div>
            
            <!-- Legal Links -->
            <div class="link-group">
              <h4><i class="fas fa-gavel"></i> <span data-i18n="legal">Legal</span></h4>
              <ul>
                <li><a href="#privacy" data-nav data-i18n="privacy_policy">Privacy Policy</a></li>
                <li><a href="#terms" data-nav data-i18n="terms_of_service">Terms of Service</a></li>
                <li><a href="#cookies" data-nav data-i18n="cookie_policy">Cookie Policy</a></li>
                <li><a href="#accessibility" data-nav data-i18n="accessibility">Accessibility</a></li>
              </ul>
            </div>
            
            <!-- Contact Info -->
            <div class="link-group">
              <h4><i class="fas fa-phone-alt"></i> <span data-i18n="get_in_touch">Get in Touch</span></h4>
              <ul class="contact-info">
                <li>
                  <i class="fas fa-phone"></i>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </li>
                <li>
                  <i class="fas fa-envelope"></i>
                  <a href="mailto:hello@madhavprajapati.art">hello@madhavprajapati.art</a>
                </li>
                <li>
                  <i class="fas fa-clock"></i>
                  <span>Mon-Sat, 10am-7pm</span>
                </li>
                <li>
                  <i class="fas fa-map-marker-alt"></i>
                  <span>Bagwali, Panchkula, Haryana</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Newsletter Signup -->
        <div class="footer-newsletter">
          <div class="newsletter-content">
            <h4 data-i18n="newsletter_title">Join Our Diya Family</h4>
            <p data-i18n="newsletter_text">Subscribe for exclusive offers, new collection updates, and Diwali specials.</p>
          </div>
          <form class="newsletter-form" id="newsletterForm">
            <div class="newsletter-input-group">
              <input type="email" placeholder="Your email address" aria-label="Email for newsletter" required>
              <button type="submit" class="btn-subscribe" data-i18n="subscribe">Subscribe</button>
            </div>
            <label class="checkbox-label">
              <input type="checkbox" required>
              <span data-i18n="newsletter_consent">I agree to receive marketing emails from Madhav Prajapati Art</span>
            </label>
          </form>
        </div>
        
        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="copyright">
            <p>&copy; ${this.currentYear} Madhav Prajapati Art. <span data-i18n="all_rights_reserved">All rights reserved.</span></p>
            <p class="crafted-by" data-i18n="crafted_by">Handcrafted with ❤️ in Bagwali, Panchkula</p>
          </div>
          
          <div class="payment-methods">
            <span data-i18n="we_accept">We Accept:</span>
            <div class="payment-icons">
              <i class="fab fa-cc-visa" title="Visa"></i>
              <i class="fab fa-cc-mastercard" title="Mastercard"></i>
              <i class="fab fa-cc-amex" title="American Express"></i>
              <i class="fab fa-cc-paypal" title="PayPal"></i>
              <i class="fab fa-google-pay" title="Google Pay"></i>
              <i class="fab fa-apple-pay" title="Apple Pay"></i>
              <i class="fas fa-money-bill-wave" title="Cash on Delivery"></i>
            </div>
          </div>
        </div>
        
        <!-- Trust Badges -->
        <div class="trust-badges">
          <div class="trust-item">
            <i class="fas fa-shield-alt"></i>
            <span data-i18n="secure_payments">Secure Payments</span>
          </div>
          <div class="trust-item">
            <i class="fas fa-truck"></i>
            <span data-i18n="free_shipping">Free Shipping ₹999+</span>
          </div>
          <div class="trust-item">
            <i class="fas fa-undo-alt"></i>
            <span data-i18n="easy_returns">7-Day Returns</span>
          </div>
          <div class="trust-item">
            <i class="fas fa-certificate"></i>
            <span data-i18n="handmade">100% Handmade</span>
          </div>
        </div>
      </div>
    `;

    this.element = footer;
    this.attachEventListeners();
    return footer;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Newsletter form submission
    const newsletterForm = this.element.querySelector('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewsletterSubmit(newsletterForm);
      });
    }

    // Smooth scroll to top for internal links
    this.element.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.hash = href;
          // Scroll to top after hash change
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }
      });
    });

    // Animate footer on scroll
    animationManager.initScrollAnimations();
  }

  /**
   * Handle newsletter submission
   */
  async handleNewsletterSubmit(form) {
    const email = form.querySelector('input[type="email"]')?.value;
    
    if (!email || !this.isValidEmail(email)) {
      this.showNotification('Please enter a valid email address', 'error');
      return;
    }

    const submitBtn = form.querySelector('.btn-subscribe');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      // Simulate API call - replace with actual newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showNotification('Thank you for subscribing! Check your inbox.', 'success');
      form.reset();
      
    } catch (error) {
      console.error('Newsletter signup error:', error);
      this.showNotification('Something went wrong. Please try again.', 'error');
      
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  /**
   * Validate email
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
   * Update copyright year dynamically
   */
  updateYear() {
    const yearElement = this.element.querySelector('.copyright p');
    if (yearElement) {
      yearElement.innerHTML = `&copy; ${this.currentYear} Madhav Prajapati Art. <span data-i18n="all_rights_reserved">All rights reserved.</span>`;
    }
  }

  /**
   * Get footer element
   */
  getElement() {
    return this.element;
  }

  /**
   * Scroll to top
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Destroy footer
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    console.log('🧹 Footer destroyed');
  }
}

// ============================================
// FOOTER STYLES
// ============================================

const style = document.createElement('style');
style.textContent = `
  .luxury-footer {
    background: #0F0F0F;
    color: #FFFFFF;
    padding: 4rem 2rem 2rem;
    margin-top: 4rem;
    border-top: 1px solid rgba(212,175,55,0.2);
  }

  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .footer-content {
    display: grid;
    grid-template-columns: 1.5fr 3fr;
    gap: 4rem;
    margin-bottom: 3rem;
  }

  /* Brand Section */
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .footer-logo {
    display: flex;
    flex-direction: column;
  }

  .logo-madhav {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #FFFFFF;
    text-transform: uppercase;
    line-height: 1.2;
  }

  .logo-art {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 4px;
    color: #D4AF37;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 2px;
  }

  .footer-tagline {
    color: #CCCCCC;
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 300px;
  }

  .footer-location {
    color: #999999;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .footer-location i {
    color: #D4AF37;
  }

  /* Social Links */
  .social-links {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .social-links a {
    width: 40px;
    height: 40px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    transition: all 0.3s ease;
  }

  .social-links a:hover {
    background: #D4AF37;
    transform: translateY(-3px);
  }

  .social-links a i {
    font-size: 1.1rem;
  }

  /* Links Sections */
  .footer-links {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  .link-group h4 {
    color: #D4AF37;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .link-group h4 i {
    font-size: 0.9rem;
  }

  .link-group ul {
    list-style: none;
    padding: 0;
  }

  .link-group li {
    margin-bottom: 0.75rem;
  }

  .link-group a {
    color: #CCCCCC;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .link-group a:hover {
    color: #D4AF37;
    transform: translateX(3px);
  }

  .contact-info li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #CCCCCC;
    font-size: 0.9rem;
  }

  .contact-info i {
    color: #D4AF37;
    width: 16px;
  }

  .contact-info a {
    color: #CCCCCC;
  }

  .contact-info a:hover {
    color: #D4AF37;
  }

  /* Newsletter Section */
  .footer-newsletter {
    background: rgba(255,255,255,0.02);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2rem;
    border: 1px solid rgba(212,175,55,0.1);
  }

  .newsletter-content h4 {
    color: #D4AF37;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .newsletter-content p {
    color: #CCCCCC;
    font-size: 0.95rem;
  }

  .newsletter-form {
    flex: 1;
    max-width: 500px;
  }

  .newsletter-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .newsletter-input-group input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid transparent;
    border-radius: 8px;
    background: #2A2A2A;
    color: #FFFFFF;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
  }

  .newsletter-input-group input:focus {
    outline: none;
    border-color: #D4AF37;
    background: #333333;
  }

  .btn-subscribe {
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #D4AF37, #FF8C42);
    color: #0F0F0F;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-subscribe:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(212,175,55,0.3);
  }

  .btn-subscribe:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .newsletter-form .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #999999;
    font-size: 0.8rem;
  }

  .newsletter-form .checkbox-label input[type="checkbox"] {
    accent-color: #D4AF37;
  }

  /* Footer Bottom */
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
    border-top: 1px solid rgba(255,255,255,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .copyright p {
    color: #999999;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .crafted-by {
    color: #D4AF37 !important;
    font-size: 0.85rem !important;
  }

  .payment-methods {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .payment-methods span {
    color: #999999;
    font-size: 0.9rem;
  }

  .payment-icons {
    display: flex;
    gap: 0.75rem;
  }

  .payment-icons i {
    font-size: 1.5rem;
    color: #666666;
    transition: color 0.2s ease;
    cursor: default;
  }

  .payment-icons i:hover {
    color: #D4AF37;
  }

  /* Trust Badges */
  .trust-badges {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #CCCCCC;
    font-size: 0.9rem;
  }

  .trust-item i {
    color: #D4AF37;
    font-size: 1rem;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .footer-links {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .footer-links {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .footer-newsletter {
      flex-direction: column;
      text-align: center;
    }
    
    .newsletter-form {
      width: 100%;
    }
    
    .footer-bottom {
      flex-direction: column;
      text-align: center;
    }
    
    .payment-methods {
      flex-direction: column;
    }
    
    .trust-badges {
      gap: 1.5rem;
    }
    
    .trust-item {
      width: calc(50% - 1rem);
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .luxury-footer {
      padding: 3rem 1rem 1.5rem;
    }
    
    .trust-item {
      width: 100%;
    }
    
    .newsletter-input-group {
      flex-direction: column;
    }
    
    .btn-subscribe {
      width: 100%;
    }
  }

  /* Dark Mode Override (already dark) */
  @media (prefers-color-scheme: light) {
    .luxury-footer {
      background: #0F0F0F; /* Keep dark regardless of theme */
    }
  }
`;

document.head.appendChild(style);

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const footer = new Footer();

// Export default for easy import
export default footer;