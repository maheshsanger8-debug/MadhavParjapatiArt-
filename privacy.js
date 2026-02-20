import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// PRIVACY PAGE - Complete Privacy Policy Component
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class PrivacyPage {
  constructor(container) {
    this.container = container;
    this.currentYear = new Date().getFullYear();
    this.lastUpdated = 'February 19, 2026';
    this.init();
  }

  /**
   * Initialize privacy page
   */
  init() {
    this.render();
    this.initEventListeners();
    this.initAnimations();
    console.log('✅ PrivacyPage initialized from Bagwali, Panchkula');
  }

  /**
   * Render privacy page
   */
  render() {
    this.container.innerHTML = `
      <div class="privacy-page">
        <div class="privacy-header" data-animate="fadeInDown">
          <h1 class="page-title" data-i18n="privacy_policy">Privacy Policy</h1>
          <p class="page-subtitle" data-i18n="last_updated">Last updated: ${this.lastUpdated}</p>
          <div class="last-updated">
            <i class="fas fa-shield-alt"></i> Effective from Bagwali, Panchkula, Haryana 134113
          </div>
        </div>
        
        <div class="privacy-content" data-animate="fadeInUp" data-delay="100">
          <!-- Table of Contents -->
          <div class="table-of-contents">
            <h3><i class="fas fa-list"></i> <span data-i18n="quick_navigation">Quick Navigation</span></h3>
            <div class="toc-grid">
              <a href="#introduction" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="introduction">Introduction</span>
              </a>
              <a href="#information" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="information_collect">Information We Collect</span>
              </a>
              <a href="#usage" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="how_we_use">How We Use Information</span>
              </a>
              <a href="#sharing" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="sharing_info">Information Sharing</span>
              </a>
              <a href="#cookies" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="cookies">Cookies & Tracking</span>
              </a>
              <a href="#rights" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="your_rights">Your Rights</span>
              </a>
              <a href="#security" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="data_security">Data Security</span>
              </a>
              <a href="#contact" class="toc-item" data-nav>
                <i class="fas fa-chevron-right"></i> <span data-i18n="contact_us_title">Contact Us</span>
              </a>
            </div>
          </div>
          
          <!-- Introduction -->
          <section id="introduction" class="privacy-section" data-animate="fadeInUp" data-delay="150">
            <h2><i class="fas fa-info-circle"></i> <span data-i18n="introduction">1. Introduction</span></h2>
            <p data-i18n="privacy_intro1">Madhav Prajapati Art ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from our studio in Bagwali, Panchkula.</p>
            <p data-i18n="privacy_intro2">Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
            
            <div class="info-box">
              <i class="fas fa-map-marker-alt"></i> <strong data-i18n="our_studio">Our Studio:</strong> <span data-i18n="bagwali_address">Bagwali, Panchkula, Haryana 134113</span>
            </div>
          </section>
          
          <!-- Information We Collect -->
          <section id="information" class="privacy-section" data-animate="fadeInUp" data-delay="200">
            <h2><i class="fas fa-database"></i> <span data-i18n="information_collect">2. Information We Collect</span></h2>
            
            <h3 data-i18n="personal_data">2.1 Personal Data</h3>
            <p data-i18n="personal_data_text">We may collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li data-i18n="register_account">Register for an account</li>
              <li data-i18n="make_purchase">Make a purchase</li>
              <li data-i18n="signup_newsletter">Sign up for our newsletter</li>
              <li data-i18n="contact_forms">Contact us via forms or email</li>
              <li data-i18n="participate_promotions">Participate in promotions or surveys</li>
            </ul>
            <p data-i18n="information_includes">This information may include:</p>
            <ul>
              <li data-i18n="name_contact">Name and contact information (email, phone number, shipping address)</li>
              <li data-i18n="payment_info">Payment information (processed securely through our payment partners)</li>
              <li data-i18n="account_credentials">Account credentials</li>
              <li data-i18n="order_history">Order history and preferences</li>
            </ul>
            
            <h3 data-i18n="automatic_info">2.2 Automatically Collected Information</h3>
            <p data-i18n="automatic_text">When you visit our website, we automatically collect certain information about your device and browsing actions, including:</p>
            <ul>
              <li data-i18n="ip_address">IP address</li>
              <li data-i18n="browser_type">Browser type and version</li>
              <li data-i18n="pages_visited">Pages visited and time spent</li>
              <li data-i18n="referring_sites">Referring website addresses</li>
              <li data-i18n="device_info">Device information</li>
            </ul>
          </section>
          
          <!-- How We Use Information -->
          <section id="usage" class="privacy-section" data-animate="fadeInUp" data-delay="250">
            <h2><i class="fas fa-cog"></i> <span data-i18n="how_we_use">3. How We Use Your Information</span></h2>
            <p data-i18n="use_text">We use the information we collect to:</p>
            <ul>
              <li data-i18n="process_orders">Process and fulfill your orders</li>
              <li data-i18n="communicate_orders">Communicate with you about your orders and account</li>
              <li data-i18n="marketing">Send you marketing communications (with your consent)</li>
              <li data-i18n="improve_site">Improve our website and customer experience</li>
              <li data-i18n="prevent_fraud">Prevent fraudulent transactions</li>
              <li data-i18n="legal_obligations">Comply with legal obligations</li>
            </ul>
          </section>
          
          <!-- Information Sharing -->
          <section id="sharing" class="privacy-section" data-animate="fadeInUp" data-delay="300">
            <h2><i class="fas fa-share-alt"></i> <span data-i18n="sharing_info">4. Sharing Your Information</span></h2>
            <p data-i18n="sharing_text">We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul>
              <li><strong data-i18n="service_providers">Service Providers:</strong> <span data-i18n="service_providers_text">Payment processors, shipping carriers, and marketing platforms that help us operate our business</span></li>
              <li><strong data-i18n="legal_requirements">Legal Requirements:</strong> <span data-i18n="legal_requirements_text">When required by law or to protect our rights</span></li>
              <li><strong data-i18n="business_transfers">Business Transfers:</strong> <span data-i18n="business_transfers_text">In connection with a merger, acquisition, or sale of assets</span></li>
            </ul>
            
            <div class="badge-container">
              <span class="privacy-badge"><i class="fas fa-shield-alt"></i> <span data-i18n="never_sold">Never Sold</span></span>
              <span class="privacy-badge"><i class="fas fa-lock"></i> <span data-i18n="encrypted">256-bit Encrypted</span></span>
              <span class="privacy-badge"><i class="fas fa-user-secret"></i> <span data-i18n="gdpr_compliant">GDPR Compliant</span></span>
            </div>
          </section>
          
          <!-- Data Security -->
          <section id="security" class="privacy-section" data-animate="fadeInUp" data-delay="350">
            <h2><i class="fas fa-shield-alt"></i> <span data-i18n="data_security">5. Data Security</span></h2>
            <p data-i18n="security_text">We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
            
            <div class="badge-container">
              <span class="privacy-badge"><i class="fas fa-check-circle"></i> <span data-i18n="ssl_encrypted">SSL/TLS Encrypted</span></span>
              <span class="privacy-badge"><i class="fas fa-check-circle"></i> <span data-i18n="pci_compliant">PCI DSS Compliant</span></span>
              <span class="privacy-badge"><i class="fas fa-check-circle"></i> <span data-i18n="regular_audits">Regular Security Audits</span></span>
            </div>
          </section>
          
          <!-- Your Rights -->
          <section id="rights" class="privacy-section" data-animate="fadeInUp" data-delay="400">
            <h2><i class="fas fa-gavel"></i> <span data-i18n="your_rights">6. Your Rights</span></h2>
            <p data-i18n="rights_text">You have the right to:</p>
            <ul>
              <li data-i18n="access_data">Access, correct, or delete your personal information</li>
              <li data-i18n="opt_out">Opt-out of marketing communications</li>
              <li data-i18n="request_data">Request a copy of your data</li>
              <li data-i18n="withdraw_consent">Withdraw consent at any time</li>
            </ul>
            <p data-i18n="rights_contact">To exercise these rights, please contact us at privacy@madhavprajapati.art</p>
          </section>
          
          <!-- Cookies and Tracking -->
          <section id="cookies" class="privacy-section" data-animate="fadeInUp" data-delay="450">
            <h2><i class="fas fa-cookie-bite"></i> <span data-i18n="cookies">7. Cookies and Tracking</span></h2>
            <p data-i18n="cookies_text">We use cookies and similar tracking technologies to enhance your browsing experience. You can control cookies through your browser settings. Essential cookies are required for the website to function properly.</p>
            
            <div class="info-box">
              <i class="fas fa-info-circle"></i> <span data-i18n="cookie_control">You can set your browser to refuse all or some browser cookies. If you disable or refuse cookies, some parts of this website may become inaccessible.</span>
            </div>
          </section>
          
          <!-- Children's Privacy -->
          <section class="privacy-section" data-animate="fadeInUp" data-delay="500">
            <h2><i class="fas fa-child"></i> <span data-i18n="children_privacy">8. Children's Privacy</span></h2>
            <p data-i18n="children_text">Our website is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </section>
          
          <!-- Changes to This Policy -->
          <section class="privacy-section" data-animate="fadeInUp" data-delay="550">
            <h2><i class="fas fa-sync-alt"></i> <span data-i18n="policy_changes">9. Changes to This Policy</span></h2>
            <p data-i18n="changes_text">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. The current version is effective from ${this.lastUpdated}.</p>
          </section>
          
          <!-- Contact Us -->
          <section id="contact" class="privacy-section" data-animate="fadeInUp" data-delay="600">
            <h2><i class="fas fa-envelope"></i> <span data-i18n="contact_us_title">10. Contact Us</span></h2>
            <p data-i18n="contact_privacy_text">If you have questions about this Privacy Policy, please contact our Data Protection Officer at:</p>
            
            <div class="contact-address">
              <p><i class="fas fa-building"></i> <strong>Madhav Prajapati Art</strong></p>
              <p><i class="fas fa-map-marker-alt"></i> <span data-i18n="bagwali_address">Bagwali, Panchkula, Haryana 134113</span></p>
              <p><i class="fas fa-phone"></i> <a href="tel:+919876543210">+91 98765 43210</a></p>
              <p><i class="fas fa-envelope"></i> <a href="mailto:privacy@madhavprajapati.art">privacy@madhavprajapati.art</a></p>
              <p><i class="fas fa-globe"></i> <a href="https://madhavprajapati.art" target="_blank">https://madhavprajapati.art</a></p>
            </div>
            
            <p style="margin-top: 1.5rem; font-style: italic;" data-i18n="acknowledgement">By using our website, you acknowledge that you have read and understood this Privacy Policy.</p>
          </section>
        </div>
        
        <!-- Footer Note -->
        <div class="privacy-footer" data-animate="fadeInUp" data-delay="650">
          <p><i class="fas fa-heart" style="color: #D4AF37;"></i> <span data-i18n="crafted_by">Handcrafted with ❤️ in Bagwali, Panchkula</span></p>
          <p>© ${this.currentYear} Madhav Prajapati Art. <span data-i18n="all_rights_reserved">All rights reserved.</span></p>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('.toc-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Get section by ID
   */
  getSection(id) {
    return this.container.querySelector(`#${id}`);
  }

  /**
   * Scroll to section
   */
  scrollToSection(id) {
    const section = this.getSection(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Print privacy policy
   */
  print() {
    window.print();
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 PrivacyPage destroyed');
  }
}

// ============================================
// ADDITIONAL STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .privacy-footer {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(212,175,55,0.2);
    color: #666;
    font-size: 0.9rem;
  }
  
  .privacy-footer p {
    margin-bottom: 0.5rem;
  }
  
  @media (prefers-color-scheme: dark) {
    .privacy-footer {
      border-top-color: rgba(255,255,255,0.1);
      color: #999;
    }
  }
`;

document.head.appendChild(style);