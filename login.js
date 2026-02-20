import { authService } from './auth.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// LOGIN PAGE - Complete Authentication Component
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class LoginPage {
  constructor(container, params, defaultTab = 'login') {
    this.container = container;
    this.redirect = params.get('redirect') || 'home';
    this.defaultTab = defaultTab;
    this.formData = {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      rememberMe: false,
      termsAgreed: false
    };
    this.errors = {};
    this.isSubmitting = false;
    this.init();
  }

  /**
   * Initialize login page
   */
  init() {
    // Check if already authenticated
    if (authService.isAuthenticated()) {
      window.location.hash = this.redirect;
      return;
    }
    
    this.render();
    this.initEventListeners();
    this.initAnimations();
    console.log('✅ LoginPage initialized');
  }

  /**
   * Render login page
   */
  render() {
    this.container.innerHTML = `
      <div class="auth-page">
        <div class="auth-container" data-animate="scaleIn">
          <div class="auth-card glass-effect">
            <!-- Brand Header -->
            <div class="auth-header">
              <div class="auth-logo">
                <span class="logo-madhav">MADHAV PRAJAPATI</span>
                <span class="logo-art">ART</span>
              </div>
              <h2 data-i18n="welcome_back">Welcome to Madhav Prajapati Art</h2>
              <p data-i18n="handcrafted_love">Handcrafted clay diyas, made with love in Bagwali, Panchkula</p>
            </div>
            
            <!-- Tabs -->
            <div class="auth-tabs">
              <button class="auth-tab ${this.defaultTab === 'login' ? 'active' : ''}" data-tab="login">
                <i class="fas fa-sign-in-alt"></i> <span data-i18n="login">Login</span>
              </button>
              <button class="auth-tab ${this.defaultTab === 'signup' ? 'active' : ''}" data-tab="signup">
                <i class="fas fa-user-plus"></i> <span data-i18n="signup">Sign Up</span>
              </button>
            </div>
            
            <!-- Error/Success Messages -->
            <div id="authMessage" class="auth-message" style="display: none;"></div>
            
            <!-- Form Container -->
            <div id="authFormContainer" class="auth-form-container">
              ${this.defaultTab === 'login' ? this.renderLoginForm() : this.renderSignupForm()}
            </div>
          </div>
          
          <!-- Footer -->
          <div class="auth-footer">
            <p data-i18n="terms_agree">By continuing, you agree to our <a href="#terms" data-nav>Terms</a> and <a href="#privacy" data-nav>Privacy Policy</a></p>
            <p class="auth-location">
              <i class="fas fa-map-marker-alt"></i> Bagwali, Panchkula, Haryana
            </p>
          </div>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Render login form
   */
  renderLoginForm() {
    return `
      <form id="loginForm" class="auth-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="loginEmail">
            <i class="fas fa-envelope"></i> <span data-i18n="email">Email</span>
          </label>
          <input 
            type="email" 
            class="form-input ${this.errors.email ? 'error' : ''}" 
            id="loginEmail" 
            value="${this.escapeHtml(this.formData.email)}"
            placeholder="your@email.com" 
            required 
            autocomplete="email"
          >
          ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="loginPassword">
            <i class="fas fa-lock"></i> <span data-i18n="password">Password</span>
          </label>
          <div class="password-input-wrapper">
            <input 
              type="password" 
              class="form-input ${this.errors.password ? 'error' : ''}" 
              id="loginPassword" 
              value="${this.escapeHtml(this.formData.password)}"
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <i class="far fa-eye"></i>
            </button>
          </div>
          ${this.errors.password ? `<div class="error-message">${this.errors.password}</div>` : ''}
        </div>
        
        <div class="form-group form-row">
          <label class="checkbox-label">
            <input type="checkbox" id="rememberMe" ${this.formData.rememberMe ? 'checked' : ''}>
            <span data-i18n="remember_me">Remember me</span>
          </label>
          <button type="button" class="btn-link" id="forgotPasswordBtn" data-i18n="forgot_password">
            Forgot Password?
          </button>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-large" 
          id="loginSubmitBtn" 
          ${this.isSubmitting ? 'disabled' : ''}
        >
          ${this.isSubmitting 
            ? '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="signing_in">Signing In...</span>' 
            : '<i class="fas fa-sign-in-alt"></i> <span data-i18n="sign_in">Sign In</span>'}
        </button>
        
        <!-- Demo Credentials (for testing) -->
        <div class="demo-credentials">
          <p data-i18n="demo_credentials">Demo credentials:</p>
          <small>admin@madhavprajapati.art / admin123</small>
          <small>user@example.com / user123</small>
        </div>
      </form>
    `;
  }

  /**
   * Render signup form
   */
  renderSignupForm() {
    return `
      <form id="signupForm" class="auth-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="signupName">
            <i class="fas fa-user"></i> <span data-i18n="full_name">Full Name</span>
          </label>
          <input 
            type="text" 
            class="form-input ${this.errors.name ? 'error' : ''}" 
            id="signupName" 
            value="${this.escapeHtml(this.formData.name)}"
            placeholder="Madhav Prajapati" 
            required 
            autocomplete="name"
          >
          ${this.errors.name ? `<div class="error-message">${this.errors.name}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="signupEmail">
            <i class="fas fa-envelope"></i> <span data-i18n="email">Email</span>
          </label>
          <input 
            type="email" 
            class="form-input ${this.errors.email ? 'error' : ''}" 
            id="signupEmail" 
            value="${this.escapeHtml(this.formData.email)}"
            placeholder="your@email.com" 
            required 
            autocomplete="email"
          >
          ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="signupPassword">
            <i class="fas fa-lock"></i> <span data-i18n="password">Password</span>
          </label>
          <div class="password-input-wrapper">
            <input 
              type="password" 
              class="form-input ${this.errors.password ? 'error' : ''}" 
              id="signupPassword" 
              value="${this.escapeHtml(this.formData.password)}"
              placeholder="••••••••" 
              required 
              autocomplete="new-password"
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <i class="far fa-eye"></i>
            </button>
          </div>
          <small class="form-hint" data-i18n="password_hint">At least 6 characters</small>
          ${this.errors.password ? `<div class="error-message">${this.errors.password}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="form-label" for="signupConfirmPassword">
            <i class="fas fa-lock"></i> <span data-i18n="confirm_password">Confirm Password</span>
          </label>
          <div class="password-input-wrapper">
            <input 
              type="password" 
              class="form-input ${this.errors.confirmPassword ? 'error' : ''}" 
              id="signupConfirmPassword" 
              value="${this.escapeHtml(this.formData.confirmPassword)}"
              placeholder="••••••••" 
              required 
              autocomplete="new-password"
            >
            <button type="button" class="password-toggle" aria-label="Toggle password visibility">
              <i class="far fa-eye"></i>
            </button>
          </div>
          ${this.errors.confirmPassword ? `<div class="error-message">${this.errors.confirmPassword}</div>` : ''}
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="termsAgree" ${this.formData.termsAgreed ? 'checked' : ''} required>
            <span data-i18n="agree_terms">
              I agree to the <a href="#terms" target="_blank" data-nav>Terms</a> and <a href="#privacy" target="_blank" data-nav>Privacy Policy</a>
            </span>
          </label>
          ${this.errors.terms ? `<div class="error-message">${this.errors.terms}</div>` : ''}
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-large" 
          id="signupSubmitBtn" 
          ${this.isSubmitting ? 'disabled' : ''}
        >
          ${this.isSubmitting 
            ? '<i class="fas fa-spinner fa-spin"></i> <span data-i18n="creating_account">Creating Account...</span>' 
            : '<i class="fas fa-user-plus"></i> <span data-i18n="create_account">Create Account</span>'}
        </button>
      </form>
    `;
  }

  /**
   * Render forgot password form
   */
  renderForgotPasswordForm() {
    return `
      <div class="auth-form">
        <h3 style="margin-bottom: 1.5rem;" data-i18n="reset_password">Reset Password</h3>
        <p style="color: #666; margin-bottom: 1.5rem;" data-i18n="reset_instructions">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form id="forgotPasswordForm">
          <div class="form-group">
            <label class="form-label" for="resetEmail">
              <i class="fas fa-envelope"></i> <span data-i18n="email">Email</span>
            </label>
            <input type="email" class="form-input" id="resetEmail" placeholder="your@email.com" required>
          </div>
          
          <button type="submit" class="btn btn-primary btn-large" id="resetPasswordBtn">
            <i class="fas fa-paper-plane"></i> <span data-i18n="send_reset_link">Send Reset Link</span>
          </button>
          
          <button type="button" class="btn btn-link" id="backToLoginBtn">
            <i class="fas fa-arrow-left"></i> <span data-i18n="back_to_login">Back to Login</span>
          </button>
        </form>
      </div>
    `;
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Tab switching
    const tabs = this.container.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.formData = {
          email: '',
          password: '',
          name: '',
          confirmPassword: '',
          rememberMe: false,
          termsAgreed: false
        };
        this.errors = {};
        
        const formContainer = this.container.querySelector('#authFormContainer');
        if (tab.dataset.tab === 'login') {
          formContainer.innerHTML = this.renderLoginForm();
        } else {
          formContainer.innerHTML = this.renderSignupForm();
        }
        
        this.initFormListeners();
        this.initPasswordToggles();
        i18n.updatePageContent();
      });
    });

    this.initFormListeners();
    this.initPasswordToggles();
  }

  /**
   * Initialize form listeners
   */
  initFormListeners() {
    // Login form
    const loginForm = this.container.querySelector('#loginForm');
    if (loginForm) {
      // Real-time validation
      const emailInput = this.container.querySelector('#loginEmail');
      const passwordInput = this.container.querySelector('#loginPassword');
      const rememberMe = this.container.querySelector('#rememberMe');

      emailInput?.addEventListener('input', (e) => {
        this.formData.email = e.target.value;
        this.validateField('email', e.target.value);
      });

      passwordInput?.addEventListener('input', (e) => {
        this.formData.password = e.target.value;
      });

      rememberMe?.addEventListener('change', (e) => {
        this.formData.rememberMe = e.target.checked;
      });

      // Submit
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Signup form
    const signupForm = this.container.querySelector('#signupForm');
    if (signupForm) {
      // Real-time validation
      const nameInput = this.container.querySelector('#signupName');
      const emailInput = this.container.querySelector('#signupEmail');
      const passwordInput = this.container.querySelector('#signupPassword');
      const confirmInput = this.container.querySelector('#signupConfirmPassword');
      const termsCheck = this.container.querySelector('#termsAgree');

      nameInput?.addEventListener('input', (e) => {
        this.formData.name = e.target.value;
        this.validateField('name', e.target.value);
      });

      emailInput?.addEventListener('input', (e) => {
        this.formData.email = e.target.value;
        this.validateField('email', e.target.value);
      });

      passwordInput?.addEventListener('input', (e) => {
        this.formData.password = e.target.value;
        this.validateField('password', e.target.value);
        if (this.formData.confirmPassword) {
          this.validateField('confirmPassword', this.formData.confirmPassword);
        }
      });

      confirmInput?.addEventListener('input', (e) => {
        this.formData.confirmPassword = e.target.value;
        this.validateField('confirmPassword', e.target.value);
      });

      termsCheck?.addEventListener('change', (e) => {
        this.formData.termsAgreed = e.target.checked;
        this.validateField('terms', e.target.checked);
      });

      // Submit
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }

    // Forgot password
    const forgotBtn = this.container.querySelector('#forgotPasswordBtn');
    forgotBtn?.addEventListener('click', () => {
      const formContainer = this.container.querySelector('#authFormContainer');
      formContainer.innerHTML = this.renderForgotPasswordForm();
      this.initFormListeners();
      i18n.updatePageContent();
    });

    // Reset password form
    const resetForm = this.container.querySelector('#forgotPasswordForm');
    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePasswordReset();
      });
    }

    // Back to login
    const backBtn = this.container.querySelector('#backToLoginBtn');
    backBtn?.addEventListener('click', () => {
      const formContainer = this.container.querySelector('#authFormContainer');
      formContainer.innerHTML = this.renderLoginForm();
      this.initFormListeners();
      this.initPasswordToggles();
      i18n.updatePageContent();
    });
  }

  /**
   * Initialize password toggles
   */
  initPasswordToggles() {
    this.container.querySelectorAll('.password-toggle').forEach(btn => {
      btn.removeEventListener('click', this.handlePasswordToggle);
      btn.addEventListener('click', this.handlePasswordToggle);
    });
  }

  /**
   * Handle password toggle
   */
  handlePasswordToggle = (e) => {
    const wrapper = e.currentTarget.closest('.password-input-wrapper');
    const input = wrapper?.querySelector('input');
    const icon = e.currentTarget.querySelector('i');
    
    if (input && icon) {
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('far', 'fa-eye');
        icon.classList.add('fas', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fas', 'fa-eye-slash');
        icon.classList.add('far', 'fa-eye');
      }
    }
  }

  /**
   * Handle login submission
   */
  async handleLogin() {
    if (this.isSubmitting) return;

    const email = this.container.querySelector('#loginEmail')?.value.trim();
    const password = this.container.querySelector('#loginPassword')?.value;
    const rememberMe = this.container.querySelector('#rememberMe')?.checked;

    // Validate
    if (!email || !password) {
      this.showMessage('Please enter both email and password', 'error');
      return;
    }

    this.isSubmitting = true;
    const submitBtn = this.container.querySelector('#loginSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    }

    try {
      const result = await authService.signIn(email, password, rememberMe);

      if (result.success) {
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Animate success
        animationManager.animateElement(this.container, 'pulse', 300);
        
        setTimeout(() => {
          window.location.hash = this.redirect;
        }, 1500);
      } else {
        this.showMessage(result.error, 'error');
        this.isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('An unexpected error occurred', 'error');
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      }
    }
  }

  /**
   * Handle signup submission
   */
  async handleSignup() {
    if (this.isSubmitting) return;

    const name = this.container.querySelector('#signupName')?.value.trim();
    const email = this.container.querySelector('#signupEmail')?.value.trim();
    const password = this.container.querySelector('#signupPassword')?.value;
    const confirm = this.container.querySelector('#signupConfirmPassword')?.value;
    const terms = this.container.querySelector('#termsAgree')?.checked;

    // Validate
    if (!name || !email || !password || !confirm) {
      this.showMessage('All fields are required', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirm) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (!terms) {
      this.showMessage('Please agree to the Terms and Privacy Policy', 'error');
      return;
    }

    this.isSubmitting = true;
    const submitBtn = this.container.querySelector('#signupSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    }

    try {
      const result = await authService.signUp(email, password, name);

      if (result.success) {
        this.showMessage('Account created successfully!', 'success');
        
        // Animate success
        animationManager.animateElement(this.container, 'pulse', 300);
        
        setTimeout(() => {
          window.location.hash = this.redirect;
        }, 1500);
      } else {
        this.showMessage(result.error, 'error');
        this.isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showMessage('An unexpected error occurred', 'error');
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    }
  }

  /**
   * Handle password reset
   */
  async handlePasswordReset() {
    const email = this.container.querySelector('#resetEmail')?.value.trim();
    
    if (!email) {
      this.showMessage('Please enter your email', 'error');
      return;
    }

    const submitBtn = this.container.querySelector('#resetPasswordBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        this.showMessage('Password reset email sent! Check your inbox.', 'success');
        
        setTimeout(() => {
          const formContainer = this.container.querySelector('#authFormContainer');
          formContainer.innerHTML = this.renderLoginForm();
          this.initFormListeners();
          this.initPasswordToggles();
          i18n.updatePageContent();
        }, 2000);
      } else {
        this.showMessage(result.error, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      this.showMessage('An unexpected error occurred', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
      }
    }
  }

  /**
   * Validate form field
   */
  validateField(field, value) {
    switch(field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          this.errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          this.errors.email = 'Please enter a valid email address';
        } else {
          delete this.errors.email;
        }
        break;

      case 'name':
        if (!value || value.length < 2) {
          this.errors.name = 'Name must be at least 2 characters';
        } else {
          delete this.errors.name;
        }
        break;

      case 'password':
        if (value && value.length < 6) {
          this.errors.password = 'Password must be at least 6 characters';
        } else {
          delete this.errors.password;
        }
        break;

      case 'confirmPassword':
        if (value !== this.formData.password) {
          this.errors.confirmPassword = 'Passwords do not match';
        } else {
          delete this.errors.confirmPassword;
        }
        break;

      case 'terms':
        if (!value) {
          this.errors.terms = 'You must agree to the Terms and Privacy Policy';
        } else {
          delete this.errors.terms;
        }
        break;
    }

    // Update field error display
    this.updateFieldError(field);
  }

  /**
   * Update field error display
   */
  updateFieldError(field) {
    const input = this.container.querySelector(`#${field}`) || 
                  this.container.querySelector(`#signup${field.charAt(0).toUpperCase() + field.slice(1)}`);
    
    if (input) {
      const errorDiv = input.parentNode?.querySelector('.error-message');
      
      if (this.errors[field]) {
        input.classList.add('error');
        if (!errorDiv) {
          const div = document.createElement('div');
          div.className = 'error-message';
          div.textContent = this.errors[field];
          input.parentNode?.appendChild(div);
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
   * Show message
   */
  showMessage(text, type = 'info') {
    const messageDiv = this.container.querySelector('#authMessage');
    if (messageDiv) {
      messageDiv.textContent = text;
      messageDiv.className = `auth-message ${type}`;
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
    
    // Also use global notification
    if (window.app && window.app.showNotification) {
      window.app.showNotification(text, type);
    }
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
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
    console.log('🧹 LoginPage destroyed');
  }
}

// ============================================
// ADDITIONAL STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .auth-message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    animation: slideDown 0.3s ease;
  }
  
  .auth-message.error {
    background: rgba(220, 53, 69, 0.1);
    color: #DC3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
  }
  
  .auth-message.success {
    background: rgba(40, 167, 69, 0.1);
    color: #28A745;
    border: 1px solid rgba(40, 167, 69, 0.2);
  }
  
  .auth-message.info {
    background: rgba(23, 162, 184, 0.1);
    color: #17A2B8;
    border: 1px solid rgba(23, 162, 184, 0.2);
  }
  
  .auth-location {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: #999;
  }
  
  .demo-credentials {
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(212, 175, 55, 0.05);
    border-radius: 8px;
    font-size: 0.85rem;
  }
  
  .demo-credentials p {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #D4AF37;
  }
  
  .demo-credentials small {
    display: block;
    color: #666;
    margin-bottom: 0.25rem;
    font-family: monospace;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(style);