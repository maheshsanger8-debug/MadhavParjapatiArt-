import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// FAQ PAGE - Complete FAQ Component with Search & Categories
// For Madhav Prajapati Art - Handcrafted Clay Diyas
// ============================================

export class FAQPage {
  constructor(container) {
    this.container = container;
    this.faqs = {
      shipping: [
        {
          question: "What are your shipping charges?",
          answer: "Standard shipping costs ₹50. Free shipping is available on orders above ₹999. Express shipping costs ₹100 for delivery within 2-3 business days. We ship to all locations across India from our studio in Bagwali, Panchkula."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 5-7 business days. Express delivery takes 2-3 business days. International shipping takes 10-15 business days depending on the destination and customs clearance."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship worldwide from Bagwali, Panchkula. International shipping charges vary by destination and will be calculated at checkout. Please note that customs duties may apply and are the responsibility of the customer."
        },
        {
          question: "Can I track my order?",
          answer: "Yes, once your order is shipped from our Bagwali studio, you will receive a tracking number via email and SMS. You can also track your order in the 'My Orders' section of your account."
        },
        {
          question: "Do you offer free shipping?",
          answer: "Yes, we offer free standard shipping on all orders above ₹999 within India. This is automatically applied at checkout."
        }
      ],
      products: [
        {
          question: "Are your diyas handmade?",
          answer: "Yes, every diya is 100% handmade by skilled artisans in Bagwali, Panchkula using traditional techniques passed down through generations. Each piece is unique and carries the imprint of its creator."
        },
        {
          question: "What materials do you use?",
          answer: "We use premium alluvial clay sourced locally. Our colors are made from natural pigments and are completely eco-friendly. Gold accents are applied using food-grade gold leaf for a luxurious finish."
        },
        {
          question: "Do you offer custom designs?",
          answer: "Yes, we accept custom orders for weddings, corporate events, and special occasions. Please contact us through our contact page with your requirements and we'll get back to you within 24 hours."
        },
        {
          question: "Are the diyas waterproof?",
          answer: "Our diyas are water-resistant but not completely waterproof. We recommend keeping them away from direct water exposure to maintain their beauty. Wipe gently with a dry cloth if needed."
        },
        {
          question: "What sizes do you offer?",
          answer: "Our diyas come in various sizes - small (2-3 inches), medium (4-5 inches), and large (6-8 inches). Custom sizes are available on request."
        }
      ],
      orders: [
        {
          question: "How can I place an order?",
          answer: "You can place an order directly through our website. Simply add items to your cart, proceed to checkout, and complete the payment process. You'll need to create an account or log in to place an order."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking (all major banks), and Cash on Delivery (for orders under ₹5000)."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Please contact us immediately if you need to modify your order. Changes are possible within 2 hours of placing the order. After that, the order enters processing and cannot be modified."
        },
        {
          question: "Is Cash on Delivery (COD) available?",
          answer: "Yes, Cash on Delivery is available for orders under ₹5000. A nominal convenience fee of ₹30 applies for COD orders."
        },
        {
          question: "How do I know if my order is confirmed?",
          answer: "After placing your order, you'll receive an order confirmation email with your order details. You can also check your order status in the 'My Orders' section of your account."
        }
      ],
      returns: [
        {
          question: "What is your return policy?",
          answer: "We accept returns within 7 days of delivery. Items must be unused and in original packaging. Custom orders cannot be returned unless defective. Please contact our support team to initiate a return."
        },
        {
          question: "How do I initiate a return?",
          answer: "Log in to your account, go to 'My Orders', select the order, and click on 'Return Item'. You can also contact our support team via email or phone to initiate a return from our Bagwali studio."
        },
        {
          question: "When will I get my refund?",
          answer: "Refunds are processed within 5-7 business days after we receive and inspect the returned item at our Bagwali facility. Refunds are credited to the original payment method. For COD orders, refunds are processed via bank transfer."
        },
        {
          question: "Do you offer exchanges?",
          answer: "Yes, we offer exchanges for size or design variations. Please initiate a return and place a new order for the desired item. We'll process your refund once we receive the returned item."
        },
        {
          question: "What if I receive a damaged item?",
          answer: "If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange a replacement or full refund immediately."
        }
      ],
      care: [
        {
          question: "How do I clean my diya?",
          answer: "Gently wipe with a soft, dry cloth. Do not use water or cleaning chemicals. For tough stains, use a slightly damp cloth and dry immediately. Avoid scrubbing as it may damage the paint."
        },
        {
          question: "Can I use oils in the diya?",
          answer: "Yes, you can use ghee, camphor, or diya oils. Avoid using synthetic oils as they may damage the clay. Always place the diya on a heat-resistant surface when lit."
        },
        {
          question: "How should I store unused diyas?",
          answer: "Store in a cool, dry place away from direct sunlight. Wrap in tissue paper or cotton cloth to protect from dust. Avoid stacking heavy items on top of them."
        },
        {
          question: "Are the diyas microwave safe?",
          answer: "No, our clay diyas are not microwave safe. They are designed for traditional lighting with wicks and oil/ghee. Do not use them in microwave or oven."
        },
        {
          question: "How long do the diyas last?",
          answer: "With proper care, our diyas can last for years. They are durable and can be reused many times. Store them carefully between uses."
        }
      ]
    };
    
    this.filteredFaqs = { ...this.faqs };
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.init();
  }

  /**
   * Initialize FAQ page
   */
  init() {
    this.render();
    this.initEventListeners();
    this.initAnimations();
    console.log('✅ FAQPage initialized with Bagwali, Panchkula address');
  }

  /**
   * Render FAQ page
   */
  render() {
    this.container.innerHTML = `
      <div class="faq-page">
        <div class="faq-header">
          <h1 class="page-title" data-i18n="faq_title">Frequently Asked Questions</h1>
          <p class="page-subtitle" data-i18n="faq_subtitle">Find answers to common questions about our products and services</p>
        </div>
        
        <!-- Search Bar -->
        <div class="faq-search" data-animate="fadeInDown">
          <i class="fas fa-search"></i>
          <input 
            type="search" 
            id="faqSearch" 
            placeholder="Search FAQs..." 
            data-i18n-placeholder="search_faqs"
            value="${this.searchQuery}"
          >
        </div>
        
        <!-- Category Tabs -->
        <div class="faq-categories" data-animate="fadeInUp" data-delay="100">
          <button class="category-tab ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
            <i class="fas fa-border-all"></i> <span data-i18n="all_questions">All Questions</span>
          </button>
          <button class="category-tab ${this.currentCategory === 'shipping' ? 'active' : ''}" data-category="shipping">
            <i class="fas fa-truck"></i> <span data-i18n="shipping_delivery">Shipping</span>
          </button>
          <button class="category-tab ${this.currentCategory === 'products' ? 'active' : ''}" data-category="products">
            <i class="fas fa-box"></i> <span data-i18n="products_materials">Products</span>
          </button>
          <button class="category-tab ${this.currentCategory === 'orders' ? 'active' : ''}" data-category="orders">
            <i class="fas fa-shopping-cart"></i> <span data-i18n="orders_payments">Orders</span>
          </button>
          <button class="category-tab ${this.currentCategory === 'returns' ? 'active' : ''}" data-category="returns">
            <i class="fas fa-undo"></i> <span data-i18n="returns_refunds">Returns</span>
          </button>
          <button class="category-tab ${this.currentCategory === 'care' ? 'active' : ''}" data-category="care">
            <i class="fas fa-heart"></i> <span data-i18n="care_instructions">Care</span>
          </button>
        </div>
        
        <!-- FAQ Sections Container -->
        <div id="faqSections" class="faq-sections">
          ${this.renderFAQSections()}
        </div>
        
        <!-- No Results Message -->
        <div id="noResults" class="no-results" style="display: none;" data-animate="fadeIn">
          <i class="fas fa-search"></i>
          <h3 data-i18n="no_questions">No questions found</h3>
          <p data-i18n="adjust_search">Try adjusting your search or browse by category</p>
        </div>
        
        <!-- Contact Section -->
        <div class="faq-contact" data-animate="fadeInUp" data-delay="200">
          <h3 data-i18n="still_have_questions">Still have questions?</h3>
          <p data-i18n="contact_us_prompt">Can't find the answer you're looking for? Please contact our support team in Bagwali, Panchkula.</p>
          <div class="faq-contact-actions">
            <a href="#contact" class="btn btn-primary" data-nav>
              <i class="fas fa-envelope"></i> <span data-i18n="contact_us">Contact Us</span>
            </a>
            <a href="https://wa.me/919876543210" class="btn btn-outline" target="_blank">
              <i class="fab fa-whatsapp"></i> <span data-i18n="whatsapp">WhatsApp</span>
            </a>
            <a href="tel:+919876543210" class="btn btn-outline">
              <i class="fas fa-phone"></i> <span data-i18n="call_us">Call Us</span>
            </a>
          </div>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Render FAQ sections
   */
  renderFAQSections() {
    let html = '';
    
    // Only render sections that have visible items
    const categories = ['shipping', 'products', 'orders', 'returns', 'care'];
    
    categories.forEach(category => {
      const faqs = this.filteredFaqs[category] || [];
      const filteredFaqs = this.filterFAQsBySearch(faqs);
      
      if (filteredFaqs.length > 0 && (this.currentCategory === 'all' || this.currentCategory === category)) {
        html += `
          <div class="faq-section" data-category="${category}" data-animate="fadeInUp">
            <h2><i class="fas ${this.getCategoryIcon(category)}"></i> ${this.getCategoryTitle(category)}</h2>
            <div class="faq-grid">
              ${filteredFaqs.map((faq, index) => this.renderFAQItem(faq, index)).join('')}
            </div>
          </div>
        `;
      }
    });
    
    return html;
  }

  /**
   * Render single FAQ item
   */
  renderFAQItem(faq, index) {
    const itemId = `faq-${index}-${Date.now()}`;
    return `
      <div class="faq-item" data-animate="fadeInUp" data-delay="${index * 50}">
        <button class="faq-question" aria-expanded="false" aria-controls="${itemId}">
          <span>${faq.question}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="faq-answer" id="${itemId}">
          <p>${faq.answer}</p>
          ${faq.question.includes('shipping') ? '<p class="note">📍 Shipping from Bagwali, Panchkula</p>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Filter FAQs by search query
   */
  filterFAQsBySearch(faqs) {
    if (!this.searchQuery.trim()) return faqs;
    
    const query = this.searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Category tabs
    const categoryBtns = document.querySelectorAll('.category-tab');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.filterByCategory();
      });
    });

    // Accordion functionality
    this.initAccordion();

    // Search input with debounce
    const searchInput = document.getElementById('faqSearch');
    let searchTimeout;
    
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value;
        this.filterByCategory();
      }, 300);
    });

    // Clear search button (if we add one)
    const clearBtn = document.querySelector('.clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchQuery = '';
          this.filterByCategory();
        }
      });
    }
  }

  /**
   * Initialize accordion functionality
   */
  initAccordion() {
    const faqItems = document.querySelectorAll('.faq-question');
    
    faqItems.forEach(btn => {
      // Remove existing listeners to prevent duplicates
      btn.removeEventListener('click', this.handleAccordionClick);
      btn.addEventListener('click', this.handleAccordionClick);
    });
  }

  /**
   * Handle accordion click
   */
  handleAccordionClick = (e) => {
    const btn = e.currentTarget;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.nextElementSibling;
    
    // Close all other open items (optional - comment out if you want multiple open)
    // document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(otherBtn => {
    //   if (otherBtn !== btn) {
    //     otherBtn.setAttribute('aria-expanded', 'false');
    //     otherBtn.nextElementSibling.style.maxHeight = '0';
    //   }
    // });
    
    btn.setAttribute('aria-expanded', !expanded);
    
    if (answer) {
      if (!expanded) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // Animate icon
        btn.querySelector('i').style.transform = 'rotate(180deg)';
      } else {
        answer.style.maxHeight = '0';
        btn.querySelector('i').style.transform = 'rotate(0deg)';
      }
    }
  }

  /**
   * Filter by category and search
   */
  filterByCategory() {
    const sections = document.querySelectorAll('.faq-section');
    let hasVisibleSections = false;
    
    sections.forEach(section => {
      const category = section.dataset.category;
      const faqItems = section.querySelectorAll('.faq-item');
      let visibleCount = 0;
      
      // Check each item in this section
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        const matchesSearch = !this.searchQuery || 
                             question.includes(this.searchQuery.toLowerCase()) || 
                             answer.includes(this.searchQuery.toLowerCase());
        
        if (matchesSearch) {
          item.style.display = 'block';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });
      
      // Show/hide section based on category and visible items
      const shouldShowCategory = this.currentCategory === 'all' || this.currentCategory === category;
      const hasVisibleItems = visibleCount > 0;
      
      if (shouldShowCategory && hasVisibleItems) {
        section.style.display = 'block';
        hasVisibleSections = true;
      } else {
        section.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.style.display = hasVisibleSections ? 'none' : 'block';
    }
    
    // Re-initialize accordion for new items
    this.initAccordion();
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      shipping: 'fa-truck',
      products: 'fa-box',
      orders: 'fa-shopping-cart',
      returns: 'fa-undo',
      care: 'fa-heart'
    };
    return icons[category] || 'fa-question-circle';
  }

  /**
   * Get category title
   */
  getCategoryTitle(category) {
    const titles = {
      shipping: 'Shipping & Delivery',
      products: 'Products & Materials',
      orders: 'Orders & Payments',
      returns: 'Returns & Refunds',
      care: 'Care Instructions'
    };
    return titles[category] || category;
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    
    // Update UI
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) searchInput.value = '';
    
    const categoryBtns = document.querySelectorAll('.category-tab');
    categoryBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });
    
    this.filterByCategory();
  }

  /**
   * Expand all FAQs
   */
  expandAll() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.click();
      }
    });
  }

  /**
   * Collapse all FAQs
   */
  collapseAll() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      if (btn.getAttribute('aria-expanded') === 'true') {
        btn.click();
      }
    });
  }

  /**
   * Get FAQ count
   */
  getFAQCount() {
    let count = 0;
    Object.values(this.faqs).forEach(category => {
      count += category.length;
    });
    return count;
  }

  /**
   * Get category counts
   */
  getCategoryCounts() {
    const counts = {};
    Object.entries(this.faqs).forEach(([category, faqs]) => {
      counts[category] = faqs.length;
    });
    return counts;
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 FAQPage destroyed');
  }
}

// ============================================
// ADDITIONAL FAQ UTILITIES
// ============================================

/**
 * FAQ Search Utility
 */
export class FAQSearch {
  constructor(faqs) {
    this.faqs = faqs;
  }

  search(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(this.faqs).forEach(([category, questions]) => {
      questions.forEach(faq => {
        if (faq.question.toLowerCase().includes(searchTerm) || 
            faq.answer.toLowerCase().includes(searchTerm)) {
          results.push({
            ...faq,
            category,
            categoryTitle: this.getCategoryTitle(category)
          });
        }
      });
    });
    
    return results;
  }

  getCategoryTitle(category) {
    const titles = {
      shipping: 'Shipping & Delivery',
      products: 'Products & Materials',
      orders: 'Orders & Payments',
      returns: 'Returns & Refunds',
      care: 'Care Instructions'
    };
    return titles[category] || category;
  }
}

// ============================================
// ADD CSS STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .note {
    font-size: 0.85rem;
    color: #D4AF37;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(212,175,55,0.3);
  }
  
  .faq-question i {
    transition: transform 0.3s ease;
  }
  
  .faq-question[aria-expanded="true"] i {
    transform: rotate(180deg);
  }
  
  @media (prefers-color-scheme: dark) {
    .note {
      color: #FFD700;
      border-top-color: rgba(255,215,0,0.2);
    }
  }
`;

document.head.appendChild(style);