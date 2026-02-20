import { db, storage } from './init.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  listAll
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import { authService } from './auth.js';

export class AdminService {
  async getDashboardStats() {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');

      const productsSnapshot = await getDocs(collection(db, 'products'));
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const orders = ordersSnapshot.docs.map(doc => doc.data());
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lowStockProducts = productsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.stock < 10);

      return {
        productsCount: productsSnapshot.size,
        ordersCount: ordersSnapshot.size,
        totalRevenue,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        usersCount: usersSnapshot.size,
        newUsersToday: usersSnapshot.docs.filter(doc => {
          const createdAt = doc.data().createdAt?.toDate?.() || new Date(0);
          const today = new Date();
          return createdAt.toDateString() === today.toDateString();
        }).length,
        lowStockProducts,
        lowStockCount: lowStockProducts.length
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getSiteSettings() {
    try {
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const defaultSettings = {
          siteName: 'Madhav Prajapati Art',
          siteDescription: 'Luxury handcrafted clay diyas',
          // PURE CSS LOGO - No image file dependency!
          logo: 'pure-css-logo', // Changed from 'madhav-logo.svg' to indicate no image needed
          favicon: 'favicon.ico',
          diwaliAnimation: false,
          backgroundMusic: false,
          bannerImage: 'https://images.pexels.com/photos/5722907/pexels-photo-5722907.jpeg?auto=compress&cs=tinysrgb&w=1200', // Default diya image
          bannerText: 'Illuminate Your Space',
          bannerSubtext: 'Handcrafted clay diyas for every occasion',
          shippingCost: 50,
          freeShippingThreshold: 999,
          taxRate: 18,
          contactEmail: 'hello@madhavprajapati.art',
          contactPhone: '+91 98765 43210',
          address: '123 Pottery Lane, Kumhar Gaon, Ahmedabad, Gujarat 380001',
          updatedAt: serverTimestamp()
        };
        await setDoc(docRef, defaultSettings);
        return defaultSettings;
      }
      
      return docSnap.data();
    } catch (error) {
      console.error('Error getting site settings:', error);
      throw error;
    }
  }

  async updateSiteSettings(settings) {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const docRef = doc(db, 'settings', 'site');
      await updateDoc(docRef, { ...settings, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async toggleDiwaliAnimation(enable) {
    try {
      await this.updateSiteSettings({ diwaliAnimation: enable });
      window.dispatchEvent(new CustomEvent('diwaliAnimationChanged', {
        detail: { enabled: enable }
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async toggleBackgroundMusic(enable) {
    try {
      await this.updateSiteSettings({ backgroundMusic: enable });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadBanner(file) {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const timestamp = Date.now();
      const fileName = `banner_${timestamp}${this.getFileExtension(file.name)}`;
      const storageRef = ref(storage, `banners/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await this.updateSiteSettings({ bannerImage: downloadURL });
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadLogo(file) {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const timestamp = Date.now();
      const fileName = `logo_${timestamp}${this.getFileExtension(file.name)}`;
      const storageRef = ref(storage, `logos/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update settings with new logo URL
      await this.updateSiteSettings({ logo: downloadURL });
      
      // Dispatch event to notify that logo has been updated
      window.dispatchEvent(new CustomEvent('logoUpdated', {
        detail: { url: downloadURL }
      }));
      
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllOrders() {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllUsers() {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      if (!await authService.isAdmin()) throw new Error('Unauthorized');
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, { role });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  async getRecentActivity(limit = 10) {
    try {
      const activities = [];

      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const ordersSnapshot = await getDocs(ordersQuery);
      ordersSnapshot.docs.forEach(doc => activities.push({
        type: 'order', id: doc.id, data: doc.data(), timestamp: doc.data().createdAt
      }));

      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
      const productsSnapshot = await getDocs(productsQuery);
      productsSnapshot.docs.forEach(doc => activities.push({
        type: 'product', id: doc.id, data: doc.data(), timestamp: doc.data().createdAt
      }));

      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.forEach(doc => activities.push({
        type: 'user', id: doc.id, data: doc.data(), timestamp: doc.data().createdAt
      }));

      return activities
        .sort((a, b) => b.timestamp?.toDate?.() - a.timestamp?.toDate?.())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
  
  // ===== NEW METHOD: Get default banner image =====
  getDefaultBannerImage() {
    return 'https://images.pexels.com/photos/5722907/pexels-photo-5722907.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // ===== NEW METHOD: Check if using pure CSS logo =====
  isUsingPureCSSLogo(logoSetting) {
    return !logoSetting || logoSetting === 'pure-css-logo' || logoSetting.includes('madhav-logo.svg');
  }
}

export const adminService = new AdminService();