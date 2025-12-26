// ========== Client-Side Pagination ==========

/**
 * Initialize pagination for a grid of items
 * @param {Object} options - Configuration options
 * @param {string} options.gridSelector - CSS selector for the grid container
 * @param {string} options.itemSelector - CSS selector for grid items
 * @param {string} options.paginationSelector - CSS selector for pagination container
 * @param {number} options.desktopPerPage - Items per page on desktop (default: 15)
 * @param {number} options.mobilePerPage - Items per page on mobile (default: 6)
 * @param {number} options.mobileBreakpoint - Breakpoint width for mobile (default: 768)
 */
function initPagination(options) {
  const {
    gridSelector,
    itemSelector,
    paginationSelector,
    desktopPerPage = 15,
    mobilePerPage = 6,
    mobileBreakpoint = 768
  } = options;

  const grid = document.querySelector(gridSelector);
  const paginationContainer = document.querySelector(paginationSelector);

  if (!grid || !paginationContainer) return null;

  let allItems = [];
  let visibleItems = [];
  let currentPage = 1;
  let itemsPerPage = getItemsPerPage();

  // Get items per page based on viewport
  function getItemsPerPage() {
    return window.innerWidth <= mobileBreakpoint ? mobilePerPage : desktopPerPage;
  }

  // Collect all pageable items
  function collectItems() {
    allItems = Array.from(grid.querySelectorAll(itemSelector));
  }

  // Get currently visible items (respects filters via data-filtered-out attribute)
  function getVisibleItems() {
    visibleItems = allItems.filter(item => {
      // Only check the data attribute - this is set by filter functions
      return !item.hasAttribute('data-filtered-out');
    });
  }

  // Calculate total pages
  function getTotalPages() {
    return Math.ceil(visibleItems.length / itemsPerPage);
  }

  // Show items for current page with smooth transition
  function showPage(page, smooth = true) {
    const previousPage = currentPage;
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Smooth fade transition
    if (smooth && previousPage !== page) {
      grid.style.opacity = '0';
      grid.style.transition = 'opacity 0.2s ease';

      setTimeout(() => {
        updateVisibleItems(startIndex, endIndex);
        grid.style.opacity = '1';
      }, 200);
    } else {
      updateVisibleItems(startIndex, endIndex);
    }

    renderPagination();

    // Scroll to top of grid (smooth) since pagination is at bottom
    if (page > 1 && previousPage !== page) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Update which items are visible
  function updateVisibleItems(startIndex, endIndex) {
    // First, hide all items
    allItems.forEach(item => {
      item.style.display = 'none';
    });

    // Then show only visible items for current page
    visibleItems.forEach((item, index) => {
      if (index >= startIndex && index < endIndex) {
        item.style.display = '';
      }
    });

    // Update parent grid visibility based on visible children
    updateGridVisibility();
  }

  // Hide grids that have no visible items on current page
  function updateGridVisibility() {
    // Only run this logic for catalogue page with multiple grids
    const setsGrid = document.querySelector('.catalogue-sets-grid');
    const itemsGridOnCatalogue = document.querySelector('.catalogue-products .catalogue-items-grid');

    // Skip for non-catalogue pages (room-type, room, etc.)
    if (!setsGrid && !itemsGridOnCatalogue) {
      return;
    }

    if (setsGrid) {
      const visibleSets = setsGrid.querySelectorAll('.catalogue-item:not([style*="display: none"])');
      setsGrid.style.display = visibleSets.length > 0 ? 'grid' : 'none';
    }

    if (itemsGridOnCatalogue) {
      const visibleItems = itemsGridOnCatalogue.querySelectorAll('.catalogue-item:not([style*="display: none"])');
      itemsGridOnCatalogue.style.display = visibleItems.length > 0 ? 'grid' : 'none';
    }
  }

  // Render pagination controls
  function renderPagination() {
    const totalPages = getTotalPages();

    // Hide pagination if only one page or no items
    if (totalPages <= 1) {
      paginationContainer.classList.add('hidden');
      return;
    }

    paginationContainer.classList.remove('hidden');

    let html = '';

    // Previous button
    html += `<button class="pagination-btn pagination-arrow"
                     onclick="window.paginationInstances['${gridSelector}'].goToPage(${currentPage - 1})"
                     ${currentPage === 1 ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>`;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      html += `<button class="pagination-btn" onclick="window.paginationInstances['${gridSelector}'].goToPage(1)">1</button>`;
      if (startPage > 2) {
        html += `<span class="pagination-ellipsis">…</span>`;
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}"
                       onclick="window.paginationInstances['${gridSelector}'].goToPage(${i})">${i}</button>`;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="pagination-ellipsis">…</span>`;
      }
      html += `<button class="pagination-btn" onclick="window.paginationInstances['${gridSelector}'].goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    html += `<button class="pagination-btn pagination-arrow"
                     onclick="window.paginationInstances['${gridSelector}'].goToPage(${currentPage + 1})"
                     ${currentPage === totalPages ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>`;

    // Results info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, visibleItems.length);
    html += `<div class="pagination-info">Showing ${startItem}–${endItem} of ${visibleItems.length} items</div>`;

    paginationContainer.innerHTML = html;
  }

  // Go to a specific page
  function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    showPage(page);
  }

  // Refresh pagination (call after filters change)
  function refresh() {
    collectItems();
    getVisibleItems();
    itemsPerPage = getItemsPerPage();
    currentPage = 1;
    showPage(1);
  }

  // Handle window resize
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newItemsPerPage = getItemsPerPage();
      if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1;
        showPage(1);
      }
    }, 150);
  }

  // Initialize
  collectItems();
  getVisibleItems();
  showPage(1);

  window.addEventListener('resize', handleResize);

  // Store instance globally for access from buttons
  if (!window.paginationInstances) {
    window.paginationInstances = {};
  }

  const instance = {
    goToPage,
    refresh,
    getCurrentPage: () => currentPage,
    getTotalPages
  };

  window.paginationInstances[gridSelector] = instance;

  return instance;
}

// Export for use in page scripts
window.initPagination = initPagination;
