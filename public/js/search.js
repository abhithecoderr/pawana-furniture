// ========== Inline Search Functionality ==========

let searchTimeout = null;
const SEARCH_DEBOUNCE = 300;
let hasTyped = false;

// Toggle search expansion
function toggleSearch(expand) {
  const wrapper = document.querySelector('.search-wrapper');
  const searchInput = wrapper?.querySelector('.search-input');

  if (wrapper) {
    if (expand) {
      wrapper.classList.add('expanded');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
      showSearchSuggestions();
    } else {
      wrapper.classList.remove('expanded');
      clearSearchResults();
      hasTyped = false;
    }
  }
}

// Perform search
async function performSearch(query) {
  if (!query || query.trim().length < 2) {
    showSearchSuggestions();
    return;
  }

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error('Search error:', error);
  }
}

// Display search results
function displaySearchResults(data) {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;

  const { items, sets } = data;

  if (items.length === 0 && sets.length === 0) {
    resultsContainer.innerHTML = '<p class="search-no-results">No results found</p>';
    return;
  }

  let html = '';

  // Show max 3 items total for compact view
  if (sets.length > 0) {
    html += '<div class="search-category"><h4>Sets</h4>';
    html += sets.slice(0, 2).map(set => `
      <a href="/set/${set.slug}" class="search-result-item">
        <img src="${set.images?.[0]?.url || '/images/placeholder.jpg'}" alt="${set.name}">
        <div class="search-result-info">
          <span class="search-result-name">${set.name}</span>
          <span class="search-result-meta">${set.style} · ${set.room}</span>
        </div>
      </a>
    `).join('');
    html += '</div>';
  }

  if (items.length > 0) {
    html += '<div class="search-category"><h4>Items</h4>';
    html += items.slice(0, 3).map(item => `
      <a href="/item/${item.slug}" class="search-result-item">
        <img src="${item.images?.[0]?.url || '/images/placeholder.jpg'}" alt="${item.name}">
        <div class="search-result-info">
          <span class="search-result-name">${item.name}</span>
          <span class="search-result-meta">${item.type} · ${item.style}</span>
        </div>
      </a>
    `).join('');
    html += '</div>';
  }

  resultsContainer.innerHTML = html;
}

// Show default search suggestions
function showSearchSuggestions() {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = `
    <div class="search-suggestions">
      <h4>Popular Searches</h4>
      <div class="suggestion-tags">
        <button class="suggestion-tag" data-query="Royal">Royal</button>
        <button class="suggestion-tag" data-query="Modern">Modern</button>
        <button class="suggestion-tag" data-query="Sofa">Sofa</button>
        <button class="suggestion-tag" data-query="Bed">Bed</button>
        <button class="suggestion-tag" data-query="Dining">Dining</button>
      </div>
    </div>
  `;

  // Add click handlers to suggestion tags
  resultsContainer.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.value = tag.dataset.query;
        hasTyped = true;
        performSearch(tag.dataset.query);
      }
    });
  });
}

// Clear search results
function clearSearchResults() {
  const searchInput = document.querySelector('.search-input');
  const resultsContainer = document.querySelector('.search-results');

  if (searchInput) searchInput.value = '';
  if (resultsContainer) resultsContainer.innerHTML = '';
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.search-wrapper');
  const searchIcon = document.querySelector('.search-icon');
  const closeSearch = document.querySelector('.search-box .search-close');
  const searchInput = document.querySelector('.search-input');

  if (!wrapper) return;

  // Expand on hover over search icon
  searchIcon?.addEventListener('mouseenter', () => {
    toggleSearch(true);
  });

  // Close search button
  closeSearch?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSearch(false);
  });

  // Search input with debounce
  searchInput?.addEventListener('input', (e) => {
    hasTyped = e.target.value.length > 0;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, SEARCH_DEBOUNCE);
  });

  // Keyboard shortcuts
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleSearch(false);
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      toggleSearch(false);
    }
  });

  // Close when mouse leaves if user hasn't typed anything
  wrapper.addEventListener('mouseleave', () => {
    if (!hasTyped && wrapper.classList.contains('expanded')) {
      // Small delay to prevent accidental closing
      setTimeout(() => {
        if (!hasTyped && !wrapper.matches(':hover')) {
          toggleSearch(false);
        }
      }, 300);
    }
  });

  // Keyboard shortcut to open search (Ctrl/Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch(true);
    }
  });
});
