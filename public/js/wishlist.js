// ========== Wishlist Manager - localStorage based ==========
const WISHLIST_KEY = 'pawana_wishlist';

// Get wishlist from localStorage
function getWishlist() {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading wishlist:', e);
    return [];
  }
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    updateWishlistUI();
    dispatchWishlistEvent();
  } catch (e) {
    console.error('Error saving wishlist:', e);
  }
}

// Check if item is in wishlist
function isInWishlist(id, type) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === id && item.type === type);
}

// Add item to wishlist
function addToWishlist(item) {
  const wishlist = getWishlist();
  if (!isInWishlist(item.id, item.type)) {
    wishlist.unshift({
      id: item.id,
      type: item.type, // 'item' or 'set'
      name: item.name,
      slug: item.slug,
      image: item.image,
      addedAt: Date.now()
    });
    saveWishlist(wishlist);
  }
}

// Remove item from wishlist
function removeFromWishlist(id, type) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(item => !(item.id === id && item.type === type));
  saveWishlist(wishlist);
}

// Toggle wishlist item
function toggleWishlist(item) {
  if (isInWishlist(item.id, item.type)) {
    removeFromWishlist(item.id, item.type);
    return false;
  } else {
    addToWishlist(item);
    return true;
  }
}

// Get recent 5 items for preview
function getRecentWishlist(count = 5) {
  return getWishlist().slice(0, count);
}

// Dispatch custom event for UI updates
function dispatchWishlistEvent() {
  window.dispatchEvent(new CustomEvent('wishlistUpdated', {
    detail: { count: getWishlist().length }
  }));
}

// Update wishlist count badge
function updateWishlistUI() {
  const count = getWishlist().length;
  const countBadge = document.querySelector('.wishlist-count');
  if (countBadge) {
    countBadge.textContent = count;
    countBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Update all heart icons on page
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.id;
    const type = btn.dataset.type;
    if (isInWishlist(id, type)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Update wishlist preview dropdown
function updateWishlistPreview() {
  const previewContainer = document.querySelector('.wishlist-preview-items');
  if (!previewContainer) return;

  const recentItems = getRecentWishlist(5);

  if (recentItems.length === 0) {
    previewContainer.innerHTML = '<p class="wishlist-empty">Your wishlist is empty</p>';
    return;
  }

  previewContainer.innerHTML = recentItems.map(item => `
    <a href="/${item.type}/${item.slug}" class="wishlist-preview-item">
      <img src="${item.image}" alt="${item.name}">
      <span>${item.name}</span>
    </a>
  `).join('');
}

// Initialize wishlist on page load
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistUI();
  updateWishlistPreview();

  // Listen for wishlist updates
  window.addEventListener('wishlistUpdated', () => {
    updateWishlistPreview();
  });
});

// Make functions globally available
window.wishlistManager = {
  getWishlist,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  getRecentWishlist
};

// Global wishlist click handler
window.handleWishlistClick = function(event, btn) {
  event.preventDefault();
  event.stopPropagation();

  const item = {
    id: btn.dataset.id,
    type: btn.dataset.type,
    name: btn.dataset.name,
    slug: btn.dataset.slug,
    image: btn.dataset.image
  };

  const isNowInWishlist = toggleWishlist(item);
  btn.classList.toggle('active', isNowInWishlist);
};
