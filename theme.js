export class ThemeManager {
  constructor() {
    this.isDark = false;
    this.themes = {
      light: {
        name: 'light',
        icon: 'fa-sun',
        color: '#f5f5f5',
        textColor: '#333333',
        primary: '#D4AF37'
      },
      dark: {
        name: 'dark',
        icon: 'fa-moon',
        color: '#1a1a1a',
        textColor: '#ffffff',
        primary: '#D4AF37'
      },
      sepia: {
        name: 'sepia',
        icon: 'fa-book-open',
        color: '#fbf3e8',
        textColor: '#5b4636',
        primary: '#8B4513'
      }
    };
    
    this.currentTheme = 'light';
    this.observers = [];
    this.transitionDuration = 300;
    this.init();
  }

  init() {
    // Load saved theme preference
    this.loadSavedTheme();
    
    // Listen for system theme changes
    this.setupSystemThemeListener();
    
    // Listen for storage changes (for multi-tab sync)
    this.setupStorageListener();
    
    // Apply initial theme
    this.applyTheme();
    
    // Dispatch initial theme event
    this.dispatchThemeEvent();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const savedCustom = localStorage.getItem('theme_custom');
    
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
      this.isDark = savedTheme === 'dark';
    } else if (savedCustom) {
      try {
        this.customTheme = JSON.parse(savedCustom);
        this.currentTheme = 'custom';
        this.isDark = this.customTheme.isDark || false;
      } catch (e) {
        console.error('Error loading custom theme:', e);
      }
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark = systemPrefersDark;
      this.currentTheme = systemPrefersDark ? 'dark' : 'light';
    }
  }

  setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only apply if user hasn't set a manual preference
      if (!localStorage.getItem('theme') && !localStorage.getItem('theme_custom')) {
        this.isDark = e.matches;
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme();
      }
    });
  }

  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme' || e.key === 'theme_custom') {
        this.loadSavedTheme();
        this.applyTheme();
      }
    });
  }

  toggle() {
    // Cycle through themes: light -> dark -> sepia -> light
    const themeOrder = ['light', 'dark', 'sepia'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    
    this.currentTheme = themeOrder[nextIndex];
    this.isDark = this.currentTheme === 'dark';
    
    this.applyTheme();
    this.saveTheme();
    this.dispatchThemeEvent();
    this.notifyObservers();
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.isDark = themeName === 'dark';
      
      this.applyTheme();
      this.saveTheme();
      this.dispatchThemeEvent();
      this.notifyObservers();
      
      // Remove custom theme if exists
      localStorage.removeItem('theme_custom');
    }
  }

  setCustomTheme(colors) {
    this.customTheme = {
      ...this.themes.light,
      ...colors,
      isDark: colors.isDark || false
    };
    
    this.currentTheme = 'custom';
    this.isDark = this.customTheme.isDark;
    
    this.applyCustomTheme();
    this.saveCustomTheme();
    this.dispatchThemeEvent();
    this.notifyObservers();
  }

  applyTheme() {
    const theme = this.themes[this.currentTheme];
    if (!theme) return;

    // Add transition class for smooth changes
    document.body.classList.add('theme-transition');
    
    // Apply theme classes
    document.body.classList.remove('light-theme', 'dark-theme', 'sepia-theme', 'custom-theme');
    document.body.classList.add(`${this.currentTheme}-theme`);
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--theme-transition-duration', `${this.transitionDuration}ms`);
    document.documentElement.style.setProperty('--bg-color', theme.color);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    
    // Apply theme-specific adjustments
    this.applyThemeAdjustments(theme);
    
    // Update theme toggle button
    this.updateToggleButton(theme.icon);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, this.transitionDuration);
  }

  applyCustomTheme() {
    if (!this.customTheme) return;
    
    document.body.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
    document.body.classList.add('custom-theme');
    
    // Apply custom CSS variables
    Object.entries(this.customTheme).forEach(([key, value]) => {
      if (key !== 'isDark' && key !== 'name') {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
    });
    
    // Update toggle button
    this.updateToggleButton('fa-palette');
  }

  applyThemeAdjustments(theme) {
    // Apply theme-specific adjustments to various elements
    const adjustments = {
      dark: () => {
        // Dark theme specific adjustments
        document.documentElement.style.setProperty('--shadow-color', 'rgba(255,255,255,0.1)');
        document.documentElement.style.setProperty('--border-color', '#333');
      },
      light: () => {
        document.documentElement.style.setProperty('--shadow-color', 'rgba(0,0,0,0.1)');
        document.documentElement.style.setProperty('--border-color', '#e0e0e0');
      },
      sepia: () => {
        document.documentElement.style.setProperty('--shadow-color', 'rgba(139,69,19,0.1)');
        document.documentElement.style.setProperty('--border-color', '#d4b59e');
      }
    };
    
    if (adjustments[this.currentTheme]) {
      adjustments[this.currentTheme]();
    }
  }

  updateToggleButton(iconClass) {
    const toggleButtons = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      const icon = button.querySelector('i');
      if (icon) {
        // Add spin animation
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          icon.className = `fas ${iconClass}`;
          icon.style.transform = '';
        }, 150);
      }
      
      // Update aria-label
      button.setAttribute('aria-label', `Switch to ${this.getNextTheme()} theme`);
    });
  }

  getNextTheme() {
    const themeOrder = ['light', 'dark', 'sepia'];
    const currentIndex = themeOrder.indexOf(this.currentTheme);
    return themeOrder[(currentIndex + 1) % themeOrder.length];
  }

  saveTheme() {
    localStorage.setItem('theme', this.currentTheme);
    localStorage.removeItem('theme_custom');
  }

  saveCustomTheme() {
    localStorage.setItem('theme_custom', JSON.stringify(this.customTheme));
    localStorage.removeItem('theme');
  }

  dispatchThemeEvent() {
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: this.currentTheme,
        isDark: this.isDark,
        colors: this.getCurrentColors()
      }
    }));
  }

  getCurrentColors() {
    if (this.currentTheme === 'custom' && this.customTheme) {
      return { ...this.customTheme };
    }
    return { ...this.themes[this.currentTheme] };
  }

  // Observer pattern for components that need theme updates
  subscribe(observer) {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  notifyObservers() {
    const themeData = {
      theme: this.currentTheme,
      isDark: this.isDark,
      colors: this.getCurrentColors()
    };
    
    this.observers.forEach(observer => {
      try {
        observer(themeData);
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }

  // Utility methods
  isDarkMode() {
    return this.isDark;
  }

  getTheme() {
    return this.currentTheme;
  }

  getThemeInfo() {
    return {
      current: this.currentTheme,
      isDark: this.isDark,
      available: Object.keys(this.themes),
      colors: this.getCurrentColors()
    };
  }

  // Time-based theme scheduling
  scheduleTheme(hour, theme) {
    const currentHour = new Date().getHours();
    
    if (currentHour >= hour) {
      this.setTheme(theme);
    }
    
    // Check every minute for theme change
    const interval = setInterval(() => {
      const now = new Date().getHours();
      if (now >= hour && now < hour + 1) {
        this.setTheme(theme);
        clearInterval(interval);
      }
    }, 60000);
  }

  // Auto theme based on time of day
  enableAutoTheme() {
    const hour = new Date().getHours();
    
    if (hour >= 19 || hour < 6) {
      // Night time (7 PM - 6 AM)
      this.setTheme('dark');
    } else if (hour >= 6 && hour < 17) {
      // Day time (6 AM - 5 PM)
      this.setTheme('light');
    } else {
      // Evening (5 PM - 7 PM)
      this.setTheme('sepia');
    }
    
    // Store preference
    localStorage.setItem('auto_theme', 'true');
  }

  disableAutoTheme() {
    localStorage.removeItem('auto_theme');
  }

  // Export/Import theme settings
  exportTheme() {
    const themeData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      theme: this.currentTheme,
      isDark: this.isDark,
      colors: this.getCurrentColors(),
      customTheme: this.customTheme || null
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  async importTheme(file) {
    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      
      if (themeData.customTheme) {
        this.setCustomTheme(themeData.customTheme);
      } else if (themeData.theme && this.themes[themeData.theme]) {
        this.setTheme(themeData.theme);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing theme:', error);
      return false;
    }
  }

  // High contrast mode for accessibility
  enableHighContrast() {
    document.body.classList.add('high-contrast');
    localStorage.setItem('high_contrast', 'true');
  }

  disableHighContrast() {
    document.body.classList.remove('high-contrast');
    localStorage.removeItem('high_contrast');
  }

  toggleHighContrast() {
    const isHighContrast = document.body.classList.toggle('high-contrast');
    localStorage.setItem('high_contrast', isHighContrast);
  }

  // Reduced motion for accessibility
  enableReducedMotion() {
    document.body.classList.add('reduced-motion');
    localStorage.setItem('reduced_motion', 'true');
  }

  disableReducedMotion() {
    document.body.classList.remove('reduced-motion');
    localStorage.removeItem('reduced_motion');
  }

  toggleReducedMotion() {
    const isReduced = document.body.classList.toggle('reduced-motion');
    localStorage.setItem('reduced_motion', isReduced);
  }
}

// Create and export singleton instance
export const themeManager = new ThemeManager();

// Add CSS styles for theme management
const style = document.createElement('style');
style.textContent = `
  /* Theme transition */
  .theme-transition,
  .theme-transition * {
    transition: background-color 0.3s ease,
                color 0.3s ease,
                border-color 0.3s ease,
                box-shadow 0.3s ease !important;
  }

  /* Theme CSS variables */
  :root {
    --theme-transition-duration: 300ms;
    --shadow-color: rgba(0,0,0,0.1);
    --border-color: #e0e0e0;
  }

  /* Light theme (default) */
  .light-theme {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0,0,0,0.1);
  }

  /* Dark theme */
  .dark-theme {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #404040;
    --shadow-color: rgba(255,255,255,0.1);
  }

  /* Sepia theme */
  .sepia-theme {
    --bg-primary: #fbf3e8;
    --bg-secondary: #f0e6d8;
    --text-primary: #5b4636;
    --text-secondary: #7d6b5a;
    --border-color: #d4b59e;
    --shadow-color: rgba(139,69,19,0.1);
  }

  /* High contrast mode */
  .high-contrast {
    --text-primary: #000000 !important;
    --text-secondary: #000000 !important;
    --bg-primary: #ffffff !important;
    --bg-secondary: #ffffff !important;
    --border-color: #000000 !important;
  }

  .high-contrast .btn,
  .high-contrast a {
    border: 2px solid currentColor !important;
  }

  /* Reduced motion */
  .reduced-motion * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }

  /* Theme toggle button animation */
  .theme-toggle i {
    transition: transform 0.3s ease;
  }

  .theme-toggle:active i {
    transform: rotate(180deg);
  }

  /* Theme preview cards */
  .theme-preview {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .theme-preview:hover {
    transform: translateY(-2px);
  }

  .theme-preview.active {
    border-color: var(--primary-color);
  }

  .theme-preview.light {
    background: #f5f5f5;
    color: #333;
  }

  .theme-preview.dark {
    background: #1a1a1a;
    color: #fff;
  }

  .theme-preview.sepia {
    background: #fbf3e8;
    color: #5b4636;
  }

  /* Theme indicator */
  .theme-indicator {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    box-shadow: 0 2px 10px var(--shadow-color);
    font-size: 0.85rem;
    z-index: 9999;
    display: none;
  }

  .theme-indicator.show {
    display: block;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

document.head.appendChild(style);

// Auto-initialize if enabled
const autoTheme = localStorage.getItem('auto_theme');
if (autoTheme === 'true') {
  themeManager.enableAutoTheme();
}

// Check for high contrast preference
const highContrast = localStorage.getItem('high_contrast');
if (highContrast === 'true') {
  themeManager.enableHighContrast();
}

// Check for reduced motion preference
const reducedMotion = localStorage.getItem('reduced_motion');
if (reducedMotion === 'true') {
  themeManager.enableReducedMotion();
}

export default themeManager;