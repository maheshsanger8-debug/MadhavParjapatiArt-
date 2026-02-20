// ============================================
// MADHAV PRAJAPATI ART - ANIMATION LIBRARY
// Premium animations for luxury eCommerce experience
// ============================================

/**
 * AnimationManager - Centralized animation controller
 * Handles scroll animations, hover effects, page transitions,
 * Diya lighting effects, and festive animations
 */
export class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.observers = [];
    this.isDiwaliMode = localStorage.getItem('diwaliMode') === 'true';
    this.init();
  }

  /**
   * Initialize all animations
   */
  init() {
    this.initScrollAnimations();
    this.initHoverAnimations();
    this.initPageTransitions();
    this.initDiyaAnimations();
    
    if (this.isDiwaliMode) {
      this.enableDiwaliMode();
    }
    
    console.log('✨ AnimationManager initialized');
  }

  /**
   * ===== SCROLL ANIMATIONS =====
   * Fade in elements as they enter viewport
   */
  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.animation || 'fadeInUp';
          const delay = element.dataset.delay || 0;
          const duration = element.dataset.duration || 600;
          
          setTimeout(() => {
            element.classList.add('animated', animation);
            element.style.animationDuration = `${duration}ms`;
          }, delay);
          
          // Unobserve after animation
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    this.observers.push(observer);
    this.animations.set('scroll', observer);
  }

  /**
   * ===== HOVER ANIMATIONS =====
   * Smooth hover effects for cards, buttons, images
   */
  initHoverAnimations() {
    // Product cards hover effect
    document.querySelectorAll('.product-card, .mission-card, .value-item, .craft-step').forEach(el => {
      el.classList.add('hover-lift');
    });

    // Buttons hover effect
    document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-icon').forEach(el => {
      el.classList.add('hover-glow');
    });

    // Image zoom on hover
    document.querySelectorAll('.product-image, .about-image, .category-image').forEach(el => {
      el.classList.add('hover-zoom');
    });

    // Link underline animation
    document.querySelectorAll('.nav-link, .footer a, .quick-link-item a').forEach(el => {
      el.classList.add('hover-underline');
    });
  }

  /**
   * ===== PAGE TRANSITIONS =====
   * Smooth page transitions between routes
   */
  initPageTransitions() {
    // Add transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #D4AF37, #FF8C42);
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s ease;
    `;
    document.body.appendChild(overlay);
    this.animations.set('transitionOverlay', overlay);

    // Handle page transitions
    window.addEventListener('beforeunload', () => {
      overlay.style.opacity = '1';
    });
  }

  /**
   * ===== DIYA ANIMATIONS =====
   * Virtual diya lighting effects
   */
  initDiyaAnimations() {
    // Add CSS keyframes for diya animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes diyaFlicker {
        0% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,140,66,0.5)); }
        25% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(255,140,66,0.8)); }
        50% { opacity: 0.9; transform: scale(0.95); filter: drop-shadow(0 0 20px rgba(212,175,55,0.6)); }
        75% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(212,175,55,0.9)); }
        100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,140,66,0.5)); }
      }
      
      @keyframes diyaFloat {
        0% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }
      
      @keyframes diyaGlow {
        0% { box-shadow: 0 0 5px rgba(212,175,55,0.3); }
        50% { box-shadow: 0 0 30px rgba(212,175,55,0.6); }
        100% { box-shadow: 0 0 5px rgba(212,175,55,0.3); }
      }
      
      .diya-flame {
        animation: diyaFlicker 1.5s infinite alternate;
      }
      
      .floating-diya {
        animation: diyaFloat 6s infinite ease-in-out;
      }
      
      .diya-glow {
        animation: diyaGlow 3s infinite;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * ===== FESTIVE ANIMATIONS =====
   * Diwali special effects
   */
  enableDiwaliMode() {
    this.isDiwaliMode = true;
    localStorage.setItem('diwaliMode', 'true');
    
    // Add floating diyas
    this.addFloatingDiyas();
    
    // Add sparkle effect
    this.addSparkleEffect();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('diwaliModeEnabled'));
    
    console.log('🪔 Diwali mode enabled');
  }

  disableDiwaliMode() {
    this.isDiwaliMode = false;
    localStorage.setItem('diwaliMode', 'false');
    
    // Remove floating diyas
    document.querySelectorAll('.floating-diya-animated').forEach(el => el.remove());
    
    // Remove sparkles
    document.querySelectorAll('.sparkle').forEach(el => el.remove());
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('diwaliModeDisabled'));
    
    console.log('🪔 Diwali mode disabled');
  }

  toggleDiwaliMode() {
    if (this.isDiwaliMode) {
      this.disableDiwaliMode();
    } else {
      this.enableDiwaliMode();
    }
  }

  /**
   * Add floating diyas to background
   */
  addFloatingDiyas(count = 15) {
    for (let i = 0; i < count; i++) {
      const diya = document.createElement('div');
      diya.className = 'floating-diya floating-diya-animated';
      diya.innerHTML = '🪔';
      diya.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${30 + Math.random() * 40}px;
        opacity: ${0.1 + Math.random() * 0.15};
        animation: diyaFloat ${15 + Math.random() * 20}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
        pointer-events: none;
        z-index: 1;
      `;
      document.body.appendChild(diya);
    }
  }

  /**
   * Add sparkle effect
   */
  addSparkleEffect() {
    const sparkleInterval = setInterval(() => {
      if (!this.isDiwaliMode) {
        clearInterval(sparkleInterval);
        return;
      }
      
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.innerHTML = '✨';
      sparkle.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${15 + Math.random() * 20}px;
        opacity: 0.8;
        animation: sparkleFade 1s ease-out forwards;
        pointer-events: none;
        z-index: 2;
      `;
      document.body.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 1000);
    }, 200);
    
    this.animations.set('sparkleInterval', sparkleInterval);
  }

  /**
   * ===== ANIMATE ELEMENT =====
   * Apply animation to specific element
   */
  animateElement(element, animation, duration = 600, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        element.classList.add('animated', animation);
        element.style.animationDuration = `${duration}ms`;
        
        setTimeout(() => {
          element.classList.remove('animated', animation);
          resolve();
        }, duration);
      }, delay);
    });
  }

  /**
   * ===== STAGGER ANIMATIONS =====
   * Animate multiple elements with stagger effect
   */
  staggerAnimate(elements, animation, staggerDelay = 100, baseDelay = 0) {
    return Promise.all(
      Array.from(elements).map((el, index) => 
        this.animateElement(el, animation, 600, baseDelay + (index * staggerDelay))
      )
    );
  }

  /**
   * ===== COUNT UP ANIMATION =====
   * Animate numbers counting up
   */
  countUp(element, start = 0, end = 100, duration = 2000) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = value;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    };
    window.requestAnimationFrame(step);
  }

  /**
   * ===== TYPING ANIMATION =====
   * Typewriter effect
   */
  typeWriter(element, text, speed = 50, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let i = 0;
        element.textContent = '';
        const typing = setInterval(() => {
          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
          } else {
            clearInterval(typing);
            resolve();
          }
        }, speed);
      }, delay);
    });
  }

  /**
   * ===== PARALLAX EFFECT =====
   * Smooth parallax scrolling
   */
  initParallax() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  /**
   * ===== LOADING ANIMATIONS =====
   * Skeleton loader animations
   */
  showSkeletonLoader(container, type = 'product') {
    let skeletonHTML = '';
    
    switch(type) {
      case 'product':
        skeletonHTML = `
          <div class="skeleton-product-grid">
            ${Array(4).fill().map(() => `
              <div class="skeleton-card">
                <div class="skeleton-image shimmer"></div>
                <div class="skeleton-line shimmer" style="width: 80%;"></div>
                <div class="skeleton-line shimmer" style="width: 60%;"></div>
                <div class="skeleton-line shimmer" style="width: 40%;"></div>
              </div>
            `).join('')}
          </div>
        `;
        break;
      case 'text':
        skeletonHTML = `
          <div class="skeleton-text">
            <div class="skeleton-line shimmer" style="width: 100%;"></div>
            <div class="skeleton-line shimmer" style="width: 90%;"></div>
            <div class="skeleton-line shimmer" style="width: 95%;"></div>
            <div class="skeleton-line shimmer" style="width: 70%;"></div>
          </div>
        `;
        break;
    }
    
    container.innerHTML = skeletonHTML;
  }

  hideSkeletonLoader(container) {
    container.innerHTML = '';
  }

  /**
   * ===== CLEANUP =====
   * Remove all observers and intervals
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.animations.forEach((value, key) => {
      if (typeof value === 'function') {
        // Handle intervals
        clearInterval(value);
      }
    });
    this.observers = [];
    this.animations.clear();
    
    // Remove transition overlay
    document.querySelector('.page-transition-overlay')?.remove();
    
    console.log('🧹 AnimationManager cleaned up');
  }
}

// ============================================
// CSS ANIMATION CLASSES
// ============================================

/**
 * Add animation CSS to document head
 */
export function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ===== FADE ANIMATIONS ===== */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* ===== SCALE ANIMATIONS ===== */
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes scaleOut {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }
    
    /* ===== SLIDE ANIMATIONS ===== */
    @keyframes slideInLeft {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
    
    @keyframes slideInUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @keyframes slideInDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    /* ===== ROTATE ANIMATIONS ===== */
    @keyframes rotateIn {
      from {
        opacity: 0;
        transform: rotate(-180deg);
      }
      to {
        opacity: 1;
        transform: rotate(0);
      }
    }
    
    @keyframes rotateOut {
      from {
        opacity: 1;
        transform: rotate(0);
      }
      to {
        opacity: 0;
        transform: rotate(180deg);
      }
    }
    
    /* ===== BOUNCE ANIMATIONS ===== */
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    
    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
      }
    }
    
    /* ===== PULSE ANIMATIONS ===== */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(212,175,55,0.4);
      }
      50% {
        box-shadow: 0 0 20px 10px rgba(212,175,55,0.2);
      }
    }
    
    /* ===== SHAKE ANIMATIONS ===== */
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }
    
    /* ===== SHIMMER EFFECT ===== */
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .shimmer {
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    /* ===== SPINNER ===== */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .spinner {
      animation: spin 0.8s linear infinite;
    }
    
    /* ===== HOVER EFFECTS ===== */
    .hover-lift {
      transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .hover-lift:hover {
      transform: translateY(-5px);
    }
    
    .hover-glow {
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }
    
    .hover-glow:hover {
      box-shadow: 0 8px 25px rgba(212,175,55,0.3);
    }
    
    .hover-zoom {
      overflow: hidden;
    }
    
    .hover-zoom img {
      transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    
    .hover-zoom:hover img {
      transform: scale(1.08);
    }
    
    .hover-underline {
      position: relative;
    }
    
    .hover-underline::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #D4AF37, #FF8C42);
      transition: width 0.3s ease;
    }
    
    .hover-underline:hover::after {
      width: 100%;
    }
    
    /* ===== ANIMATION CLASSES ===== */
    .animated {
      animation-duration: 0.6s;
      animation-fill-mode: both;
    }
    
    .fadeIn { animation-name: fadeIn; }
    .fadeInUp { animation-name: fadeInUp; }
    .fadeInDown { animation-name: fadeInDown; }
    .fadeInLeft { animation-name: fadeInLeft; }
    .fadeInRight { animation-name: fadeInRight; }
    .scaleIn { animation-name: scaleIn; }
    .scaleOut { animation-name: scaleOut; }
    .slideInLeft { animation-name: slideInLeft; }
    .slideInRight { animation-name: slideInRight; }
    .slideInUp { animation-name: slideInUp; }
    .slideInDown { animation-name: slideInDown; }
    .rotateIn { animation-name: rotateIn; }
    .rotateOut { animation-name: rotateOut; }
    .bounce { animation-name: bounce; animation-iteration-count: infinite; }
    .bounceIn { animation-name: bounceIn; }
    .pulse { animation-name: pulse; animation-iteration-count: infinite; }
    .pulseGlow { animation-name: pulseGlow; animation-iteration-count: infinite; }
    .shake { animation-name: shake; }
    
    /* ===== DELAY CLASSES ===== */
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
    .delay-500 { animation-delay: 500ms; }
    .delay-600 { animation-delay: 600ms; }
    .delay-700 { animation-delay: 700ms; }
    .delay-800 { animation-delay: 800ms; }
    .delay-900 { animation-delay: 900ms; }
    .delay-1000 { animation-delay: 1000ms; }
    
    /* ===== DURATION CLASSES ===== */
    .duration-300 { animation-duration: 300ms; }
    .duration-500 { animation-duration: 500ms; }
    .duration-800 { animation-duration: 800ms; }
    .duration-1000 { animation-duration: 1000ms; }
    .duration-1500 { animation-duration: 1500ms; }
    .duration-2000 { animation-duration: 2000ms; }
    
    /* ===== SKELETON LOADERS ===== */
    .skeleton-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }
    
    .skeleton-card {
      background: white;
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .skeleton-image {
      width: 100%;
      aspect-ratio: 1;
      background: #f0f0f0;
      border-radius: 12px;
      margin-bottom: 1rem;
    }
    
    .skeleton-line {
      height: 16px;
      background: #f0f0f0;
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }
    
    .skeleton-text {
      padding: 1rem;
    }
    
    /* ===== SPARKLE EFFECT ===== */
    @keyframes sparkleFade {
      0% {
        opacity: 1;
        transform: scale(0.5);
      }
      100% {
        opacity: 0;
        transform: scale(2);
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .skeleton-card {
        background: #1E1E1E;
      }
      
      .skeleton-image,
      .skeleton-line {
        background: #2A2A2A;
      }
      
      .shimmer {
        background: linear-gradient(
          90deg,
          #2A2A2A 25%,
          #3A3A3A 50%,
          #2A2A2A 75%
        );
      }
    }
  `;
  
  document.head.appendChild(style);
}

// ============================================
// ANIMATION UTILITIES
// ============================================

/**
 * Easing functions for smooth animations
 */
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: t => .04 - .04 / (1 + 10 * (1 - t)),
  easeOutElastic: t => .04 - .04 / (1 + 10 * t),
};

/**
 * RAF-based smooth scroll
 */
export function smoothScroll(targetY, duration = 1000) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();
  
  function scroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = Easing.easeInOutCubic(progress);
    
    window.scrollTo(0, startY + distance * ease);
    
    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  }
  
  requestAnimationFrame(scroll);
}

/**
 * Parallax effect for elements
 */
export function parallax(element, speed = 0.5) {
  let rafId = null;
  
  function update() {
    const scrolled = window.pageYOffset;
    element.style.transform = `translateY(${scrolled * speed}px)`;
    rafId = requestAnimationFrame(update);
  }
  
  update();
  
  return () => {
    cancelAnimationFrame(rafId);
  };
}

/**
 * Create canvas particles
 */
export function createParticles(container, count = 50, color = '#D4AF37') {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let width = container.clientWidth;
  let height = container.clientHeight;
  let particles = [];
  
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: color,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }
  
  function init() {
    resize();
    particles = Array(count).fill().map(createParticle);
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', resize);
  init();
  animate();
  
  return () => {
    window.removeEventListener('resize', resize);
    canvas.remove();
  };
}

// ============================================
// INITIALIZE ANIMATIONS
// ============================================

// Add animation styles when imported
addAnimationStyles();

// Create and export singleton instance
export const animationManager = new AnimationManager();

// Export default for easy import
export default animationManager;