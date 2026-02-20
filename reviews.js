import { authService } from './auth.js';
import { db, collection, addDoc, query, where, orderBy, getDocs, Timestamp } from './firebase.js';

export class Reviews {
  constructor(productId) {
    this.productId = productId;
    this.reviews = [];
    this.isLoading = false;
    this.container = null;
  }

  async render() {
    await this.loadReviews();
    
    this.container = document.createElement('div');
    this.container.className = 'reviews-section';
    
    this.renderContent();
    this.attachEventListeners();
    
    return this.container;
  }

  renderContent() {
    if (this.isLoading) {
      this.container.innerHTML = this.renderLoading();
      return;
    }

    this.container.innerHTML = `
      <div class="reviews-header">
        <h3 class="reviews-title" data-i18n="customer_reviews">Customer Reviews</h3>
        ${this.renderSummary()}
        <button class="btn btn-outline" id="writeReviewBtn" data-i18n="write_review">
          <i class="fas fa-pen"></i> Write a Review
        </button>
      </div>
      <div id="reviewFormContainer" style="display: none;"></div>
      <div class="reviews-list">
        ${this.reviews.length > 0 
          ? this.reviews.map(review => this.renderReview(review)).join('')
          : this.renderEmptyState()}
      </div>
    `;
  }

  renderLoading() {
    return `
      <div class="reviews-loading">
        <div class="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="no-reviews">
        <i class="fas fa-star fa-3x" style="color: #ddd; margin-bottom: 1rem;"></i>
        <p data-i18n="no_reviews">No reviews yet. Be the first to review this product!</p>
      </div>
    `;
  }

  async loadReviews() {
    this.isLoading = true;
    
    try {
      // Load reviews from Firestore
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef, 
        where('productId', '==', this.productId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      this.reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
      
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Fallback to mock data if Firestore fails
      this.reviews = this.getMockReviews();
    } finally {
      this.isLoading = false;
    }
  }

  getMockReviews() {
    // Mock data for development/testing
    return [
      {
        id: '1',
        userName: 'Priya Sharma',
        userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 5,
        comment: 'Beautiful craftsmanship! The gold diyas added such elegance to our Diwali puja. Will definitely order more.',
        date: new Date('2024-01-15'),
        verified: true
      },
      {
        id: '2',
        userName: 'Rahul Mehta',
        userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4,
        comment: 'The quality is exceptional. Each piece is unique and handcrafted with love. Fast shipping too!',
        date: new Date('2024-01-10'),
        verified: true
      },
      {
        id: '3',
        userName: 'Neha Gupta',
        userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 5,
        comment: 'Perfect for our wedding decorations. Guests loved the traditional touch. Highly recommended!',
        date: new Date('2024-01-05'),
        verified: true
      }
    ];
  }

  renderSummary() {
    const avgRating = this.calculateAverageRating();
    const ratingCounts = this.calculateRatingCounts();
    
    return `
      <div class="reviews-summary">
        <div class="rating-summary">
          <span class="average-rating">${avgRating.toFixed(1)}</span>
          <div class="rating-stars">${this.renderRatingStars(avgRating)}</div>
          <span class="total-reviews">(${this.reviews.length} ${this.reviews.length === 1 ? 'review' : 'reviews'})</span>
        </div>
        
        <div class="rating-breakdown">
          ${[5,4,3,2,1].map(stars => this.renderRatingBar(stars, ratingCounts[stars])).join('')}
        </div>
      </div>
    `;
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  calculateRatingCounts() {
    const counts = {5:0, 4:0, 3:0, 2:0, 1:0};
    this.reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating]++;
      }
    });
    return counts;
  }

  renderRatingBar(stars, count) {
    const percentage = this.reviews.length > 0 ? (count / this.reviews.length) * 100 : 0;
    
    return `
      <div class="rating-bar">
        <span class="rating-bar-label">${stars} <i class="fas fa-star"></i></span>
        <div class="rating-bar-progress">
          <div class="rating-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="rating-bar-count">${count}</span>
      </div>
    `;
  }

  renderReview(review) {
    return `
      <div class="review-card" data-review-id="${review.id}">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              ${review.userAvatar 
                ? `<img src="${review.userAvatar}" alt="${review.userName}">` 
                : review.userName?.charAt(0) || 'U'
              }
            </div>
            <div>
              <strong>${review.userName}</strong>
              <div class="review-meta">
                <span class="review-date">
                  <i class="far fa-calendar-alt"></i> ${this.formatDate(review.date)}
                </span>
                ${review.verified ? `
                  <span class="verified-badge">
                    <i class="fas fa-check-circle"></i> Verified Purchase
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
          <div class="review-rating">${this.renderRatingStars(review.rating)}</div>
        </div>
        <p class="review-text">${this.escapeHtml(review.comment)}</p>
        ${review.images && review.images.length > 0 ? `
          <div class="review-images">
            ${review.images.map(img => `
              <img src="${img}" alt="Review image" class="review-image" onclick="window.open('${img}')">
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  renderReviewForm() {
    return `
      <div class="review-form">
        <h4><i class="fas fa-pen"></i> Write a Review</h4>
        
        <div class="rating-input">
          <label>Your Rating <span class="required">*</span></label>
          <div class="star-rating">
            ${[5,4,3,2,1].map(star => `
              <div class="star-input">
                <input type="radio" name="rating" id="star${star}" value="${star}">
                <label for="star${star}" title="${star} stars">
                  <i class="fas fa-star"></i>
                </label>
              </div>
            `).reverse().join('')}
          </div>
        </div>
        
        <div class="form-group">
          <label for="reviewTitle">Review Title <span class="optional">(optional)</span></label>
          <input type="text" id="reviewTitle" class="form-input" 
                 placeholder="Summarize your experience">
        </div>
        
        <div class="form-group">
          <label for="reviewComment">Your Review <span class="required">*</span></label>
          <textarea id="reviewComment" class="form-input" rows="4" 
                    placeholder="What did you like or dislike? What did you use this product for?"></textarea>
        </div>
        
        <div class="form-group">
          <label for="reviewImages">Add Photos <span class="optional">(optional)</span></label>
          <div class="image-upload-area" id="imageUploadArea">
            <i class="fas fa-cloud-upload-alt fa-2x"></i>
            <p>Click to upload or drag and drop</p>
            <small>PNG, JPG up to 5MB</small>
            <input type="file" id="reviewImages" accept="image/*" multiple style="display: none;">
          </div>
          <div class="image-preview" id="imagePreview"></div>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-outline" id="cancelReviewBtn">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn btn-primary" id="submitReviewBtn" disabled>
            <i class="fas fa-paper-plane"></i> Submit Review
          </button>
        </div>
      </div>
    `;
  }

  async submitReview(reviewData) {
    try {
      // Show loading state
      const submitBtn = this.container.querySelector('#submitReviewBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;

      // Prepare review data
      const review = {
        productId: this.productId,
        userId: authService.currentUser?.uid || 'anonymous',
        userName: authService.currentUser?.displayName || 'Anonymous User',
        userAvatar: authService.currentUser?.photoURL || null,
        rating: parseInt(reviewData.rating),
        title: reviewData.title || '',
        comment: reviewData.comment,
        images: reviewData.images || [],
        verified: true, // Check if user actually purchased
        date: Timestamp.fromDate(new Date()),
        helpful: 0,
        reported: false
      };

      // Save to Firestore
      const reviewsRef = collection(db, 'reviews');
      const docRef = await addDoc(reviewsRef, review);

      // Add to local state
      this.reviews.unshift({
        id: docRef.id,
        ...review,
        date: new Date()
      });

      // Update UI
      this.renderContent();
      
      // Show success message
      this.showNotification('Thank you for your review!', 'success');

      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      this.showNotification('Failed to submit review. Please try again.', 'error');
      
      // Reset button
      const submitBtn = this.container.querySelector('#submitReviewBtn');
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
      submitBtn.disabled = false;
      
      return false;
    }
  }

  attachEventListeners() {
    const writeBtn = this.container.querySelector('#writeReviewBtn');
    const formContainer = this.container.querySelector('#reviewFormContainer');

    writeBtn?.addEventListener('click', () => this.handleWriteReview());
  }

  handleWriteReview() {
    if (!authService.isAuthenticated()) {
      this.showLoginPrompt();
      return;
    }

    // Check if user already reviewed
    const userReview = this.reviews.find(r => r.userId === authService.currentUser?.uid);
    if (userReview) {
      alert('You have already reviewed this product. You can edit your existing review.');
      return;
    }

    const formContainer = this.container.querySelector('#reviewFormContainer');
    const writeBtn = this.container.querySelector('#writeReviewBtn');

    formContainer.innerHTML = this.renderReviewForm();
    formContainer.style.display = 'block';
    writeBtn.style.display = 'none';

    this.attachFormListeners();
    this.attachImageUploadListeners();
  }

  attachFormListeners() {
    const container = this.container;
    const cancelBtn = container.querySelector('#cancelReviewBtn');
    const formContainer = container.querySelector('#reviewFormContainer');
    const writeBtn = container.querySelector('#writeReviewBtn');
    const submitBtn = container.querySelector('#submitReviewBtn');
    const commentInput = container.querySelector('#reviewComment');
    const ratingInputs = container.querySelectorAll('input[name="rating"]');

    cancelBtn?.addEventListener('click', () => {
      formContainer.style.display = 'none';
      writeBtn.style.display = 'block';
    });

    // Enable submit button only when required fields are filled
    const validateForm = () => {
      const rating = container.querySelector('input[name="rating"]:checked')?.value;
      const comment = commentInput?.value.trim();
      submitBtn.disabled = !rating || !comment;
    };

    ratingInputs.forEach(input => {
      input.addEventListener('change', validateForm);
    });

    commentInput?.addEventListener('input', validateForm);

    submitBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const rating = container.querySelector('input[name="rating"]:checked')?.value;
      const title = container.querySelector('#reviewTitle')?.value;
      const comment = commentInput?.value.trim();
      const images = this.getUploadedImages();

      if (!rating) {
        this.showNotification('Please select a rating', 'error');
        return;
      }

      if (!comment) {
        this.showNotification('Please write a review', 'error');
        return;
      }

      const success = await this.submitReview({
        rating,
        title,
        comment,
        images
      });

      if (success) {
        formContainer.style.display = 'none';
        writeBtn.style.display = 'block';
      }
    });
  }

  attachImageUploadListeners() {
    const uploadArea = this.container.querySelector('#imageUploadArea');
    const fileInput = this.container.querySelector('#reviewImages');
    const preview = this.container.querySelector('#imagePreview');

    uploadArea?.addEventListener('click', () => {
      fileInput.click();
    });

    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      this.handleImageUpload(e.dataTransfer.files);
    });

    fileInput?.addEventListener('change', (e) => {
      this.handleImageUpload(e.target.files);
    });
  }

  handleImageUpload(files) {
    const preview = this.container.querySelector('#imagePreview');
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).slice(0, maxFiles).forEach(file => {
      if (file.size > maxSize) {
        this.showNotification(`File ${file.name} is too large (max 5MB)`, 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.showNotification(`File ${file.name} is not an image`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'preview-image';
        imgContainer.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button class="remove-image" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        `;
        preview.appendChild(imgContainer);
      };
      reader.readAsDataURL(file);
    });
  }

  getUploadedImages() {
    const preview = this.container.querySelector('#imagePreview');
    const images = [];
    preview.querySelectorAll('img').forEach(img => {
      images.push(img.src);
    });
    return images;
  }

  showLoginPrompt() {
    if (confirm('Please login to write a review')) {
      window.location.hash = `login?redirect=product&id=${this.productId}`;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  formatDate(date) {
    if (!date) return '';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Add CSS styles for reviews
const style = document.createElement('style');
style.textContent = `
  .reviews-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .reviews-title {
    font-size: 1.5rem;
    margin: 0;
  }

  .reviews-summary {
    flex: 1;
    min-width: 300px;
  }

  .rating-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .average-rating {
    font-size: 2rem;
    font-weight: 700;
    color: #D4AF37;
  }

  .rating-stars {
    color: #D4AF37;
    font-size: 1.1rem;
  }

  .total-reviews {
    color: #666;
    font-size: 0.9rem;
  }

  .rating-breakdown {
    max-width: 300px;
  }

  .rating-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .rating-bar-label {
    width: 50px;
    font-size: 0.9rem;
  }

  .rating-bar-label i {
    color: #D4AF37;
    font-size: 0.8rem;
  }

  .rating-bar-progress {
    flex: 1;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .rating-bar-fill {
    height: 100%;
    background: #D4AF37;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .rating-bar-count {
    width: 30px;
    font-size: 0.8rem;
    color: #666;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .review-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }

  .review-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .reviewer-info {
    display: flex;
    gap: 1rem;
  }

  .reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #D4AF37;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    overflow: hidden;
  }

  .reviewer-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .review-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .verified-badge {
    color: #28a745;
  }

  .verified-badge i {
    font-size: 0.8rem;
  }

  .review-rating {
    color: #D4AF37;
  }

  .review-text {
    line-height: 1.6;
    color: #333;
    margin: 1rem 0;
  }

  .review-images {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .review-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 5px;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .review-image:hover {
    opacity: 0.8;
  }

  .no-reviews {
    text-align: center;
    padding: 3rem;
    background: #f9f9f9;
    border-radius: 10px;
    color: #666;
  }

  .review-form {
    background: #f9f9f9;
    padding: 2rem;
    border-radius: 10px;
    margin: 1rem 0;
  }

  .star-rating {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .star-input {
    position: relative;
  }

  .star-input input {
    display: none;
  }

  .star-input label {
    font-size: 1.5rem;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
  }

  .star-input:hover label,
  .star-input:hover ~ .star-input label {
    color: #D4AF37;
  }

  .star-input input:checked ~ label {
    color: #D4AF37;
  }

  .required {
    color: #dc3545;
    margin-left: 2px;
  }

  .optional {
    color: #6c757d;
    font-size: 0.85rem;
    font-weight: normal;
    margin-left: 2px;
  }

  .image-upload-area {
    border: 2px dashed #ddd;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .image-upload-area:hover,
  .image-upload-area.dragover {
    border-color: #D4AF37;
    background: rgba(212,175,55,0.05);
  }

  .image-upload-area i {
    color: #D4AF37;
    margin-bottom: 0.5rem;
  }

  .image-upload-area small {
    display: block;
    color: #999;
    margin-top: 0.5rem;
  }

  .image-preview {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .preview-image {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }

  .remove-image {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #dc3545;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  .remove-image:hover {
    background: #c82333;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 1000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }

  .notification-success {
    border-left: 4px solid #28a745;
  }

  .notification-success i {
    color: #28a745;
  }

  .notification-error {
    border-left: 4px solid #dc3545;
  }

  .notification-error i {
    color: #dc3545;
  }

  .notification-info {
    border-left: 4px solid #17a2b8;
  }

  .notification-info i {
    color: #17a2b8;
  }

  @media (max-width: 768px) {
    .reviews-header {
      flex-direction: column;
      align-items: stretch;
    }

    .review-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions .btn {
      width: 100%;
    }
  }
`;

document.head.appendChild(style);

export default Reviews;