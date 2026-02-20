// ============================================
// CURRENCY FORMATTER - Premium Currency Utilities
// For Madhav Prajapati Art - Handcrafted Clay Diyas
// ============================================

export class CurrencyFormatter {
  constructor() {
    this.currency = 'INR';
    this.locale = 'en-IN';
    this.currencySymbol = '₹';
    this.decimalSeparator = '.';
    this.thousandSeparator = ',';
  }

  /**
   * Format amount with default settings (no decimals)
   */
  format(amount) {
    if (amount === undefined || amount === null) return '₹0';
    
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `₹${this.formatNumber(amount, 0)}`;
    }
  }

  /**
   * Format amount with 2 decimal places
   */
  formatWithDecimals(amount) {
    if (amount === undefined || amount === null) return '₹0.00';
    
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `₹${this.formatNumber(amount, 2)}`;
    }
  }

  /**
   * Format amount in compact form (K, L, Cr)
   */
  formatCompact(amount) {
    if (amount === undefined || amount === null) return '₹0';
    
    // Indian Numbering System
    if (amount >= 10000000) { // 1 Crore = 10 Million
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) { // 1 Lakh = 100 Thousand
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  }

  /**
   * Format amount with Indian numbering system (lakhs, crores)
   */
  formatIndian(amount) {
    if (amount === undefined || amount === null) return '₹0';
    
    const num = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (num >= 10000000) { // Crore
      return `${sign}₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) { // Lakh
      return `${sign}₹${(num / 100000).toFixed(2)} L`;
    }
    if (num >= 1000) { // Thousand
      return `${sign}₹${(num / 1000).toFixed(2)} K`;
    }
    
    return `${sign}₹${num}`;
  }

  /**
   * Format price range (e.g., "₹1,000 - ₹2,000")
   */
  formatRange(min, max) {
    return `${this.format(min)} - ${this.format(max)}`;
  }

  /**
   * Format discount percentage
   */
  formatDiscount(originalPrice, discountedPrice) {
    if (!originalPrice || !discountedPrice) return '';
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return `${Math.round(discount)}% OFF`;
  }

  /**
   * Calculate EMI (Equal Monthly Installment)
   */
  calculateEMI(amount, interestRate = 0, tenureMonths = 3) {
    if (!amount || amount <= 0) return 0;
    
    // Simple EMI calculation (without interest for now)
    const emi = amount / tenureMonths;
    return Math.round(emi);
  }

  /**
   * Format EMI
   */
  formatEMI(amount, interestRate = 0, tenureMonths = 3) {
    const emi = this.calculateEMI(amount, interestRate, tenureMonths);
    return `${this.format(emi)}/mo for ${tenureMonths} months`;
  }

  /**
   * Parse currency string to number
   */
  parse(str) {
    if (!str) return 0;
    
    // Remove currency symbol, commas, and spaces
    const cleaned = str.replace(/[₹,\s]/g, '');
    
    // Handle Indian units (K, L, Cr)
    if (cleaned.includes('K') || cleaned.includes('k')) {
      return parseFloat(cleaned) * 1000;
    }
    if (cleaned.includes('L') || cleaned.includes('l')) {
      return parseFloat(cleaned) * 100000;
    }
    if (cleaned.includes('Cr') || cleaned.includes('cr')) {
      return parseFloat(cleaned) * 10000000;
    }
    
    return Number(cleaned) || 0;
  }

  /**
   * Format number with thousand separators
   */
  formatNumber(amount, decimals = 0) {
    if (amount === undefined || amount === null) return '0';
    
    const num = Number(amount);
    if (isNaN(num)) return '0';
    
    // Round to specified decimals
    const rounded = decimals === 0 ? Math.round(num) : num.toFixed(decimals);
    
    // Add thousand separators
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
  }

  /**
   * Format with Indian numbering system (lakhs, crores) - Full version
   */
  formatIndianFull(amount) {
    if (amount === undefined || amount === null) return '₹0';
    
    const num = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    // Handle different ranges
    if (num >= 10000000) { // 1 Crore and above
      const crores = Math.floor(num / 10000000);
      const lakhs = Math.floor((num % 10000000) / 100000);
      if (lakhs > 0) {
        return `${sign}₹${crores} Cr ${lakhs} L`;
      }
      return `${sign}₹${crores} Cr`;
    }
    
    if (num >= 100000) { // 1 Lakh and above
      const lakhs = Math.floor(num / 100000);
      const thousands = Math.floor((num % 100000) / 1000);
      if (thousands > 0) {
        return `${sign}₹${lakhs} L ${thousands} K`;
      }
      return `${sign}₹${lakhs} L`;
    }
    
    if (num >= 1000) { // 1 Thousand and above
      return `${sign}₹${this.formatNumber(num)}`;
    }
    
    return `${sign}₹${num}`;
  }

  /**
   * Convert number to words (Indian currency)
   */
  numberToWords(amount) {
    if (!amount || amount === 0) return 'Zero Rupees';
    
    const num = Math.abs(amount);
    const paise = Math.round((num - Math.floor(num)) * 100);
    const rupees = Math.floor(num);
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                  'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convertLessThanThousand(n) {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      }
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    }
    
    function convert(n) {
      if (n === 0) return '';
      
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const remainder = n % 1000;
      
      let result = '';
      
      if (crore > 0) {
        result += convertLessThanThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' Thousand ';
      }
      if (remainder > 0) {
        result += convertLessThanThousand(remainder);
      }
      
      return result.trim();
    }
    
    let words = convert(rupees) + ' Rupee' + (rupees !== 1 ? 's' : '');
    
    if (paise > 0) {
      words += ' and ' + convert(paise) + ' Paise';
    }
    
    return words;
  }

  /**
   * Get currency symbol
   */
  getSymbol() {
    return this.currencySymbol;
  }

  /**
   * Set currency type
   */
  setCurrency(currency) {
    this.currency = currency;
    this.updateSymbol();
  }

  /**
   * Set locale
   */
  setLocale(locale) {
    this.locale = locale;
  }

  /**
   * Update currency symbol based on currency code
   */
  updateSymbol() {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥'
    };
    this.currencySymbol = symbols[this.currency] || '₹';
  }

  /**
   * Compare two prices
   */
  compare(price1, price2) {
    if (price1 < price2) return -1;
    if (price1 > price2) return 1;
    return 0;
  }

  /**
   * Get minimum price from array
   */
  min(prices) {
    if (!prices || prices.length === 0) return 0;
    return Math.min(...prices.filter(p => p > 0));
  }

  /**
   * Get maximum price from array
   */
  max(prices) {
    if (!prices || prices.length === 0) return 0;
    return Math.max(...prices);
  }

  /**
   * Calculate average price
   */
  average(prices) {
    if (!prices || prices.length === 0) return 0;
    const sum = prices.reduce((a, b) => a + b, 0);
    return sum / prices.length;
  }

  /**
   * Check if price is in range
   */
  isInRange(price, min, max) {
    return price >= min && price <= max;
  }

  /**
   * Apply discount to price
   */
  applyDiscount(price, discountPercent) {
    const discount = (price * discountPercent) / 100;
    return price - discount;
  }

  /**
   * Calculate tax amount
   */
  calculateTax(price, taxRate = 18) {
    return (price * taxRate) / 100;
  }

  /**
   * Calculate total with tax
   */
  totalWithTax(price, taxRate = 18) {
    return price + this.calculateTax(price, taxRate);
  }

  /**
   * Format for invoice display
   */
  formatInvoice(amount) {
    return {
      amount: this.format(amount),
      amountWithDecimals: this.formatWithDecimals(amount),
      inWords: this.numberToWords(amount),
      compact: this.formatCompact(amount),
      indian: this.formatIndian(amount)
    };
  }

  /**
   * Validate price
   */
  isValidPrice(price) {
    return price !== undefined && 
           price !== null && 
           !isNaN(price) && 
           price >= 0 && 
           isFinite(price);
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================
export const currencyFormatter = new CurrencyFormatter();

// ============================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================

/**
 * Format price for product cards (static function)
 */
export function formatProductPrice(price, discount = 0) {
  const formatter = currencyFormatter;
  
  if (discount > 0) {
    const discountedPrice = formatter.applyDiscount(price, discount);
    return {
      original: formatter.format(price),
      discounted: formatter.format(discountedPrice),
      discount: formatter.formatDiscount(price, discountedPrice)
    };
  }
  
  return {
    original: formatter.format(price),
    discounted: null,
    discount: null
  };
}

/**
 * Calculate installment amount
 */
export function calculateInstallment(price, months = 3) {
  return currencyFormatter.formatEMI(price, 0, months);
}

/**
 * Compare prices and return best deal
 */
export function getBestDeal(prices) {
  if (!prices || prices.length === 0) return null;
  
  const min = currencyFormatter.min(prices);
  const max = currencyFormatter.max(prices);
  const avg = currencyFormatter.average(prices);
  
  return {
    min: currencyFormatter.format(min),
    max: currencyFormatter.format(max),
    average: currencyFormatter.format(avg),
    savings: currencyFormatter.format(max - min)
  };
}

// ============================================
// ADD CSS STYLES FOR CURRENCY DISPLAY
// ============================================
const style = document.createElement('style');
style.textContent = `
  .price {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    color: #D4AF37;
  }
  
  .price.original {
    text-decoration: line-through;
    color: #999;
    font-size: 0.9em;
    font-weight: 400;
  }
  
  .price.discounted {
    color: #28A745;
    font-weight: 700;
  }
  
  .price.discount-badge {
    background: rgba(40, 167, 69, 0.1);
    color: #28A745;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
  }
  
  .price-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .price-emi {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .price-emi strong {
    color: #D4AF37;
  }
`;

document.head.appendChild(style);