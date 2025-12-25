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
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;

  if (!query || query.trim().length < 1) {
    showSearchSuggestions();
    return;
  }

  // Show loading state
  resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<p class="search-no-results">An error occurred. Please try again.</p>';
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

  // Store data for filtering
  window.searchResultsData = { items, sets };

  // Build results with filter dropdown
  let html = `
    <div class="search-results-header">
      <div class="search-filter">
        <label for="search-filter-select">Show:</label>
        <select id="search-filter-select">
          <option value="all">All</option>
          <option value="sets">Sets</option>
          <option value="items">Items</option>
        </select>
      </div>
    </div>
    <div class="search-results-content">
  `;

  // Show sets first
  if (sets.length > 0) {
    html += '<div class="search-category" data-type="sets"><h4>Sets</h4>';
    html += sets.map(set => `
      <a href="/set/${set.slug}" class="search-result-item">
        <img src="${set.images?.[0]?.url || '/images/placeholder.jpg'}" alt="${set.name}">
        <div class="search-result-info">
          <span class="search-result-name">${set.name}</span>
          <div class="search-result-meta">
            <span class="search-style-badge ${set.style.toLowerCase()}">${set.style}</span>
            <span class="search-result-text">${set.room}</span>
          </div>
        </div>
      </a>
    `).join('');
    html += '</div>';
  }

  if (items.length > 0) {
    html += '<div class="search-category" data-type="items"><h4>Items</h4>';
    // Show more items (increase from 6 to 15)
    html += items.slice(0, 15).map(item => `
      <a href="/item/${item.slug}" class="search-result-item">
        <img src="${item.images?.[0]?.url || '/images/placeholder.jpg'}" alt="${item.name}">
        <div class="search-result-info">
          <span class="search-result-name">${item.name}</span>
          <div class="search-result-meta">
            <span class="search-style-badge ${item.style.toLowerCase()}">${item.style}</span>
            <span class="search-result-text">${item.room} · ${item.type}</span>
          </div>
        </div>
      </a>
    `).join('');
    html += '</div>';
  }

  html += '</div>';

  resultsContainer.innerHTML = html;

  // Add filter event listener
  const filterSelect = document.getElementById('search-filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      const value = this.value;
      const setsCategory = document.querySelector('.search-category[data-type="sets"]');
      const itemsCategory = document.querySelector('.search-category[data-type="items"]');

      if (value === 'all') {
        if (setsCategory) setsCategory.style.display = 'block';
        if (itemsCategory) itemsCategory.style.display = 'block';
      } else if (value === 'sets') {
        if (setsCategory) setsCategory.style.display = 'block';
        if (itemsCategory) itemsCategory.style.display = 'none';
      } else if (value === 'items') {
        if (setsCategory) setsCategory.style.display = 'none';
        if (itemsCategory) itemsCategory.style.display = 'block';
      }
    });
  }
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
        <button class="suggestion-tag" data-query="Traditional">Traditional</button>
        <button class="suggestion-tag" data-query="Living Room">Living Room</button>
        <button class="suggestion-tag" data-query="Bedroom">Bedroom</button>
      </div>
    </div>
  `;

  // Add click handlers to suggestion tags
  resultsContainer.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      // Prevent the click from bubbling up to the document level
      e.stopPropagation();

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
      }, 100);
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
