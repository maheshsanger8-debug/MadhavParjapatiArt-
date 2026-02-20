import { i18n } from './i18n.js';
import { animationManager } from './animations.js';

// ============================================
// FILTER BAR - Complete Filter Component with Search, Categories & Sort
// For Madhav Prajapati Art - Handcrafted Clay Diyas
// ============================================

export class FilterBar {
  constructor(options = {}) {
    // Callback functions
    this.onFilterChange = options.onFilterChange || (() => {});
    this.onSortChange = options.onSortChange || (() => {});
    this.onSearch = options.onSearch || (() => {});
    this.onPriceRangeChange = options.onPriceRangeChange || (() => {});
    this.onRatingChange = options.onRatingChange || (() => {});
    this.onStockFilter = options.onStockFilter || (() => {});
    
    // Filter state
    this.filters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      inStockOnly: false,
      sortBy: 'newest'
    };
    
    // UI state
    this.isExpanded = false;
    this.activeFilterCount = 0;
    this.searchQuery = '';
    
    // Price range options
    this.priceRanges = [
      { label: 'Under ₹500', min: 0, max: 500 },
      { label: '₹500 - ₹1000', min: 500, max: 1000 },
      { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
      { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
      { label: 'Above ₹5000', min: 5000, max: null }
    ];
    
    // Rating options
    this.ratingOptions = [
      { value: 0, label: 'All Ratings' },
      { value: 4, label: '4★ & above' },
      { value: 3, label: '3★ & above' },
      { value: 2, label: '2★ & above' },
      { value: 1, label: '1★ & above' }
    ];
  }

  /**
   * Render filter bar
   */
  render() {
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar glass-effect';
    filterBar.setAttribute('data-animate', 'fadeInDown');
    
    filterBar.innerHTML = `
      <!-- Main Filter Bar -->
      <div class="filter-bar-main">
        <!-- Search Box -->
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="search" 
            id="productSearch" 
            placeholder="Search diyas..." 
            data-i18n-placeholder="search_faqs" 
            aria-label="Search products"
            value="${this.searchQuery}"
          >
          ${this.searchQuery ? '<button class="clear-search" aria-label="Clear search"><i class="fas fa-times"></i></button>' : ''}
        </div>
        
        <!-- Filter Group -->
        <div class="filter-group">
          <select id="categoryFilter" class="filter-select" aria-label="Filter by category">
            <option value="all" ${this.filters.category === 'all' ? 'selected' : ''}>All Categories</option>
            <option value="diwali" ${this.filters.category === 'diwali' ? 'selected' : ''}>🪔 Diwali Collection</option>
            <option value="wedding" ${this.filters.category === 'wedding' ? 'selected' : ''}>💍 Wedding Diyas</option>
            <option value="temple" ${this.filters.category === 'temple' ? 'selected' : ''}>🛕 Temple Diyas</option>
            <option value="decorative" ${this.filters.category === 'decorative' ? 'selected' : ''}>🎨 Decorative</option>
            <option value="custom" ${this.filters.category === 'custom' ? 'selected' : ''}>✨ Custom Orders</option>
          </select>
          
          <select id="sortBy" class="filter-select" aria-label="Sort by">
            <option value="newest" ${this.filters.sortBy === 'newest' ? 'selected' : ''}>📅 Newest First</option>
            <option value="price-low" ${this.filters.sortBy === 'price-low' ? 'selected' : ''}>💰 Price: Low to High</option>
            <option value="price-high" ${this.filters.sortBy === 'price-high' ? 'selected' : ''}>💰 Price: High to Low</option>
            <option value="rating" ${this.filters.sortBy === 'rating' ? 'selected' : ''}>⭐ Highest Rated</option>
            <option value="popular" ${this.filters.sortBy === 'popular' ? 'selected' : ''}>🔥 Most Popular</option>
          </select>
          
          <button class="filter-toggle-btn" id="filterToggleBtn" aria-label="Toggle filters">
            <i class="fas fa-sliders-h"></i>
            <span>Filters</span>
            ${this.activeFilterCount > 0 ? `<span class="filter-badge">${this.activeFilterCount}</span>` : ''}
          </button>
        </div>
      </div>
      
      <!-- Advanced Filters Panel (Collapsible) -->
      <div class="advanced-filters" id="advancedFilters" style="display: ${this.isExpanded ? 'block' : 'none'};">
        <div class="filters-grid">
          <!-- Price Range -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <i class="fas fa-rupee-sign"></i> Price Range
            </h4>
            <div class="price-range-inputs">
              <div class="price-input">
                <label for="minPrice">Min (₹)</label>
                <input 
                  type="number" 
                  id="minPrice" 
                  class="filter-input" 
                  placeholder="Min" 
                  min="0" 
                  value="${this.filters.minPrice}"
                >
              </div>
              <span class="price-separator">-</span>
              <div class="price-input">
                <label for="maxPrice">Max (₹)</label>
                <input 
                  type="number" 
                  id="maxPrice" 
                  class="filter-input" 
                  placeholder="Max" 
                  min="0" 
                  value="${this.filters.maxPrice}"
                >
              </div>
            </div>
            
            <!-- Quick Price Ranges -->
            <div class="price-range-buttons">
              ${this.priceRanges.map(range => `
                <button 
                  class="price-range-btn ${this.isPriceRangeSelected(range.min, range.max) ? 'active' : ''}" 
                  data-min="${range.min}" 
                  data-max="${range.max || ''}"
                >
                  ${range.label}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Rating Filter -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <i class="fas fa-star"></i> Minimum Rating
            </h4>
            <div class="rating-options">
              ${this.ratingOptions.map(option => `
                <label class="rating-option">
                  <input 
                    type="radio" 
                    name="minRating" 
                    value="${option.value}" 
                    ${this.filters.minRating === option.value ? 'checked' : ''}
                  >
                  <span class="rating-stars">
                    ${this.getRatingStars(option.value)}
                  </span>
                  <span class="rating-label">${option.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <!-- Stock Filter -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <i class="fas fa-box"></i> Availability
            </h4>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="inStockOnly" 
                ${this.filters.inStockOnly ? 'checked' : ''}
              >
              <span>In Stock Only</span>
            </label>
            
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="excludeOutOfStock" 
                ${this.filters.excludeOutOfStock ? 'checked' : ''}
              >
              <span>Exclude Out of Stock</span>
            </label>
          </div>
          
          <!-- Other Filters -->
          <div class="filter-section">
            <h4 class="filter-section-title">
              <i class="fas fa-tag"></i> Other Filters
            </h4>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="onSaleOnly" 
                ${this.filters.onSaleOnly ? 'checked' : ''}
              >
              <span>On Sale Only</span>
            </label>
            
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                id="newArrivals" 
                ${this.filters.newArrivals ? 'checked' : ''}
              >
              <span>New Arrivals</span>
            </label>
          </div>
        </div>
        
        <!-- Filter Actions -->
        <div class="filter-actions">
          <button class="btn btn-outline" id="resetFiltersBtn">
            <i class="fas fa-undo"></i> Reset All
          </button>
          <button class="btn btn-primary" id="applyFiltersBtn">
            <i class="fas fa-check"></i> Apply Filters
          </button>
        </div>
      </div>
      
      <!-- Active Filters Display -->
      <div class="active-filters" id="activeFilters" style="display: ${this.activeFilterCount > 0 ? 'flex' : 'none'};">
        <span class="active-filters-label">Active Filters:</span>
        <div class="filter-tags" id="filterTags">
          ${this.renderActiveFilterTags()}
        </div>
        <button class="clear-all-filters" id="clearAllFilters">
          Clear All
        </button>
      </div>
    `;

    this.element = filterBar;
    this.attachEventListeners(filterBar);
    this.initTooltips();
    
    return filterBar;
  }

  /**
   * Render active filter tags
   */
  renderActiveFilterTags() {
    const tags = [];
    
    if (this.filters.category && this.filters.category !== 'all') {
      tags.push(this.createFilterTag('category', this.getCategoryLabel(this.filters.category)));
    }
    
    if (this.filters.minPrice) {
      tags.push(this.createFilterTag('minPrice', `Min: ₹${this.filters.minPrice}`));
    }
    
    if (this.filters.maxPrice) {
      tags.push(this.createFilterTag('maxPrice', `Max: ₹${this.filters.maxPrice}`));
    }
    
    if (this.filters.minRating > 0) {
      tags.push(this.createFilterTag('minRating', `${this.filters.minRating}★ & above`));
    }
    
    if (this.filters.inStockOnly) {
      tags.push(this.createFilterTag('inStockOnly', 'In Stock'));
    }
    
    return tags.join('');
  }

  /**
   * Create filter tag HTML
   */
  createFilterTag(type, label) {
    return `
      <span class="filter-tag" data-filter-type="${type}">
        ${label}
        <i class="fas fa-times" data-filter-type="${type}"></i>
      </span>
    `;
  }

  /**
   * Get category label
   */
  getCategoryLabel(category) {
    const labels = {
      diwali: 'Diwali Collection',
      wedding: 'Wedding Diyas',
      temple: 'Temple Diyas',
      decorative: 'Decorative',
      custom: 'Custom Orders'
    };
    return labels[category] || category;
  }

  /**
   * Check if price range is selected
   */
  isPriceRangeSelected(min, max) {
    return this.filters.minPrice == min && 
           (this.filters.maxPrice == max || (max === null && !this.filters.maxPrice));
  }

  /**
   * Get rating stars HTML
   */
  getRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners(element) {
    // Search input with debounce
    const searchInput = element.querySelector('#productSearch');
    const clearSearchBtn = element.querySelector('.clear-search');
    
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.onSearch(this.searchQuery);
        this.updateActiveFilterCount();
      }, 300);
    });

    // Clear search
    clearSearchBtn?.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        this.searchQuery = '';
        this.onSearch('');
        this.updateActiveFilterCount();
        clearSearchBtn.remove();
      }
    });

    // Category filter
    const categoryFilter = element.querySelector('#categoryFilter');
    categoryFilter?.addEventListener('change', (e) => {
      this.filters.category = e.target.value;
      this.updateActiveFilterCount();
      this.onFilterChange(this.filters);
    });

    // Sort select
    const sortSelect = element.querySelector('#sortBy');
    sortSelect?.addEventListener('change', (e) => {
      this.filters.sortBy = e.target.value;
      this.onSortChange(e.target.value);
    });

    // Toggle advanced filters
    const toggleBtn = element.querySelector('#filterToggleBtn');
    const advancedFilters = element.querySelector('#advancedFilters');
    
    toggleBtn?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      if (advancedFilters) {
        advancedFilters.style.display = this.isExpanded ? 'block' : 'none';
      }
      toggleBtn.classList.toggle('active', this.isExpanded);
    });

    // Price range inputs
    const minPrice = element.querySelector('#minPrice');
    const maxPrice = element.querySelector('#maxPrice');

    minPrice?.addEventListener('input', () => {
      this.filters.minPrice = minPrice.value;
      this.onPriceRangeChange({ min: minPrice.value, max: maxPrice.value });
    });

    maxPrice?.addEventListener('input', () => {
      this.filters.maxPrice = maxPrice.value;
      this.onPriceRangeChange({ min: minPrice.value, max: maxPrice.value });
    });

    // Price range buttons
    element.querySelectorAll('.price-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const min = btn.dataset.min;
        const max = btn.dataset.max;
        
        if (minPrice) minPrice.value = min;
        if (maxPrice) maxPrice.value = max;
        
        this.filters.minPrice = min;
        this.filters.maxPrice = max;
        
        this.onPriceRangeChange({ min, max });
        this.updateActiveFilterCount();
        this.updatePriceRangeButtons(element);
      });
    });

    // Rating radio buttons
    element.querySelectorAll('input[name="minRating"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.filters.minRating = parseInt(e.target.value);
        this.onRatingChange(this.filters.minRating);
        this.updateActiveFilterCount();
      });
    });

    // Stock filter
    const inStockCheck = element.querySelector('#inStockOnly');
    inStockCheck?.addEventListener('change', (e) => {
      this.filters.inStockOnly = e.target.checked;
      this.onStockFilter({ inStockOnly: e.target.checked });
      this.updateActiveFilterCount();
    });

    // Apply filters button
    const applyBtn = element.querySelector('#applyFiltersBtn');
    applyBtn?.addEventListener('click', () => {
      this.applyFilters();
      this.isExpanded = false;
      if (advancedFilters) {
        advancedFilters.style.display = 'none';
      }
      toggleBtn?.classList.remove('active');
    });

    // Reset filters button
    const resetBtn = element.querySelector('#resetFiltersBtn');
    resetBtn?.addEventListener('click', () => {
      this.resetFilters();
      this.updateActiveFilterCount();
      this.renderActiveFilterTags(element);
    });

    // Clear all filters
    const clearAllBtn = element.querySelector('#clearAllFilters');
    clearAllBtn?.addEventListener('click', () => {
      this.resetFilters();
    });

    // Remove individual filter tags
    element.addEventListener('click', (e) => {
      if (e.target.matches('.filter-tag i')) {
        const type = e.target.dataset.filterType;
        this.removeFilter(type);
      }
    });
  }

  /**
   * Apply all filters
   */
  applyFilters() {
    this.onFilterChange(this.filters);
    this.onPriceRangeChange({ 
      min: this.filters.minPrice, 
      max: this.filters.maxPrice 
    });
    this.onRatingChange(this.filters.minRating);
    this.onStockFilter({ inStockOnly: this.filters.inStockOnly });
    
    // Update UI
    this.updateActiveFilterCount();
    this.renderActiveFilterTags(this.element);
    
    // Animate apply
    animationManager.animateElement(this.element, 'pulse', 300);
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    // Reset filter state
    this.filters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      inStockOnly: false,
      sortBy: this.filters.sortBy // Preserve sort
    };
    
    this.searchQuery = '';
    
    // Reset UI elements
    const searchInput = this.element?.querySelector('#productSearch');
    if (searchInput) searchInput.value = '';
    
    const categoryFilter = this.element?.querySelector('#categoryFilter');
    if (categoryFilter) categoryFilter.value = 'all';
    
    const minPrice = this.element?.querySelector('#minPrice');
    const maxPrice = this.element?.querySelector('#maxPrice');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    
    const ratingRadios = this.element?.querySelectorAll('input[name="minRating"]');
    ratingRadios?.forEach(radio => {
      if (radio.value === '0') radio.checked = true;
    });
    
    const inStockCheck = this.element?.querySelector('#inStockOnly');
    if (inStockCheck) inStockCheck.checked = false;
    
    // Call filter change
    this.onSearch('');
    this.onFilterChange(this.filters);
    this.onPriceRangeChange({ min: '', max: '' });
    this.onRatingChange(0);
    this.onStockFilter({ inStockOnly: false });
    
    // Update UI
    this.updateActiveFilterCount();
    this.renderActiveFilterTags(this.element);
    this.updatePriceRangeButtons(this.element);
    
    // Close advanced filters
    const advancedFilters = this.element?.querySelector('#advancedFilters');
    const toggleBtn = this.element?.querySelector('#filterToggleBtn');
    if (advancedFilters) advancedFilters.style.display = 'none';
    if (toggleBtn) toggleBtn.classList.remove('active');
    this.isExpanded = false;
  }

  /**
   * Remove specific filter
   */
  removeFilter(type) {
    switch(type) {
      case 'category':
        this.filters.category = 'all';
        const categoryFilter = this.element?.querySelector('#categoryFilter');
        if (categoryFilter) categoryFilter.value = 'all';
        break;
        
      case 'minPrice':
      case 'maxPrice':
        this.filters.minPrice = '';
        this.filters.maxPrice = '';
        const minPrice = this.element?.querySelector('#minPrice');
        const maxPrice = this.element?.querySelector('#maxPrice');
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        break;
        
      case 'minRating':
        this.filters.minRating = 0;
        const ratingRadios = this.element?.querySelectorAll('input[name="minRating"]');
        ratingRadios?.forEach(radio => {
          if (radio.value === '0') radio.checked = true;
        });
        break;
        
      case 'inStockOnly':
        this.filters.inStockOnly = false;
        const stockCheck = this.element?.querySelector('#inStockOnly');
        if (stockCheck) stockCheck.checked = false;
        break;
    }
    
    this.updateActiveFilterCount();
    this.onFilterChange(this.filters);
    this.renderActiveFilterTags(this.element);
  }

  /**
   * Update active filter count
   */
  updateActiveFilterCount() {
    let count = 0;
    if (this.filters.category && this.filters.category !== 'all') count++;
    if (this.filters.minPrice) count++;
    if (this.filters.maxPrice) count++;
    if (this.filters.minRating > 0) count++;
    if (this.filters.inStockOnly) count++;
    if (this.searchQuery) count++;
    
    this.activeFilterCount = count;
    
    // Update UI
    const badge = this.element?.querySelector('.filter-badge');
    const activeFilters = this.element?.querySelector('#activeFilters');
    const filterTags = this.element?.querySelector('#filterTags');
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    
    if (activeFilters) {
      activeFilters.style.display = count > 0 ? 'flex' : 'none';
    }
    
    if (filterTags) {
      filterTags.innerHTML = this.renderActiveFilterTags();
    }
  }

  /**
   * Update price range buttons active state
   */
  updatePriceRangeButtons(element) {
    const buttons = element.querySelectorAll('.price-range-btn');
    buttons.forEach(btn => {
      const min = btn.dataset.min;
      const max = btn.dataset.max;
      
      if (this.filters.minPrice == min && 
          (this.filters.maxPrice == max || (max === '' && !this.filters.maxPrice))) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Initialize tooltips
   */
  initTooltips() {
    // Add tooltips to filter elements
    const filterToggle = this.element?.querySelector('#filterToggleBtn');
    if (filterToggle) {
      filterToggle.setAttribute('title', 'Show advanced filters');
    }
  }

  /**
   * Get current filter state
   */
  getFilters() {
    return { ...this.filters };
  }

  /**
   * Set filter state
   */
  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.updateActiveFilterCount();
    this.onFilterChange(this.filters);
  }

  /**
   * Get search query
   */
  getSearchQuery() {
    return this.searchQuery;
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery = '';
    const searchInput = this.element?.querySelector('#productSearch');
    if (searchInput) {
      searchInput.value = '';
      this.onSearch('');
    }
  }

  /**
   * Destroy filter bar
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    console.log('🧹 FilterBar destroyed');
  }
}

// ============================================
// ADDITIONAL CSS FOR FILTER BAR
// ============================================
const style = document.createElement('style');
style.textContent = `
  .filter-bar {
    background: white;
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid rgba(212,175,55,0.1);
  }
  
  .filter-bar-main {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
  }
  
  .search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid transparent;
    border-radius: 50px;
    background: #f5f5f5;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s ease;
  }
  
  .search-box input:focus {
    outline: none;
    border-color: #D4AF37;
    background: white;
    box-shadow: 0 0 0 4px rgba(212,175,55,0.1);
  }
  
  .search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  
  .clear-search {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
  }
  
  .clear-search:hover {
    color: #D4AF37;
  }
  
  .filter-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .filter-select {
    padding: 0.75rem 2rem 0.75rem 1rem;
    border: 2px solid transparent;
    border-radius: 50px;
    background: #f5f5f5;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    min-width: 160px;
  }
  
  .filter-select:focus {
    outline: none;
    border-color: #D4AF37;
    background-color: white;
  }
  
  .filter-toggle-btn {
    padding: 0.75rem 1.5rem;
    background: #f5f5f5;
    border: 2px solid transparent;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .filter-toggle-btn:hover {
    background: rgba(212,175,55,0.1);
    border-color: #D4AF37;
  }
  
  .filter-toggle-btn.active {
    background: linear-gradient(135deg, #D4AF37, #FF8C42);
    color: white;
  }
  
  .filter-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #DC3545;
    color: white;
    font-size: 0.7rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .advanced-filters {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0,0,0,0.1);
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .filter-section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0F0F0F;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .filter-section-title i {
    color: #D4AF37;
  }
  
  .price-range-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .price-input {
    flex: 1;
  }
  
  .price-input label {
    display: block;
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .filter-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
  }
  
  .price-separator {
    color: #666;
    font-weight: 600;
  }
  
  .price-range-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .price-range-btn {
    padding: 0.4rem 0.8rem;
    background: #f5f5f5;
    border: 1px solid #E0E0E0;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .price-range-btn:hover {
    background: rgba(212,175,55,0.1);
    border-color: #D4AF37;
  }
  
  .price-range-btn.active {
    background: #D4AF37;
    color: white;
    border-color: #D4AF37;
  }
  
  .rating-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .rating-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .rating-stars {
    color: #D4AF37;
    font-size: 0.9rem;
  }
  
  .rating-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
  }
  
  .filter-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,0,0,0.1);
  }
  
  .active-filters {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .active-filters-label {
    font-size: 0.85rem;
    color: #666;
  }
  
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex: 1;
  }
  
  .filter-tag {
    background: rgba(212,175,55,0.1);
    color: #B8860B;
    padding: 0.3rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .filter-tag i {
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .filter-tag i:hover {
    color: #DC3545;
  }
  
  .clear-all-filters {
    background: none;
    border: none;
    color: #DC3545;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: underline;
  }
  
  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .filter-bar {
      background: #1A1A1A;
    }
    
    .search-box input,
    .filter-select,
    .filter-toggle-btn,
    .filter-input,
    .price-range-btn {
      background: #2A2A2A;
      color: #FFFFFF;
      border-color: #404040;
    }
    
    .filter-section-title {
      color: #FFFFFF;
    }
    
    .filter-section-title i {
      color: #D4AF37;
    }
    
    .rating-label,
    .checkbox-label,
    .active-filters-label {
      color: #CCCCCC;
    }
    
    .filter-tag {
      background: rgba(212,175,55,0.15);
    }
    
    .advanced-filters,
    .filter-actions,
    .active-filters {
      border-top-color: #404040;
    }
  }
  
  /* Mobile Responsive */
  @media (max-width: 768px) {
    .filter-bar-main {
      flex-direction: column;
    }
    
    .search-box {
      width: 100%;
    }
    
    .filter-group {
      width: 100%;
    }
    
    .filter-select {
      flex: 1;
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .filter-actions {
      flex-direction: column;
    }
    
    .filter-actions button {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);