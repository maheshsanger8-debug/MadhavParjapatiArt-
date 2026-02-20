import { firestoreService } from './firestore.js';
import { ProductCard } from './product-card.js';
import { FilterBar } from './filter-bar.js';
import { i18n } from './i18n.js';
import { animationManager } from './animations.js';
import { currencyFormatter } from './currency.js';

// ============================================
// PRODUCTS PAGE - Complete Products Listing Component
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

export class ProductsPage {
  constructor(container, params) {
    this.container = container;
    this.params = params;
    this.products = [];
    this.filteredProducts = [];
    this.unsubscribe = null;
    this.currentPage = 1;
    this.itemsPerPage = 8;
    this.currentView = 'grid';
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      minRating: 0,
      inStockOnly: false,
      onSaleOnly: false
    };
    this.sortBy = 'newest';
    this.searchQuery = '';
    this.totalPages = 1;
    this.init();
  }

  /**
   * Initialize products page
   */
  async init() {
    this.render();
    this.initFilterBar();
    await this.loadProducts();
    this.initEventListeners();
    this.initAnimations();
    this.checkUrlParams();
    console.log('✅ ProductsPage initialized from Bagwali, Panchkula');
  }

  /**
   * Render products page
   */
  render() {
    this.container.innerHTML = `
      <div class="products-page">
        <div class="page-header">
          <h1 class="page-title" data-i18n="our_collection">Our Collection</h1>
          <p class="page-subtitle" data-i18n="handcrafted_unique">Handcrafted diyas from Bagwali, Panchkula, each piece unique</p>
          <div class="location-badge">
            <i class="fas fa-map-marker-alt"></i> Handcrafted in Bagwali, Panchkula
          </div>
        </div>
        
        <!-- Filter Bar Container -->
        <div id="filterBarContainer"></div>
        
        <!-- Results Info -->
        <div class="results-info">
          <div class="results-count" id="resultsCount">
            <span data-i18n="showing">Showing</span> 
            <span id="startCount">1</span>-<span id="endCount">8</span> 
            <span data-i18n="of">of</span> 
            <span id="totalCount">0</span> 
            <span data-i18n="products">products</span>
          </div>
          
          <div class="view-options">
            <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" id="gridViewBtn" title="Grid view">
              <i class="fas fa-th"></i>
            </button>
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" id="listViewBtn" title="List view">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
        
        <!-- Products Container -->
        <div id="productsContainer" class="product-grid ${this.currentView === 'list' ? 'list-view' : ''}">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p data-i18n="loading_products">Loading beautiful diyas...</p>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" id="paginationContainer">
          <button class="page-btn prev" id="prevPageBtn" disabled>
            <i class="fas fa-chevron-left"></i> <span data-i18n="previous">Previous</span>
          </button>
          <div class="page-numbers" id="pageNumbers"></div>
          <button class="page-btn next" id="nextPageBtn">
            <span data-i18n="next">Next</span> <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
    
    i18n.updatePageContent();
  }

  /**
   * Initialize filter bar
   */
  initFilterBar() {
    const filterBarContainer = document.getElementById('filterBarContainer');
    const filterBar = new FilterBar({
      onFilterChange: (filters) => this.applyFilters(filters),
      onSortChange: (sortBy) => this.applySort(sortBy),
      onSearch: (query) => this.searchProducts(query),
      onPriceRangeChange: (range) => this.applyPriceRange(range),
      onRatingChange: (rating) => this.applyRatingFilter(rating),
      onStockFilter: (stock) => this.applyStockFilter(stock)
    });
    filterBarContainer.appendChild(filterBar.render());
  }

  /**
   * Load products from Firestore
   */
  async loadProducts() {
    try {
      const category = this.params.get('category');
      const search = this.params.get('search');
      
      const filters = {};
      if (category) filters.category = category;
      if (search) this.searchQuery = search;
      
      this.unsubscribe = firestoreService.listenToProducts((products) => {
        this.products = products;
        this.applyAllFilters();
        
        // Set category filter from URL if present
        if (category) {
          const categorySelect = document.getElementById('categoryFilter');
          if (categorySelect) categorySelect.value = category;
          this.filters.category = category;
        }
        
        // Set search from URL if present
        if (search) {
          const searchInput = document.querySelector('#productSearch');
          if (searchInput) searchInput.value = search;
          this.searchProducts(search);
        }
      }, filters);

    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products');
    }
  }

  /**
   * Apply all filters
   */
  applyAllFilters() {
    let filtered = [...this.products];
    
    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === this.filters.category);
    }
    
    // Price range filter
    if (this.filters.minPrice !== null) {
      filtered = filtered.filter(p => p.price >= this.filters.minPrice);
    }
    if (this.filters.maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= this.filters.maxPrice);
    }
    
    // Rating filter
    if (this.filters.minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= this.filters.minRating);
    }
    
    // Stock filter
    if (this.filters.inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    // Sale filter
    if (this.filters.onSaleOnly) {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }
    
    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered = this.sortProducts(filtered, this.sortBy);
    
    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
    
    this.renderProducts(this.getCurrentPageProducts());
    this.updatePagination();
    this.updateResultsCount();
  }

  /**
   * Get current page products
   */
  getCurrentPageProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  /**
   * Render products
   */
  renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <i class="fas fa-box-open"></i>
          <h3 data-i18n="no_products_found">No products found</h3>
          <p data-i18n="adjust_filters">Try adjusting your filters or check back later</p>
          <button class="btn btn-primary" id="clearFiltersBtn" data-i18n="clear_filters">Clear Filters</button>
        </div>
      `;
      i18n.updatePageContent();
      
      document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
        this.resetFilters();
      });
      return;
    }

    container.innerHTML = '';
    products.forEach(product => {
      const card = new ProductCard(product);
      container.appendChild(card.render());
    });
  }

  /**
   * Apply category filters
   */
  applyFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.applyAllFilters();
  }

  /**
   * Apply price range filter
   */
  applyPriceRange(range) {
    this.filters.minPrice = range.min ? parseFloat(range.min) : null;
    this.filters.maxPrice = range.max ? parseFloat(range.max) : null;
    this.applyAllFilters();
  }

  /**
   * Apply rating filter
   */
  applyRatingFilter(rating) {
    this.filters.minRating = rating;
    this.applyAllFilters();
  }

  /**
   * Apply stock filter
   */
  applyStockFilter(stock) {
    this.filters.inStockOnly = stock.inStockOnly || false;
    this.filters.onSaleOnly = stock.onSaleOnly || false;
    this.applyAllFilters();
  }

  /**
   * Apply sorting
   */
  applySort(sortBy) {
    this.sortBy = sortBy;
    this.filteredProducts = this.sortProducts(this.filteredProducts, sortBy);
    this.renderProducts(this.getCurrentPageProducts());
  }

  /**
   * Sort products
   */
  sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return discountB - discountA;
        });
        break;
      default:
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
    }
    
    return sorted;
  }

  /**
   * Search products
   */
  searchProducts(query) {
    this.searchQuery = query;
    this.applyAllFilters();
  }

  /**
   * Check URL parameters
   */
  checkUrlParams() {
    const category = this.params.get('category');
    const search = this.params.get('search');
    
    if (category) {
      this.filters.category = category;
    }
    
    if (search) {
      this.searchQuery = search;
    }
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.filters = {
      category: 'all',
      minPrice: null,
      maxPrice: null,
      minRating: 0,
      inStockOnly: false,
      onSaleOnly: false
    };
    this.sortBy = 'newest';
    this.searchQuery = '';
    
    // Reset UI elements
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) categorySelect.value = 'all';
    
    const searchInput = document.querySelector('#productSearch');
    if (searchInput) searchInput.value = '';
    
    const minPrice = document.querySelector('#minPrice');
    const maxPrice = document.querySelector('#maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    const ratingRadios = document.querySelectorAll('input[name="minRating"]');
    ratingRadios.forEach(radio => {
      if (radio.value === '0') radio.checked = true;
    });
    
    const stockCheck = document.querySelector('#inStockOnly');
    if (stockCheck) stockCheck.checked = false;
    
    const saleCheck = document.querySelector('#onSaleOnly');
    if (saleCheck) saleCheck.checked = false;
    
    this.applyAllFilters();
    this.showNotification('Filters cleared', 'info');
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Grid view button
    const gridViewBtn = document.getElementById('gridViewBtn');
    gridViewBtn?.addEventListener('click', () => {
      this.currentView = 'grid';
      const container = document.getElementById('productsContainer');
      container.classList.remove('list-view');
      gridViewBtn.classList.add('active');
      document.getElementById('listViewBtn')?.classList.remove('active');
    });

    // List view button
    const listViewBtn = document.getElementById('listViewBtn');
    listViewBtn?.addEventListener('click', () => {
      this.currentView = 'list';
      const container = document.getElementById('productsContainer');
      container.classList.add('list-view');
      listViewBtn.classList.add('active');
      document.getElementById('gridViewBtn')?.classList.remove('active');
    });

    // Pagination
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    prevBtn?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderProducts(this.getCurrentPageProducts());
        this.updatePagination();
        this.updateResultsCount();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderProducts(this.getCurrentPageProducts());
        this.updatePagination();
        this.updateResultsCount();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Listen for filter reset from FilterBar
    window.addEventListener('filterReset', () => {
      this.resetFilters();
    });
  }

  /**
   * Update pagination
   */
  updatePagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (!pageNumbers) return;
    
    // Update prev/next buttons
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    
    // Generate page numbers
    let pagesHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pagesHtml += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        pagesHtml += `<span class="page-dots">...</span>`;
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pagesHtml += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pagesHtml += `<span class="page-dots">...</span>`;
      }
      pagesHtml += `<button class="page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
    }
    
    pageNumbers.innerHTML = pagesHtml;
    
    // Add event listeners to page buttons
    document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page !== this.currentPage) {
          this.currentPage = page;
          this.renderProducts(this.getCurrentPageProducts());
          this.updatePagination();
          this.updateResultsCount();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Update results count
   */
  updateResultsCount() {
    const startCount = document.getElementById('startCount');
    const endCount = document.getElementById('endCount');
    const totalCount = document.getElementById('totalCount');
    
    if (startCount && endCount && totalCount) {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
      
      startCount.textContent = this.filteredProducts.length > 0 ? start : 0;
      endCount.textContent = end;
      totalCount.textContent = this.filteredProducts.length;
    }
  }

  /**
   * Initialize animations
   */
  initAnimations() {
    animationManager.initScrollAnimations();
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById('productsContainer');
    if (container) {
      container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #DC3545; margin-bottom: 1rem;"></i>
          <h3 style="color: #0F0F0F; margin-bottom: 1rem;">Something went wrong</h3>
          <p style="color: #666; margin-bottom: 2rem;">${message}</p>
          <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
      `;
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const event = new CustomEvent('showNotification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    console.log('🧹 ProductsPage destroyed');
  }
}

// ============================================
// ADDITIONAL STYLES
// ============================================
const style = document.createElement('style');
style.textContent = `
  .results-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .results-count {
    color: #666;
    font-size: 0.95rem;
  }
  
  .results-count span {
    font-weight: 600;
    color: #D4AF37;
  }
  
  .view-options {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-btn {
    width: 40px;
    height: 40px;
    background: white;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .view-btn:hover {
    border-color: #D4AF37;
    color: #D4AF37;
  }
  
  .view-btn.active {
    background: #D4AF37;
    color: white;
    border-color: #D4AF37;
  }
  
  .product-grid.list-view {
    grid-template-columns: 1fr;
  }
  
  .product-grid.list-view .product-card {
    display: flex;
    gap: 2rem;
  }
  
  .product-grid.list-view .product-image {
    width: 200px;
    flex-shrink: 0;
  }
  
  .product-grid.list-view .product-info {
    flex: 1;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 3rem;
    flex-wrap: wrap;
  }
  
  .page-numbers {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .page-btn {
    min-width: 40px;
    height: 40px;
    padding: 0 0.75rem;
    background: white;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }
  
  .page-btn:hover:not(:disabled) {
    border-color: #D4AF37;
    color: #D4AF37;
  }
  
  .page-btn.active {
    background: #D4AF37;
    color: white;
    border-color: #D4AF37;
  }
  
  .page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .page-btn.prev,
  .page-btn.next {
    padding: 0 1.25rem;
  }
  
  .page-dots {
    display: flex;
    align-items: center;
    padding: 0 0.25rem;
    color: #666;
  }
  
  .location-badge {
    display: inline-block;
    background: rgba(212,175,55,0.1);
    color: #B8860B;
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 1rem;
  }
  
  .location-badge i {
    color: #D4AF37;
    margin-right: 0.5rem;
  }
  
  .no-products {
    text-align: center;
    padding: 4rem 2rem;
    grid-column: 1 / -1;
  }
  
  .no-products i {
    font-size: 4rem;
    color: #D4AF37;
    opacity: 0.3;
    margin-bottom: 1.5rem;
  }
  
  .no-products h3 {
    font-size: 1.5rem;
    color: #0F0F0F;
    margin-bottom: 0.5rem;
  }
  
  .no-products p {
    color: #666;
    margin-bottom: 2rem;
  }
  
  .no-products .btn {
    display: inline-flex;
  }
  
  @media (prefers-color-scheme: dark) {
    .view-btn,
    .page-btn {
      background: #1A1A1A;
      border-color: rgba(212,175,55,0.1);
      color: #FFFFFF;
    }
    
    .results-count {
      color: #CCCCCC;
    }
    
    .page-dots {
      color: #CCCCCC;
    }
    
    .location-badge {
      background: rgba(212,175,55,0.15);
    }
    
    .no-products h3 {
      color: #FFFFFF;
    }
  }
  
  @media (max-width: 768px) {
    .product-grid.list-view .product-card {
      flex-direction: column;
    }
    
    .product-grid.list-view .product-image {
      width: 100%;
    }
    
    .pagination {
      flex-direction: column;
    }
    
    .page-numbers {
      order: -1;
    }
    
    .page-btn.prev,
    .page-btn.next {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);