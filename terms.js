import { i18n } from './i18n.js';
import { authService } from './auth.js';
import { storageService } from './storage.js';

export class TermsPage {
  constructor(container) {
    this.container = container;
    this.currentVersion = '2.0.0';
    this.lastUpdated = '2026-02-20';
    this.acceptedVersion = null;
    this.init();
  }

  async init() {
    await this.loadUserAcceptance();
    this.render();
    this.attachEventListeners();
    this.initIntersectionObserver();
  }

  async loadUserAcceptance() {
    try {
      const user = authService.currentUser;
      if (user) {
        // Load user's accepted terms version from localStorage or database
        const saved = localStorage.getItem(`terms_accepted_${user.uid}`);
        this.acceptedVersion = saved ? JSON.parse(saved) : null;
      }
    } catch (error) {
      console.error('Error loading terms acceptance:', error);
    }
  }

  render() {
    const needsAcceptance = this.checkTermsAcceptance();
    
    this.container.innerHTML = `
      <div class="legal-page">
        <!-- Header Section -->
        <div class="page-header animate-fade-in">
          <div class="header-content">
            <h1 class="page-title" data-i18n="terms_of_service">Terms and Conditions</h1>
            <p class="page-subtitle" data-i18n="last_updated">Last updated: ${this.formatDate(this.lastUpdated)}</p>
            <div class="version-badge">
              <i class="fas fa-code-branch"></i> Version ${this.currentVersion}
            </div>
          </div>
          ${needsAcceptance ? this.renderAcceptanceBanner() : ''}
        </div>

        <!-- Quick Navigation -->
        <div class="terms-nav animate-slide-up">
          <button class="nav-toggle" id="termsNavToggle">
            <i class="fas fa-bars"></i> <span data-i18n="quick_nav">Quick Navigation</span>
          </button>
          <div class="nav-links" id="termsNavLinks">
            <a href="#agreement" class="nav-link">1. <span data-i18n="agreement_terms">Agreement</span></a>
            <a href="#products" class="nav-link">2. <span data-i18n="products_orders">Products & Orders</span></a>
            <a href="#shipping" class="nav-link">3. <span data-i18n="shipping_delivery_title">Shipping</span></a>
            <a href="#returns" class="nav-link">4. <span data-i18n="returns_refunds_title">Returns</span></a>
            <a href="#intellectual" class="nav-link">5. <span data-i18n="intellectual_property">IP Rights</span></a>
            <a href="#accounts" class="nav-link">6. <span data-i18n="user_accounts">Accounts</span></a>
            <a href="#liability" class="nav-link">7. <span data-i18n="limitation_liability">Liability</span></a>
            <a href="#governing" class="nav-link">8. <span data-i18n="governing_law">Governing Law</span></a>
            <a href="#changes" class="nav-link">9. <span data-i18n="changes_terms">Changes</span></a>
            <a href="#contact" class="nav-link">10. <span data-i18n="contact_info_title">Contact</span></a>
          </div>
        </div>
        
        <div class="legal-content">
          ${this.renderSection1()}
          ${this.renderSection2()}
          ${this.renderSection3()}
          ${this.renderSection4()}
          ${this.renderSection5()}
          ${this.renderSection6()}
          ${this.renderSection7()}
          ${this.renderSection8()}
          ${this.renderSection9()}
          ${this.renderSection10()}
        </div>

        <!-- Acceptance Footer -->
        ${needsAcceptance ? this.renderAcceptanceFooter() : ''}

        <!-- Print Button -->
        <button class="print-button" id="printTerms" title="Print Terms">
          <i class="fas fa-print"></i>
        </button>

        <!-- Back to Top Button -->
        <button class="back-to-top" id="backToTop" title="Back to Top">
          <i class="fas fa-arrow-up"></i>
        </button>
      </div>
    `;

    i18n.updatePageContent();
  }

  renderSection1() {
    return `
      <section id="agreement" class="legal-section">
        <h2><span class="section-number">1</span> <span data-i18n="agreement_terms">Agreement to Terms</span></h2>
        <div class="section-content">
          <p data-i18n="agreement_text">By accessing or using the Madhav Prajapati Art website, mobile application, or any services provided by Madhav Prajapati Art ("Company," "we," "us," or "our"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services or purchase our products.</p>
          
          <div class="highlight-box">
            <i class="fas fa-gavel"></i>
            <div>
              <strong>Binding Agreement:</strong> These Terms constitute a legally binding agreement between you and Madhav Prajapati Art. Please read them carefully before proceeding.
            </div>
          </div>

          <h3>1.1 Definitions</h3>
          <ul>
            <li><strong>"Company"</strong> refers to Madhav Prajapati Art, its owners, employees, and affiliates.</li>
            <li><strong>"Website"</strong> refers to madhav-prajapati-art.web.app and all related subdomains.</li>
            <li><strong>"Products"</strong> refers to all handcrafted clay diyas and decorative items sold by the Company.</li>
            <li><strong>"User," "You," "Your"</strong> refers to any individual accessing our Website or purchasing Products.</li>
          </ul>

          <h3>1.2 Eligibility</h3>
          <p>By using our services, you represent and warrant that:</p>
          <ul>
            <li>You are at least 18 years of age or have parental consent</li>
            <li>You have the legal capacity to enter into binding contracts</li>
            <li>You will provide accurate information during registration and purchase</li>
          </ul>
        </div>
      </section>
    `;
  }

  renderSection2() {
    return `
      <section id="products" class="legal-section">
        <h2><span class="section-number">2</span> <span data-i18n="products_orders">Products and Orders</span></h2>
        <div class="section-content">
          <h3>2.1 Product Descriptions</h3>
          <p data-i18n="product_descriptions_text">We strive to accurately display our products, including colors, dimensions, and materials. However, due to the handcrafted nature of our items, slight variations may occur. These variations are not considered defects and add to the unique character of each piece.</p>
          
          <div class="note-box">
            <i class="fas fa-paint-brush"></i>
            <p><strong>Handcrafted Note:</strong> Each diya is individually handmade, so no two pieces are exactly alike. This uniqueness is part of their charm and value.</p>
          </div>
          
          <h3>2.2 Pricing</h3>
          <p data-i18n="pricing_text">All prices are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices at any time without prior notice.</p>
          
          <div class="pricing-table">
            <div class="pricing-row header">
              <span>Product Category</span>
              <span>Price Range</span>
              <span>GST</span>
            </div>
            <div class="pricing-row">
              <span>Standard Diyas</span>
              <span>₹99 - ₹499</span>
              <span>5%</span>
            </div>
            <div class="pricing-row">
              <span>Premium Diyas</span>
              <span>₹599 - ₹1,999</span>
              <span>5%</span>
            </div>
            <div class="pricing-row">
              <span>Festival Sets</span>
              <span>₹999 - ₹4,999</span>
              <span>5%</span>
            </div>
            <div class="pricing-row">
              <span>Custom Orders</span>
              <span>Quotation based</span>
              <span>5%</span>
            </div>
          </div>
          
          <h3>2.3 Order Acceptance</h3>
          <p data-i18n="order_acceptance_text">We reserve the right to refuse or cancel any order for reasons including but not limited to: product availability, errors in product or pricing information, or suspected fraudulent activity.</p>
          
          <h3>2.4 Payment</h3>
          <p data-i18n="payment_text">Payment must be received in full before orders are processed. We accept various payment methods:</p>
          
          <div class="payment-methods">
            <span class="payment-badge"><i class="fab fa-cc-visa"></i> Visa</span>
            <span class="payment-badge"><i class="fab fa-cc-mastercard"></i> Mastercard</span>
            <span class="payment-badge"><i class="fab fa-cc-amex"></i> Amex</span>
            <span class="payment-badge"><i class="fab fa-cc-paypal"></i> PayPal</span>
            <span class="payment-badge"><i class="fab fa-google-pay"></i> Google Pay</span>
            <span class="payment-badge"><i class="fas fa-mobile-alt"></i> UPI</span>
          </div>
        </div>
      </section>
    `;
  }

  renderSection3() {
    return `
      <section id="shipping" class="legal-section">
        <h2><span class="section-number">3</span> <span data-i18n="shipping_delivery_title">Shipping and Delivery</span></h2>
        <div class="section-content">
          <h3>3.1 Shipping Policy</h3>
          <p data-i18n="shipping_policy_text">We ship to addresses within India and internationally. Shipping costs and estimated delivery times are provided at checkout. Delivery times are estimates and not guaranteed.</p>
          
          <div class="shipping-table">
            <div class="shipping-row header">
              <span>Location</span>
              <span>Standard</span>
              <span>Express</span>
              <span>Cost</span>
            </div>
            <div class="shipping-row">
              <span>Within India</span>
              <span>5-7 days</span>
              <span>2-3 days</span>
              <span>₹100 / ₹300</span>
            </div>
            <div class="shipping-row">
              <span>International</span>
              <span>10-15 days</span>
              <span>5-7 days</span>
              <span>$15 / $30</span>
            </div>
          </div>
          
          <h3>3.2 Risk of Loss</h3>
          <p data-i18n="risk_loss_text">All items purchased are made pursuant to a shipment contract. The risk of loss and title for such items pass to you upon our delivery to the carrier.</p>
          
          <h3>3.3 Customs and Duties</h3>
          <p data-i18n="customs_text">International orders may be subject to import duties, taxes, and customs clearance fees. These charges are the responsibility of the customer.</p>
          
          <h3>3.4 Delivery Attempts</h3>
          <p>Our courier partners will make up to 3 delivery attempts. If delivery fails after 3 attempts, the package will be returned to us. Reshipping costs may apply.</p>
        </div>
      </section>
    `;
  }

  renderSection4() {
    return `
      <section id="returns" class="legal-section">
        <h2><span class="section-number">4</span> <span data-i18n="returns_refunds_title">Returns and Refunds</span></h2>
        <div class="section-content">
          <h3>4.1 Return Policy</h3>
          <p data-i18n="return_policy_text">We accept returns within 7 days of delivery for eligible items. Items must be unused and in original packaging. Custom and personalized orders cannot be returned unless defective.</p>
          
          <h3>4.2 Non-Returnable Items</h3>
          <ul>
            <li>Custom or personalized orders</li>
            <li>Items used or altered after delivery</li>
            <li>Products during clearance sales (unless damaged)</li>
            <li>Items returned after 30 days</li>
          </ul>
          
          <h3>4.3 Refund Process</h3>
          <p data-i18n="refund_process_text">Refunds are processed within 5-7 business days after receiving and inspecting the returned item. Refunds are credited to the original payment method.</p>
          
          <div class="timeline">
            <div class="timeline-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Request Return</h4>
                <p>Contact us within 7 days of delivery</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Ship Item Back</h4>
                <p>Pack securely and ship to our address</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Inspection</h4>
                <p>We inspect within 2-3 business days</p>
              </div>
            </div>
            <div class="timeline-step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Refund Issued</h4>
                <p>5-7 business days to your account</p>
              </div>
            </div>
          </div>
          
          <h3>4.4 Damaged or Defective Items</h3>
          <p data-i18n="damaged_items_text">If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange a replacement or refund.</p>
          
          <div class="warning-box">
            <i class="fas fa-camera"></i>
            <div>
              <strong>Important:</strong> Always take photos of damaged items before returning. Email them to <a href="mailto:returns@madhavprajapati.art">returns@madhavprajapati.art</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderSection5() {
    return `
      <section id="intellectual" class="legal-section">
        <h2><span class="section-number">5</span> <span data-i18n="intellectual_property">Intellectual Property</span></h2>
        <div class="section-content">
          <p data-i18n="ip_text">All content on this website, including but not limited to images, logos, text, and designs, is the property of Madhav Prajapati Art and is protected by copyright and intellectual property laws.</p>
          
          <h3>5.1 Ownership</h3>
          <ul>
            <li>Product designs and patterns</li>
            <li>Website code and layout</li>
            <li>Trademarks and trade dress</li>
            <li>Photographs and descriptions</li>
          </ul>
          
          <p data-i18n="ip_restriction">You may not reproduce, distribute, or create derivative works from our content without explicit written permission.</p>
          
          <h3>5.2 User Content</h3>
          <p>By posting reviews, photos, or comments, you grant us a non-exclusive, royalty-free license to use, modify, and display such content for marketing purposes.</p>
        </div>
      </section>
    `;
  }

  renderSection6() {
    return `
      <section id="accounts" class="legal-section">
        <h2><span class="section-number">6</span> <span data-i18n="user_accounts">User Accounts</span></h2>
        <div class="section-content">
          <h3>6.1 Account Responsibilities</h3>
          <p data-i18n="account_responsibilities_text">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          
          <h3>6.2 Account Security</h3>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication if available</li>
            <li>Log out after each session on shared devices</li>
            <li>Report unauthorized access immediately</li>
          </ul>
          
          <h3>6.3 Account Termination</h3>
          <p data-i18n="account_termination_text">We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
          
          <div class="highlight-box">
            <i class="fas fa-shield-alt"></i>
            <div>
              <strong>Your Privacy:</strong> We protect your personal information. See our <a href="/privacy">Privacy Policy</a> for details.
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderSection7() {
    return `
      <section id="liability" class="legal-section">
        <h2><span class="section-number">7</span> <span data-i18n="limitation_liability">Limitation of Liability</span></h2>
        <div class="section-content">
          <p data-i18n="liability_text">To the fullest extent permitted by law, Madhav Prajapati Art shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or services.</p>
          
          <h3>7.1 Disclaimer of Warranties</h3>
          <p>Our products and services are provided "as is" without any warranties, express or implied, including but not limited to:</p>
          <ul>
            <li>Merchantability or fitness for a particular purpose</li>
            <li>Non-infringement of third-party rights</li>
            <li>Uninterrupted or error-free service</li>
          </ul>
          
          <h3>7.2 Maximum Liability</h3>
          <p>In any case, our total liability to you shall not exceed the amount you paid for products purchased through our website.</p>
        </div>
      </section>
    `;
  }

  renderSection8() {
    return `
      <section id="governing" class="legal-section">
        <h2><span class="section-number">8</span> <span data-i18n="governing_law">Governing Law</span></h2>
        <div class="section-content">
          <p data-i18n="governing_law_text">These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Panchkula, Haryana.</p>
          
          <h3>8.1 Dispute Resolution</h3>
          <p>Before filing any legal action, you agree to attempt resolving disputes through good-faith negotiations. If unresolved within 30 days, disputes may be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996.</p>
        </div>
      </section>
    `;
  }

  renderSection9() {
    return `
      <section id="changes" class="legal-section">
        <h2><span class="section-number">9</span> <span data-i18n="changes_terms">Changes to Terms</span></h2>
        <div class="section-content">
          <p data-i18n="changes_terms_text">We reserve the right to modify these Terms at any time. Changes become effective immediately upon posting. Your continued use of our website constitutes acceptance of modified Terms.</p>
          
          <h3>9.1 Notification of Changes</h3>
          <p>Material changes will be notified through:</p>
          <ul>
            <li>Email to registered users</li>
            <li>Website announcement banner</li>
            <li>Notice at login for 30 days</li>
          </ul>
          
          <h3>9.2 Version History</h3>
          <div class="version-history">
            <div class="version-item">
              <span class="version">v2.0.0</span>
              <span class="date">Feb 2026</span>
              <span class="change">Major update - Added AI training opt-out</span>
            </div>
            <div class="version-item">
              <span class="version">v1.5.0</span>
              <span class="date">Jan 2026</span>
              <span class="change">Updated shipping policies</span>
            </div>
            <div class="version-item">
              <span class="version">v1.0.0</span>
              <span class="date">Jan 2025</span>
              <span class="change">Initial terms</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderSection10() {
    return `
      <section id="contact" class="legal-section">
        <h2><span class="section-number">10</span> <span data-i18n="contact_info_title">Contact Information</span></h2>
        <div class="section-content">
          <p data-i18n="contact_terms_text">For questions about these Terms, please contact us:</p>
          
          <div class="contact-grid">
            <div class="contact-card">
              <i class="fas fa-map-marker-alt"></i>
              <h4>Visit Us</h4>
              <address>
                Madhav Prajapati Art<br>
                Bagwali Village, Panchkula<br>
                Haryana - 134114, India
              </address>
            </div>
            
            <div class="contact-card">
              <i class="fas fa-envelope"></i>
              <h4>Email Us</h4>
              <p>
                <a href="mailto:legal@madhavprajapati.art">legal@madhavprajapati.art</a><br>
                <small>Response within 24 hours</small>
              </p>
            </div>
            
            <div class="contact-card">
              <i class="fas fa-phone-alt"></i>
              <h4>Call Us</h4>
              <p>
                <a href="tel:+919876543210">+91 98765 43210</a><br>
                <small>Mon-Sat: 9AM - 7PM IST</small>
              </p>
            </div>
            
            <div class="contact-card">
              <i class="fas fa-clock"></i>
              <h4>Business Hours</h4>
              <p>
                Monday - Saturday: 9:00 AM - 7:00 PM<br>
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderAcceptanceBanner() {
    return `
      <div class="acceptance-banner warning">
        <i class="fas fa-exclamation-triangle"></i>
        <span data-i18n="terms_updated">Our terms have been updated. Please review and accept to continue.</span>
      </div>
    `;
  }

  renderAcceptanceFooter() {
    return `
      <div class="acceptance-footer">
        <div class="acceptance-box">
          <h3><i class="fas fa-check-circle"></i> <span data-i18n="accept_terms">Accept Terms & Conditions</span></h3>
          <p data-i18n="accept_terms_text">By clicking Accept, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
          
          <div class="acceptance-options">
            <label class="checkbox-label">
              <input type="checkbox" id="agreeTerms" class="agree-checkbox">
              <span data-i18n="i_agree">I have read and agree to the Terms and Conditions</span>
            </label>
            
            <label class="checkbox-label">
              <input type="checkbox" id="agreeMarketing" class="marketing-checkbox">
              <span data-i18n="marketing_consent">I agree to receive marketing communications (optional)</span>
            </label>
          </div>
          
          <div class="acceptance-actions">
            <button class="btn btn-primary" id="acceptTermsBtn" disabled>
              <i class="fas fa-check"></i> <span data-i18n="accept">Accept</span>
            </button>
            <button class="btn btn-outline" id="declineTermsBtn">
              <i class="fas fa-times"></i> <span data-i18n="decline">Decline</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Navigation toggle
    const navToggle = document.getElementById('termsNavToggle');
    const navLinks = document.getElementById('termsNavLinks');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
      });
    }

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          backToTop.classList.add('show');
        } else {
          backToTop.classList.remove('show');
        }
      });

      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Print button
    const printBtn = document.getElementById('printTerms');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Terms acceptance
    const agreeCheckbox = document.getElementById('agreeTerms');
    const acceptBtn = document.getElementById('acceptTermsBtn');
    const declineBtn = document.getElementById('declineTermsBtn');

    if (agreeCheckbox && acceptBtn) {
      agreeCheckbox.addEventListener('change', () => {
        acceptBtn.disabled = !agreeCheckbox.checked;
      });
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.acceptTerms());
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => this.declineTerms());
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          
          // Close mobile nav if open
          if (navLinks) {
            navLinks.classList.remove('show');
          }
        }
      });
    });
  }

  initIntersectionObserver() {
    // Highlight active section in navigation
    const sections = document.querySelectorAll('.legal-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
  }

  checkTermsAcceptance() {
    if (!authService.currentUser) return false;
    
    // Check if user has accepted current version
    return !this.acceptedVersion || 
           this.acceptedVersion.version !== this.currentVersion ||
           new Date(this.acceptedVersion.date) < new Date(this.lastUpdated);
  }

  async acceptTerms() {
    try {
      const user = authService.currentUser;
      if (!user) {
        // Redirect to login
        window.location.href = '/login?redirect=terms';
        return;
      }

      const acceptance = {
        userId: user.uid,
        version: this.currentVersion,
        date: new Date().toISOString(),
        ip: await this.getUserIP(),
        userAgent: navigator.userAgent
      };

      // Save to localStorage
      localStorage.setItem(`terms_accepted_${user.uid}`, JSON.stringify(acceptance));

      // Save to database (if you have backend)
      await this.saveAcceptanceToDatabase(acceptance);

      // Show success message
      this.showNotification('Thank you for accepting the Terms & Conditions!', 'success');

      // Update UI
      this.acceptedVersion = acceptance;
      
      // Remove acceptance banner
      const banner = document.querySelector('.acceptance-banner');
      const footer = document.querySelector('.acceptance-footer');
      if (banner) banner.remove();
      if (footer) footer.remove();

    } catch (error) {
      console.error('Error accepting terms:', error);
      this.showNotification('Failed to save acceptance. Please try again.', 'error');
    }
  }

  declineTerms() {
    if (confirm('You must accept the Terms & Conditions to use our services. Would you like to review them again?')) {
      // Scroll to top to review
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Redirect to homepage or logout
      if (authService.currentUser) {
        authService.logout();
      }
      window.location.href = '/';
    }
  }

  async saveAcceptanceToDatabase(acceptance) {
    // Implement your database save logic here
    // Example: await db.collection('terms_acceptance').add(acceptance);
    console.log('Saving acceptance:', acceptance);
  }

  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .legal-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
  }

  .header-content {
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  }

  .page-title {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: #666;
    font-size: 1rem;
  }

  .version-badge {
    display: inline-block;
    background: #D4AF37;
    color: white;
    padding: 0.25rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .acceptance-banner {
    background: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    padding: 1rem;
    border-radius: 10px;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .acceptance-banner.warning {
    background: #fff3cd;
    border-color: #ffeeba;
    color: #856404;
  }

  .terms-nav {
    position: sticky;
    top: 80px;
    z-index: 90;
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }

  .nav-toggle {
    display: none;
    width: 100%;
    padding: 1rem;
    background: #D4AF37;
    color: white;
    border: none;
    font-size: 1rem;
    cursor: pointer;
  }

  .nav-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
  }

  .nav-link {
    color: #555;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .nav-link:hover {
    background: #f0f0f0;
  }

  .nav-link.active {
    background: #D4AF37;
    color: white;
  }

  .legal-section {
    margin-bottom: 3rem;
    scroll-margin-top: 100px;
  }

  .legal-section h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-number {
    background: #D4AF37;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .section-content {
    padding-left: 1rem;
  }

  .section-content h3 {
    font-size: 1.2rem;
    color: #444;
    margin: 1.5rem 0 1rem;
  }

  .section-content p {
    line-height: 1.8;
    color: #555;
    margin-bottom: 1rem;
  }

  .section-content ul {
    margin: 1rem 0 1.5rem 2rem;
    color: #555;
    line-height: 1.8;
  }

  .highlight-box {
    background: #f5f5f5;
    padding: 1.5rem;
    border-radius: 10px;
    margin: 1.5rem 0;
    border-left: 4px solid #D4AF37;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .highlight-box i {
    color: #D4AF37;
    font-size: 1.5rem;
  }

  .note-box {
    background: #fff8e7;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .note-box i {
    color: #D4AF37;
    font-size: 1.2rem;
  }

  .warning-box {
    background: #f8d7da;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    border-left: 4px solid #dc3545;
  }

  .warning-box i {
    color: #dc3545;
    font-size: 1.2rem;
  }

  .pricing-table {
    margin: 1.5rem 0;
    border: 1px solid #eee;
    border-radius: 10px;
    overflow: hidden;
  }

  .pricing-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }

  .pricing-row:last-child {
    border-bottom: none;
  }

  .pricing-row.header {
    background: #D4AF37;
    color: white;
    font-weight: 600;
  }

  .payment-methods {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .payment-badge {
    background: #f0f0f0;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-size: 0.9rem;
  }

  .shipping-table {
    margin: 1.5rem 0;
    border: 1px solid #eee;
    border-radius: 10px;
    overflow: hidden;
  }

  .shipping-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }

  .shipping-row.header {
    background: #D4AF37;
    color: white;
    font-weight: 600;
  }

  .timeline {
    margin: 2rem 0;
    position: relative;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #D4AF37;
  }

  .timeline-step {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: #D4AF37;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    z-index: 1;
  }

  .step-content {
    flex: 1;
    padding-bottom: 1rem;
  }

  .step-content h4 {
    margin-bottom: 0.25rem;
    color: #333;
  }

  .step-content p {
    color: #666;
    font-size: 0.9rem;
  }

  .version-history {
    margin: 1rem 0;
  }

  .version-item {
    display: flex;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }

  .version-item .version {
    width: 80px;
    font-weight: 600;
    color: #D4AF37;
  }

  .version-item .date {
    width: 100px;
    color: #666;
  }

  .version-item .change {
    flex: 1;
    color: #333;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .contact-card {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
  }

  .contact-card i {
    font-size: 2rem;
    color: #D4AF37;
    margin-bottom: 1rem;
  }

  .contact-card h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .contact-card address,
  .contact-card p {
    color: #666;
    line-height: 1.6;
    font-style: normal;
  }

  .contact-card a {
    color: #D4AF37;
    text-decoration: none;
  }

  .contact-card a:hover {
    text-decoration: underline;
  }

  .acceptance-footer {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 2px solid #D4AF37;
    padding: 1.5rem;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
    z-index: 100;
  }

  .acceptance-box {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .acceptance-box h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  .acceptance-box p {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .acceptance-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    text-align: left;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #333;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .acceptance-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .print-button,
  .back-to-top {
    position: fixed;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #D4AF37;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 99;
  }

  .print-button {
    bottom: 2rem;
    right: 2rem;
  }

  .back-to-top {
    bottom: 2rem;
    left: 2rem;
    opacity: 0;
    visibility: hidden;
  }

  .back-to-top.show {
    opacity: 1;
    visibility: visible;
  }

  .print-button:hover,
  .back-to-top:hover {
    transform: scale(1.1);
    background: #c49f2e;
  }

  .btn {
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border: none;
    font-size: 1rem;
  }

  .btn-primary {
    background: #D4AF37;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #c49f2e;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(212,175,55,0.3);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-outline {
    background: transparent;
    color: #333;
    border: 2px solid #D4AF37;
  }

  .btn-outline:hover {
    background: #D4AF37;
    color: white;
  }

  .notification {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    transition: transform 0.3s ease;
  }

  .notification.show {
    transform: translateX(-50%) translateY(0);
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

  /* Print styles */
  @media print {
    .terms-nav,
    .acceptance-footer,
    .print-button,
    .back-to-top,
    .nav-toggle,
    .btn,
    .notification {
      display: none !important;
    }

    .legal-page {
      padding: 0;
    }

    .legal-section {
      page-break-inside: avoid;
    }

    a {
      text-decoration: none;
      color: black;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
    }

    .nav-toggle {
      display: block;
    }

    .nav-links {
      display: none;
    }

    .nav-links.show {
      display: flex;
    }

    .pricing-row,
    .shipping-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .pricing-row.header,
    .shipping-row.header {
      display: none;
    }

    .pricing-row span::before,
    .shipping-row span::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 0.5rem;
    }

    .contact-grid {
      grid-template-columns: 1fr;
    }

    .acceptance-actions {
      flex-direction: column;
    }

    .print-button,
    .back-to-top {
      width: 40px;
      height: 40px;
      font-size: 0.9rem;
    }
  }
`;

document.head.appendChild(style);

export default TermsPage;