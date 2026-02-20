import { auth, db } from './init.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ============================================
// AUTH SERVICE - Complete Authentication Solution
// ============================================
export class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.initAuthListener();
    this.init();
  }

  /**
   * Initialize additional auth checks
   */
  async init() {
    // Check for saved session
    this.checkSavedSession();
    
    // Check for token expiration
    setInterval(() => this.checkTokenExpiration(), 60000); // Every minute
  }

  /**
   * Listen for auth state changes
   */
  initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      const previousUser = this.currentUser;
      
      if (user) {
        try {
          // Get user data from Firestore
          const userData = await this.getUserData(user.uid);
          
          // Enhance user object with Firestore data
          this.currentUser = {
            ...user,
            role: userData?.role || 'user',
            userData: userData || {},
            isAdmin: userData?.role === 'admin',
            emailVerified: user.emailVerified,
            metadata: {
              ...user.metadata,
              lastLogin: new Date().toISOString()
            }
          };
          
          // Update last login
          await this.updateLastLogin(user.uid);
          
          console.log('✅ User authenticated:', user.email);
          
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          this.currentUser = { ...user, role: 'user' };
        }
      } else {
        this.currentUser = null;
        console.log('👤 User signed out');
      }
      
      // Dispatch auth state change event
      this.dispatchAuthEvent(previousUser, this.currentUser);
    });
  }

  /**
   * Get user data from Firestore
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Create user document in Firestore
   */
  async createUserDocument(uid, email, name, additionalData = {}) {
    try {
      const userData = {
        email,
        name,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cart: [],
        wishlist: [],
        orders: [],
        addresses: [],
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true
        },
        ...additionalData
      };
      
      await setDoc(doc(db, 'users', uid), userData);
      return userData;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(uid) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Check for saved session
   */
  checkSavedSession() {
    const savedUser = localStorage.getItem('savedUser');
    if (savedUser && !this.currentUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('📱 Restoring session for:', userData.email);
      } catch (e) {
        localStorage.removeItem('savedUser');
      }
    }
  }

  /**
   * Check if token is expired
   */
  async checkTokenExpiration() {
    if (!this.currentUser) return;
    
    try {
      const token = await this.currentUser.getIdToken(true);
      if (!token) {
        await this.signOut();
        this.showNotification('Session expired. Please login again.', 'info');
      }
    } catch (error) {
      console.error('Token check failed:', error);
    }
  }

  /**
   * Dispatch auth state change event
   */
  dispatchAuthEvent(previousUser, currentUser) {
    const event = new CustomEvent('authStateChanged', { 
      detail: { 
        user: currentUser,
        previousUser,
        isAuthenticated: !!currentUser
      } 
    });
    window.dispatchEvent(event);
    
    // Call registered listeners
    this.authListeners.forEach(listener => listener(currentUser));
  }

  /**
   * Register auth state listener
   */
  onAuthStateChanged(listener) {
    this.authListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  /**
   * Sign up new user
   */
  async signUp(email, password, name, additionalData = {}) {
    try {
      // Validate inputs
      const validation = this.validateSignUp(email, password, name);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      await this.createUserDocument(user.uid, email, name, additionalData);

      // Send email verification
      await this.sendVerificationEmail(user);

      // Set current user
      this.currentUser = { 
        ...user, 
        role: 'user',
        userData: additionalData 
      };

      // Save session
      localStorage.setItem('savedUser', JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        lastLogin: new Date().toISOString()
      }));

      console.log('✅ User signed up successfully:', email);
      
      return { 
        success: true, 
        user: this.currentUser,
        message: 'Account created successfully! Please verify your email.'
      };

    } catch (error) {
      return this.handleAuthError(error, 'signup');
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email, password, rememberMe = false) {
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified (optional - uncomment if you want to enforce)
      // if (!user.emailVerified) {
      //   await this.sendVerificationEmail(user);
      //   return { 
      //     success: false, 
      //     error: 'Please verify your email before logging in. A new verification email has been sent.',
      //     needsVerification: true
      //   };
      // }

      // Get user data from Firestore
      const userData = await this.getUserData(user.uid) || {};
      const role = userData.role || 'user';

      // Update current user
      this.currentUser = { 
        ...user, 
        role,
        userData 
      };

      // Save session if remember me
      if (rememberMe) {
        localStorage.setItem('savedUser', JSON.stringify({
          email: user.email,
          displayName: user.displayName,
          lastLogin: new Date().toISOString()
        }));
      }

      console.log('✅ User signed in successfully:', email);

      return { 
        success: true, 
        user: this.currentUser,
        message: 'Login successful!'
      };

    } catch (error) {
      return this.handleAuthError(error, 'signin');
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      localStorage.removeItem('savedUser');
      
      console.log('👤 User signed out');
      
      return { 
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      if (!email) {
        return { success: false, error: 'Email is required' };
      }

      await sendPasswordResetEmail(auth, email);
      
      console.log('📧 Password reset email sent to:', email);
      
      return { 
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      return this.handleAuthError(error, 'reset');
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code, newPassword) {
    try {
      if (!code || !newPassword) {
        return { success: false, error: 'Invalid reset code or password' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      await confirmPasswordReset(auth, code, newPassword);
      
      return { 
        success: true,
        message: 'Password reset successfully! You can now login.'
      };
    } catch (error) {
      return this.handleAuthError(error, 'reset-confirm');
    }
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(code) {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      return { 
        success: true, 
        email,
        message: 'Reset code verified'
      };
    } catch (error) {
      return this.handleAuthError(error, 'reset-verify');
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(user = null) {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      await sendEmailVerification(currentUser);
      
      return { 
        success: true,
        message: 'Verification email sent! Check your inbox.'
      };
    } catch (error) {
      return this.handleAuthError(error, 'verification');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      const user = auth.currentUser;
      
      // Update Auth profile
      if (updates.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      // Update Firestore document
      if (Object.keys(updates).length > 0) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }

      // Refresh current user
      this.currentUser = { 
        ...user, 
        ...updates,
        userData: await this.getUserData(user.uid)
      };

      return { 
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ============================================
  // ADMIN METHODS
  // ============================================

  /**
   * Check if current user is admin
   */
  async isAdmin() {
    if (!this.currentUser) return false;
    
    try {
      // Check from cached data first
      if (this.currentUser.role === 'admin') return true;
      
      // Verify from Firestore
      const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
      const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
      
      // Update cached role
      if (isAdmin) {
        this.currentUser.role = 'admin';
      }
      
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      if (!await this.isAdmin()) {
        throw new Error('Unauthorized');
      }

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(uid, role) {
    try {
      if (!await this.isAdmin()) {
        throw new Error('Unauthorized');
      }

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        role,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Validate signup inputs
   */
  validateSignUp(email, password, name) {
    const errors = [];
    
    if (!email || !email.includes('@')) {
      errors.push('Valid email is required');
    }
    
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!name || name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    return {
      valid: errors.length === 0,
      error: errors.join(', ')
    };
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error, context = '') {
    console.error(`Auth error (${context}):`, error);
    
    let errorMessage = 'Authentication failed';
    let errorCode = error.code || 'unknown';
    
    switch (error.code) {
      // Sign in errors
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      
      // Sign up errors
      case 'auth/email-already-in-use':
        errorMessage = 'Email already registered. Please login.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Use at least 6 characters.';
        break;
      
      // Reset password errors
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/invalid-action-code':
        errorMessage = 'Invalid or expired reset code';
        break;
      
      // Rate limiting
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Try again later.';
        break;
      
      // Network errors
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      
      default:
        errorMessage = error.message || 'Authentication failed';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: errorCode,
      context
    };
  }

  /**
   * Show notification (can be overridden)
   */
  showNotification(message, type = 'info') {
    const event = new CustomEvent('showNotification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get user token
   */
  async getToken() {
    if (!this.currentUser) return null;
    try {
      return await this.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Refresh user token
   */
  async refreshToken() {
    if (!this.currentUser) return null;
    try {
      return await this.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const authService = new AuthService();

// ============================================
// ADDITIONAL UTILITIES
// ============================================

/**
 * Protected route wrapper
 */
export function requireAuth(redirectTo = '/login') {
  if (!authService.isAuthenticated()) {
    window.location.hash = redirectTo;
    return false;
  }
  return true;
}

/**
 * Admin route wrapper
 */
export async function requireAdmin(redirectTo = '/') {
  if (!authService.isAuthenticated()) {
    window.location.hash = '/login';
    return false;
  }
  
  const isAdmin = await authService.isAdmin();
  if (!isAdmin) {
    window.location.hash = redirectTo;
    return false;
  }
  
  return true;
}

/**
 * Get auth state as promise
 */
export function getAuthState() {
  return new Promise((resolve) => {
    if (authService.currentUser) {
      resolve(authService.currentUser);
    } else {
      const unsubscribe = authService.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    }
  });
}

export default authService;