export class VirtualDiya {
  constructor(options = {}) {
    this.isLit = false;
    this.isAnimating = false;
    this.flameIntensity = 1;
    this.clickCount = 0;
    this.lastClickTime = 0;
    this.audioEnabled = false;
    this.particles = [];
    this.animationFrame = null;
    
    // Configuration options
    this.options = {
      autoLight: options.autoLight || false,
      enableAudio: options.enableAudio || false,
      enableParticles: options.enableParticles !== false,
      enableHover: options.enableHover !== false,
      flameFlickerSpeed: options.flameFlickerSpeed || 1,
      particleCount: options.particleCount || 15,
      ...options
    };
    
    this.init();
  }

  init() {
    // Auto-light if specified
    if (this.options.autoLight) {
      setTimeout(() => this.light(), 1000);
    }

    // Load audio if enabled
    if (this.options.enableAudio) {
      this.loadAudio();
    }

    // Bind methods
    this.toggleDiya = this.toggleDiya.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.animate = this.animate.bind(this);
  }

  render() {
    const container = document.createElement('div');
    container.className = 'virtual-diya';
    container.setAttribute('role', 'button');
    container.setAttribute('aria-label', 'Virtual Diya - Click to light');
    container.setAttribute('tabindex', '0');
    
    container.innerHTML = `
      <div class="diya-wrapper">
        <div class="diya-container ${this.isLit ? 'lit' : ''}" id="diyaContainer">
          <div class="diya-base">
            <div class="diya-shadow"></div>
            <div class="diya-reflection"></div>
          </div>
          <div class="diya-flame-container">
            <div class="diya-flame ${this.isLit ? '' : 'hidden'}" id="diyaFlame">
              <div class="flame-core"></div>
              <div class="flame-inner"></div>
              <div class="flame-outer"></div>
              <div class="flame-glow"></div>
            </div>
          </div>
          <div class="diya-wick"></div>
          <div class="diya-oil"></div>
        </div>
        <div class="diya-glow-effect" id="diyaGlow"></div>
      </div>
      <div class="diya-tooltip">
        <span class="tooltip-text">${this.isLit ? 'Extinguish' : 'Light'} Diya</span>
      </div>
    `;
    
    // Event listeners
    container.addEventListener('click', this.toggleDiya);
    
    if (this.options.enableHover) {
      container.addEventListener('mouseenter', this.handleHover);
      container.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    // Keyboard support
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDiya();
      }
    });
    
    this.container = container;
    return container;
  }

  light() {
    if (this.isLit || this.isAnimating) return;
    
    this.isAnimating = true;
    this.isLit = true;
    
    // Update UI
    this.updateUI();
    
    // Play sound if enabled
    this.playSound('light');
    
    // Create lighting animation
    this.animateLight();
    
    // Create particles
    if (this.options.enableParticles) {
      this.createParticles('light');
    }
    
    // Start flame animation
    this.startFlameAnimation();
    
    // Track analytics
    this.trackInteraction('light');
    
    // Dispatch event
    this.dispatchEvent('diyaLit');
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  extinguish() {
    if (!this.isLit || this.isAnimating) return;
    
    this.isAnimating = true;
    this.isLit = false;
    
    // Update UI
    this.updateUI();
    
    // Play sound if enabled
    this.playSound('extinguish');
    
    // Create extinguishing animation
    this.animateExtinguish();
    
    // Create smoke particles
    if (this.options.enableParticles) {
      this.createParticles('smoke');
    }
    
    // Stop flame animation
    this.stopFlameAnimation();
    
    // Track analytics
    this.trackInteraction('extinguish');
    
    // Dispatch event
    this.dispatchEvent('diyaExtinguished');
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  toggleDiya() {
    const now = Date.now();
    
    // Double-click detection for special effects
    if (now - this.lastClickTime < 300) {
      this.clickCount++;
      if (this.clickCount === 2) {
        this.specialEffect();
      }
    } else {
      this.clickCount = 1;
    }
    
    this.lastClickTime = now;
    
    if (this.isLit) {
      this.extinguish();
    } else {
      this.light();
    }
  }

  updateUI() {
    if (!this.container) return;
    
    const diyaContainer = this.container.querySelector('.diya-container');
    const flame = this.container.querySelector('.diya-flame');
    const glow = this.container.querySelector('.diya-glow-effect');
    const tooltip = this.container.querySelector('.tooltip-text');
    
    if (diyaContainer) {
      diyaContainer.classList.toggle('lit', this.isLit);
    }
    
    if (flame) {
      flame.classList.toggle('hidden', !this.isLit);
    }
    
    if (glow) {
      glow.style.opacity = this.isLit ? '1' : '0';
    }
    
    if (tooltip) {
      tooltip.textContent = this.isLit ? 'Extinguish Diya' : 'Light Diya';
    }
    
    // Update ARIA label
    this.container.setAttribute('aria-label', 
      this.isLit ? 'Virtual Diya - Lit. Click to extinguish' : 'Virtual Diya - Unlit. Click to light'
    );
  }

  animateLight() {
    const flame = this.container?.querySelector('.diya-flame');
    if (!flame) return;
    
    flame.style.animation = 'none';
    flame.offsetHeight; // Trigger reflow
    
    // Scale animation
    flame.style.transform = 'scale(0)';
    flame.style.opacity = '0';
    
    setTimeout(() => {
      flame.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
      flame.style.transform = 'scale(1)';
      flame.style.opacity = '1';
      
      setTimeout(() => {
        flame.style.transition = '';
      }, 300);
    }, 50);
  }

  animateExtinguish() {
    const flame = this.container?.querySelector('.diya-flame');
    if (!flame) return;
    
    flame.style.animation = 'extinguish 0.3s ease forwards';
    
    setTimeout(() => {
      flame.style.animation = '';
    }, 300);
  }

  startFlameAnimation() {
    if (this.animationFrame) return;
    
    let lastTime = 0;
    const animate = (currentTime) => {
      if (!this.isLit) return;
      
      if (lastTime === 0) {
        lastTime = currentTime;
      }
      
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 50) { // Update every 50ms
        this.updateFlameIntensity();
        lastTime = currentTime;
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  stopFlameAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  updateFlameIntensity() {
    const flame = this.container?.querySelector('.diya-flame');
    if (!flame) return;
    
    // Random flicker effect
    const flicker = Math.sin(Date.now() * 0.01 * this.options.flameFlickerSpeed) * 0.1;
    const intensity = 0.9 + flicker + (Math.random() * 0.1);
    
    flame.style.transform = `scale(${intensity})`;
    flame.style.filter = `brightness(${intensity})`;
    
    // Update glow
    const glow = this.container?.querySelector('.diya-glow-effect');
    if (glow) {
      glow.style.transform = `scale(${1 + flicker * 0.5})`;
      glow.style.opacity = (0.5 + flicker * 0.3).toString();
    }
  }

  handleHover(e) {
    if (!this.isLit || this.isAnimating) return;
    
    const flame = this.container.querySelector('.diya-flame');
    if (flame) {
      flame.style.transform = 'scale(1.2)';
    }
  }

  handleMouseLeave() {
    if (!this.isLit) return;
    
    const flame = this.container.querySelector('.diya-flame');
    if (flame) {
      flame.style.transform = '';
    }
  }

  createParticles(type) {
    if (!this.container) return;
    
    const count = type === 'light' ? this.options.particleCount : 
                  type === 'smoke' ? 8 : 5;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = `diya-particle ${type}-particle`;
        
        // Random position around diya
        const angle = (i / count) * Math.PI * 2 + Math.random();
        const radius = 30 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        particle.style.setProperty('--r', `${Math.random() * 360}deg`);
        particle.style.setProperty('--scale', `${0.5 + Math.random() * 0.5}`);
        
        // Customize based on type
        if (type === 'light') {
          particle.style.background = `radial-gradient(circle, 
            rgba(255, 223, 0, 1) 0%, 
            rgba(255, 140, 0, 0.8) 50%, 
            transparent 100%)`;
          particle.style.width = '8px';
          particle.style.height = '8px';
        } else if (type === 'smoke') {
          particle.style.background = `radial-gradient(circle, 
            rgba(200, 200, 200, 0.6) 0%, 
            rgba(150, 150, 150, 0.3) 70%, 
            transparent 100%)`;
          particle.style.width = '15px';
          particle.style.height = '15px';
          particle.style.filter = 'blur(2px)';
        }
        
        this.container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.remove();
          }
        }, 1000);
      }, i * 50);
    }
  }

  specialEffect() {
    if (!this.isLit) return;
    
    // Double-click effect - burst of sparks
    this.createParticles('spark');
    
    // Temporary intense flame
    const flame = this.container?.querySelector('.diya-flame');
    if (flame) {
      flame.style.transform = 'scale(2)';
      flame.style.filter = 'brightness(1.5)';
      
      setTimeout(() => {
        flame.style.transform = '';
        flame.style.filter = '';
      }, 300);
    }
    
    this.playSound('special');
    this.dispatchEvent('diyaSpecial');
  }

  loadAudio() {
    // Pre-load audio files (would need actual audio files)
    this.sounds = {
      light: new Audio('/sounds/diya-light.mp3'),
      extinguish: new Audio('/sounds/diya-extinguish.mp3'),
      special: new Audio('/sounds/diya-special.mp3')
    };
    
    // Set volume
    Object.values(this.sounds).forEach(sound => {
      if (sound) sound.volume = 0.3;
    });
  }

  playSound(type) {
    if (!this.audioEnabled || !this.sounds || !this.sounds[type]) return;
    
    // Clone and play for overlapping sounds
    const sound = this.sounds[type].cloneNode();
    sound.volume = 0.3;
    sound.play().catch(() => {}); // Ignore autoplay restrictions
  }

  trackInteraction(action) {
    // Track in analytics if available
    if (window.gtag) {
      window.gtag('event', 'virtual_diya', {
        event_category: 'interaction',
        event_label: action,
        value: this.clickCount
      });
    }
    
    // Store in localStorage for statistics
    const stats = JSON.parse(localStorage.getItem('diya_stats') || '{"lit":0,"extinguish":0,"total":0}');
    stats[action === 'light' ? 'lit' : 'extinguish']++;
    stats.total++;
    localStorage.setItem('diya_stats', JSON.stringify(stats));
  }

  dispatchEvent(eventName) {
    const event = new CustomEvent(eventName, {
      detail: {
        isLit: this.isLit,
        clickCount: this.clickCount,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
  }

  getStats() {
    return JSON.parse(localStorage.getItem('diya_stats') || '{"lit":0,"extinguish":0,"total":0}');
  }

  resetStats() {
    localStorage.removeItem('diya_stats');
  }

  enableAudio() {
    this.audioEnabled = true;
    this.loadAudio();
  }

  disableAudio() {
    this.audioEnabled = false;
  }

  destroy() {
    this.stopFlameAnimation();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
  }
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .virtual-diya {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    cursor: pointer;
    outline: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .virtual-diya:focus-visible {
    outline: 2px solid #D4AF37;
    outline-offset: 4px;
    border-radius: 50%;
  }

  .diya-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .virtual-diya:hover .diya-wrapper {
    transform: scale(1.1);
  }

  .virtual-diya:active .diya-wrapper {
    transform: scale(0.95);
  }

  .diya-container {
    position: relative;
    width: 60px;
    height: 40px;
    transition: all 0.3s ease;
  }

  .diya-base {
    position: absolute;
    bottom: 0;
    width: 60px;
    height: 30px;
    background: linear-gradient(135deg, #8B4513, #5D3A1A);
    border-radius: 0 0 50% 50%;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  .diya-shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 70%);
  }

  .diya-reflection {
    position: absolute;
    top: 2px;
    left: 10px;
    width: 20px;
    height: 6px;
    background: linear-gradient(90deg, 
      rgba(255,255,255,0.3), 
      rgba(255,255,255,0.1)
    );
    border-radius: 50%;
    transform: rotate(-15deg);
  }

  .diya-oil {
    position: absolute;
    bottom: 5px;
    left: 10px;
    width: 40px;
    height: 8px;
    background: linear-gradient(135deg, #C0A080, #8B691B);
    border-radius: 4px;
    opacity: 0.5;
  }

  .diya-wick {
    position: absolute;
    bottom: 15px;
    left: 28px;
    width: 4px;
    height: 12px;
    background: linear-gradient(135deg, #2C1810, #4A2C1A);
    border-radius: 2px 2px 0 0;
    z-index: 2;
  }

  .diya-flame-container {
    position: absolute;
    bottom: 25px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 3;
  }

  .diya-flame {
    position: relative;
    width: 20px;
    height: 40px;
    transition: all 0.2s ease;
  }

  .diya-flame.hidden {
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  .flame-core {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 25px;
    background: radial-gradient(ellipse at center, 
      #FFFFFF 0%,
      #FFE55C 70%,
      #FF8C42 100%
    );
    border-radius: 50% 50% 20% 20%;
    filter: blur(1px);
    animation: flicker 0.1s infinite alternate;
  }

  .flame-inner {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 30px;
    background: radial-gradient(ellipse at center, 
      #FFE55C 0%,
      #FF8C42 70%,
      transparent 100%
    );
    border-radius: 50%;
    filter: blur(2px);
    animation: flicker 0.15s infinite alternate-reverse;
  }

  .flame-outer {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 18px;
    height: 35px;
    background: radial-gradient(ellipse at center, 
      #FF8C42 0%,
      #FF6347 70%,
      transparent 100%
    );
    border-radius: 50%;
    filter: blur(4px);
    animation: flicker 0.2s infinite alternate;
  }

  .flame-glow {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 40px;
    background: radial-gradient(ellipse at center, 
      rgba(255, 140, 0, 0.5) 0%,
      rgba(255, 69, 0, 0.2) 70%,
      transparent 100%
    );
    border-radius: 50%;
    filter: blur(8px);
  }

  .diya-glow-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, 
      rgba(255, 215, 0, 0.4) 0%,
      rgba(255, 140, 0, 0.2) 50%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(10px);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: -1;
  }

  .diya-container.lit .diya-glow-effect {
    opacity: 1;
  }

  .diya-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
  }

  .diya-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0,0,0,0.8) transparent transparent transparent;
  }

  .virtual-diya:hover .diya-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-15px);
  }

  /* Particles */
  .diya-particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    pointer-events: none;
    animation: particle 1s ease-out forwards;
    z-index: 10000;
  }

  .diya-particle.light-particle {
    background: radial-gradient(circle, #FFD700, #FF8C00);
    box-shadow: 0 0 10px #FF8C00;
  }

  .diya-particle.smoke-particle {
    background: rgba(200, 200, 200, 0.6);
    filter: blur(3px);
    animation: smoke 1.5s ease-out forwards;
  }

  /* Animations */
  @keyframes flicker {
    0% {
      transform: translateX(-50%) scale(1);
      opacity: 0.9;
    }
    100% {
      transform: translateX(-50%) scale(1.1);
      opacity: 1;
    }
  }

  @keyframes extinguish {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(0);
      opacity: 0;
    }
  }

  @keyframes particle {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0);
      opacity: 0;
    }
  }

  @keyframes smoke {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translate(calc(-50% + var(--x)), calc(-50% - 100px)) scale(3);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .virtual-diya {
      bottom: 1rem;
      right: 1rem;
    }

    .diya-wrapper {
      width: 60px;
      height: 60px;
    }

    .diya-container {
      width: 45px;
      height: 30px;
    }

    .diya-base {
      width: 45px;
      height: 22px;
    }

    .diya-flame {
      width: 15px;
      height: 30px;
    }

    .diya-tooltip {
      display: none;
    }
  }

  /* Dark theme support */
  @media (prefers-color-scheme: dark) {
    .diya-base {
      background: linear-gradient(135deg, #A0522D, #8B4513);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .diya-flame,
    .diya-particle,
    .diya-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }
`;

document.head.appendChild(style);

export default VirtualDiya;