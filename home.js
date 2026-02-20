import { i18n } from './i18n.js';
import { firestoreService } from './firestore.js';
import { ProductCard } from './product-card.js';
import { animationManager } from './animations.js';
import { currencyFormatter } from './currency.js';

// ============================================
// HOME PAGE - Complete Home Component with Static Fallback
// Bagwali, Panchkula - Handcrafted Clay Diyas
// ============================================

export class HomePage {
  constructor(container) {
    this.container = container;
    this.featuredProducts = [];
    this.categories = [
      { id: 'diwali', name: 'Diwali Special', icon: '🪔', image: 'https://images.pexels.com/photos/5722907/pexels-photo-5722907.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'wedding', name: 'Wedding Diyas', icon: '💍', image: 'https://images.pexels.com/photos/5425041/pexels-photo-5425041.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'temple', name: 'Temple Diyas', icon: '🛕', image: 'https://images.pexels.com/photos/461937/pexels-photo-461937.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'decorative', name: 'Decorative', icon: '🎨', image: 'https://images.pexels.com/photos/5425051/pexels-photo-5425051.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'custom', name: 'Custom Orders', icon: '✨', image: 'https://images.pexels.com/photos/3829228/pexels-photo-3829228.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ];
    this.testimonials = [
      {
        text: "Absolutely stunning craftsmanship! These diyas made our Diwali celebration truly special. The gold accents are beautiful.",
        author: "Priya Sharma",
        location: "Mumbai",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        rating: 5
      },
      {
        text: "Ordered custom diyas for my wedding. They exceeded all expectations! Each piece is unique and beautifully handcrafted.",
        author: "Rahul Mehta",
        location: "Delhi",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 5
      },
      {
        text: "The quality is exceptional. You can feel the love and tradition in every diya. Will definitely order again!",
        author: "Anjali Desai",
        location: "Ahmedabad",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        rating: 5
      }
    ];
    this.init();
  }

  /**
   * Initialize home page
   */
  async init() {
    this.render();
    await this.loadFeaturedProducts();
    this.initAnimations();
    console.log('✅ HomePage initialized from Bagwali, Panchkula');
  }

  /**
   * Render home page
   */
  render() {
    this.container.innerHTML = `
      <!-- Hero Section -->
      <section class="hero" data-animate="fadeIn">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="text-gradient" data-i18n="hero_title">Handcrafted Clay Diyas</span>
          </h1>
          <p class="hero-subtitle" data-i18n="hero_subtitle">
            Illuminate your space with artisanal traditions, reimagined for modern luxury
          </p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-large" data-nav data-href="products" data-i18n="explore">
              <i class="fas fa-search"></i> Explore Collection
            </button>
            <button class="btn btn-outline btn-large" data-nav data-href="about" data-i18n="our_story">
              <i class="fas fa-info-circle"></i> Our Story
            </button>
          </div>
        </div>
        <div class="hero-background">
          <div class="floating-diyas">
            ${Array(5).fill().map(() => '<span class="floating-diya">🪔</span>').join('')}
          </div>
        </div>
      </section>
      
      <!-- Featured Products Section -->
      <section class="featured-section" data-animate="fadeInUp" data-delay="100">
        <div class="section-header">
          <h2 class="section-title" data-i18n="featured_diyas">
            <i class="fas fa-star"></i> Featured Diyas
          </h2>
          <p class="section-subtitle" data-i18n="curated_selections">
            Curated selections from our master artisans in Bagwali, Panchkula
          </p>
        </div>
        <div id="featured-products" class="product-grid">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p data-i18n="loading_products">Loading beautiful diyas...</p>
          </div>
        </div>
      </section>
      
      <!-- Categories Section -->
      <section class="categories-section" data-animate="fadeInUp" data-delay="200">
        <div class="section-header">
          <h2 class="section-title" data-i18n="shop_by_category">
            <i class="fas fa-th-large"></i> Shop by Category
          </h2>
          <p class="section-subtitle" data-i18n="discover_collections">
            Discover our collections from Bagwali, Panchkula
          </p>
        </div>
        <div class="categories-grid">
          ${this.categories.map((cat, index) => `
            <div class="category-card" data-nav data-href="products?category=${cat.id}" data-animate="fadeInUp" data-delay="${300 + index * 50}">
              <div class="category-image">
                <img src="${cat.image}" alt="${cat.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/600x600/F5E6CA/D4AF37?text=${cat.icon}'">
                <div class="category-overlay">
                  <span class="category-icon">${cat.icon}</span>
                </div>
              </div>
              <h3>${cat.name}</h3>
            </div>
          `).join('')}
        </div>
      </section>
      
      <!-- Festival Banner -->
      <section class="festival-banner" data-animate="scaleIn" data-delay="400">
        <div class="banner-content">
          <h2 data-i18n="diwali_offer">✨ Diwali Festival Offer ✨</h2>
          <p data-i18n="offer_details">Get 20% off on all premium diyas + Free shipping on orders above ₹999</p>
          <div class="banner-cta">
            <button class="btn btn-primary" data-nav data-href="products?category=diwali" data-i18n="shop_now">
              <i class="fas fa-gift"></i> Shop Now
            </button>
            <button class="btn btn-outline" data-nav data-href="products">
              <i class="fas fa-eye"></i> View All
            </button>
          </div>
        </div>
      </section>
      
      <!-- Testimonials Section -->
      <section class="testimonials" data-animate="fadeInUp" data-delay="500">
        <div class="section-header">
          <h2 class="section-title" data-i18n="from_patrons">
            <i class="fas fa-heart"></i> From Our Patrons
          </h2>
          <p class="section-subtitle" data-i18n="loved_worldwide">
            Loved by customers worldwide
          </p>
        </div>
        <div class="testimonials-slider">
          ${this.testimonials.map((testimonial, index) => `
            <div class="testimonial-card" data-animate="fadeInUp" data-delay="${600 + index * 100}">
              <div class="testimonial-rating">
                ${this.renderRating(testimonial.rating)}
              </div>
              <p class="testimonial-text">"${testimonial.text}"</p>
              <div class="testimonial-author">
                <img src="${testimonial.avatar}" alt="${testimonial.author}" class="author-avatar" loading="lazy" onerror="this.src='https://via.placeholder.com/60x60/D4AF37/FFFFFF?text=${testimonial.author.charAt(0)}'">
                <div class="author-info">
                  <h4>${testimonial.author}</h4>
                  <p><i class="fas fa-map-marker-alt"></i> ${testimonial.location}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      
      <!-- Craftsmanship Banner -->
      <section class="craftsmanship-banner" data-animate="fadeInUp" data-delay="700">
        <div class="craftsmanship-content">
          <div class="craftsmanship-text">
            <h2 data-i18n="handcrafted_with_love">Handcrafted with Love in Bagwali, Panchkula</h2>
            <p data-i18n="craftsmanship_text">Each diya is meticulously shaped, sun-dried for 48 hours, and finished with natural dyes by our skilled artisans.</p>
            <button class="btn btn-primary" data-nav data-href="about">
              <i class="fas fa-feather-alt"></i> <span data-i18n="learn_more">Learn More</span>
            </button>
          </div>
          <div class="craftsmanship-image">
            <img src="https://images.pexels.com/photos/5998519/pexels-photo-5998519.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Artisan at work" loading="lazy" onerror="this.style.display='none'">
          </div>
        </div>
      </section>
      
      <!-- Stats Section -->
      <section class="stats-section" data-animate="fadeInUp" data-delay="800">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">50+</span>
            <span class="stat-label" data-i18n="artisans">Skilled Artisans</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">10K+</span>
            <span class="stat-label" data-i18n="diyas_sold">Diyas Sold</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">4</span>
            <span class="stat-label" data-i18n="generations">Generations</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">100%</span>
            <span class="stat-label" data-i18n="handmade">Handmade</span>
          </div>
        </div>
      </section>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Load featured products from Firestore
   */
  async loadFeaturedProducts() {
    try {
      const result = await firestoreService.getProducts({ 
        limit: 4,
        activeOnly: true,
        sortBy: 'newest'
      });
      
      const container = document.getElementById('featured-products');
      if (!container) return;
      
      if (!result.success || result.products.length === 0) {
        // Show static fallback products
        this.renderStaticFeaturedProducts(container);
        return;
      }
      
      this.featuredProducts = result.products;
      container.innerHTML = '';
      
      this.featuredProducts.slice(0, 4).forEach(product => {
        const card = new ProductCard(product);
        container.appendChild(card.render());
      });
      
    } catch (error) {
      console.error('Error loading featured products:', error);
      const container = document.getElementById('featured-products');
      if (container) {
        this.renderStaticFeaturedProducts(container);
      }
    }
  }

  /**
   * Render static featured products (fallback)
   */
  renderStaticFeaturedProducts(container) {
    const staticProducts = [
      {
        id: 'static-1',
        name: 'Premium Gold Diya',
        price: 899,
        originalPrice: 1299,
        rating: 4.5,
        reviews: 24,
        images: ['https://m.media-amazon.com/images/I/71J8vH-tSaL._SL1500_.jpg'],
        badge: 'Best Seller'
      },
      {
        id: 'static-2',
        name: 'Wedding Special Diya Set',
        price: 1499,
        rating: 5,
        reviews: 8,
        images: ['https://m.media-amazon.com/images/I/71nIRVv8XzL._SL1500_.jpg'],
        badge: 'New'
      },
      {
        id: 'static-3',
        name: 'Temple Diya (Large)',
        price: 594,
        originalPrice: 699,
        rating: 4,
        reviews: 12,
        images: ['https://images.pexels.com/photos/5722907/pexels-photo-5722907.jpeg?auto=compress&cs=tinysrgb&w=600'],
        badge: '-15%'
      },
      {
        id: 'static-4',
        name: 'Decorative Peacock Diya',
        price: 1199,
        rating: 5,
        reviews: 32,
        images: ['https://images.pexels.com/photos/5425041/pexels-photo-5425041.jpeg?auto=compress&cs=tinysrgb&w=600'],
        badge: 'Limited'
      }
    ];

    container.innerHTML = '';
    staticProducts.forEach(product => {
      const card = new ProductCard(product);
      container.appendChild(card.render());
    });
  }

  /**
   * Render rating stars
   */
  renderRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && hasHalf) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 HomePage destroyed');
  }
}

// ============================================
// ADDITIONAL HOME PAGE STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .craftsmanship-banner {
    background: white;
    border-radius: 24px;
    padding: 2rem;
    margin: 3rem auto;
    max-width: 1200px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
    border: 1px solid rgba(212,175,55,0.1);
  }

  .craftsmanship-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
  }

  .craftsmanship-text h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #0F0F0F;
    margin-bottom: 1rem;
  }

  .craftsmanship-text p {
    color: #666;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  .craftsmanship-image img {
    width: 100%;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .stats-section {
    background: linear-gradient(135deg, #FEF9E7, #FFFDF7);
    padding: 3rem 2rem;
    margin: 3rem auto;
    border-radius: 24px;
    max-width: 1200px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    text-align: center;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #D4AF37;
  }

  .stat-label {
    font-size: 0.95rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .category-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(255,140,66,0.2));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .category-card:hover .category-overlay {
    opacity: 1;
  }

  .category-icon {
    font-size: 3rem;
    background: rgba(255,255,255,0.9);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .testimonial-rating {
    color: #D4AF37;
    margin-bottom: 1rem;
  }

  .testimonial-rating i {
    margin-right: 2px;
  }

  @media (max-width: 768px) {
    .craftsmanship-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .stat-number {
      font-size: 2rem;
    }
  }

  @media (prefers-color-scheme: dark) {
    .craftsmanship-banner,
    .stats-section {
      background: #1A1A1A;
      border-color: rgba(212,175,55,0.1);
    }

    .craftsmanship-text h2 {
      color: #FFFFFF;
    }

    .craftsmanship-text p {
      color: #CCCCCC;
    }

    .stat-label {
      color: #CCCCCC;
    }
  }
`;

document.head.appendChild(style);