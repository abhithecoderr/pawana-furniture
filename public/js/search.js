// ========== Search Functionality ==========

let searchTimeout = null;
const SEARCH_DEBOUNCE = 300;

// Toggle search overlay
function toggleSearchOverlay(show) {
  const overlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-overlay input');

  if (overlay) {
    if (show) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    } else {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      clearSearchResults();
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

  if (sets.length > 0) {
    html += '<div class="search-category"><h4>Furniture Sets</h4>';
    html += sets.map(set => `
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
    html += '<div class="search-category"><h4>Individual Pieces</h4>';
    html += items.map(item => `
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
        <button class="suggestion-tag" data-query="Royal">Royal Style</button>
        <button class="suggestion-tag" data-query="Modern">Modern</button>
        <button class="suggestion-tag" data-query="Traditional">Traditional</button>
        <button class="suggestion-tag" data-query="Living Room">Living Room</button>
        <button class="suggestion-tag" data-query="Bedroom">Bedroom</button>
        <button class="suggestion-tag" data-query="Dining">Dining</button>
        <button class="suggestion-tag" data-query="Sofa">Sofas</button>
        <button class="suggestion-tag" data-query="Bed">Beds</button>
      </div>
    </div>
  `;

  // Add click handlers to suggestion tags
  resultsContainer.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const searchInput = document.querySelector('.search-overlay input');
      if (searchInput) {
        searchInput.value = tag.dataset.query;
        performSearch(tag.dataset.query);
      }
    });
  });
}

// Clear search results
function clearSearchResults() {
  const searchInput = document.querySelector('.search-overlay input');
  const resultsContainer = document.querySelector('.search-results');

  if (searchInput) searchInput.value = '';
  if (resultsContainer) resultsContainer.innerHTML = '';
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
  // Search icon click
  const searchIcon = document.querySelector('.search-icon');
  if (searchIcon) {
    searchIcon.addEventListener('click', () => toggleSearchOverlay(true));
  }

  // Close search button
  const closeSearch = document.querySelector('.search-close');
  if (closeSearch) {
    closeSearch.addEventListener('click', () => toggleSearchOverlay(false));
  }

  // Search input with debounce
  const searchInput = document.querySelector('.search-overlay input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, SEARCH_DEBOUNCE);
    });

    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleSearchOverlay(false);
      }
    });
  }

  // Close on overlay background click
  const overlay = document.querySelector('.search-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        toggleSearchOverlay(false);
      }
    });
  }

  // Keyboard shortcut to open search (Ctrl/Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearchOverlay(true);
    }
  });
});
