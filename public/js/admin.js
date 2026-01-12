/* ==========================================
   Admin Dashboard Client-Side Logic
   ========================================== */

// State
let currentTab = 'sets';
let currentRoom = 'Living Room';
let currentStyle = 'Royal';
let currentType = '';
let deleteTarget = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const toast = document.getElementById('toast');

// ==========================================
// Button Loading State Helper
// ==========================================

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="btn-spinner"></span> Loading...';
    button.classList.add('loading');
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.classList.remove('loading');
  }
}

// ==========================================
// Tab Navigation
// ==========================================

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    // Update active states
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tab}-tab`) {
        content.classList.add('active');
      }
    });

    currentTab = tab;
    loadData();
  });
});

// ==========================================
// Room & Style Tabs
// ==========================================

function setupTabListeners(container, type) {
  const tabs = container.querySelectorAll(type === 'room' ? '.room-tab' : '.style-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (type === 'room') {
        currentRoom = tab.dataset.room;
      } else {
        currentStyle = tab.dataset.style;
      }

      // Reset type filter when changing room/style
      if (currentTab === 'items') {
        currentType = '';
        document.getElementById('type-filter-select').value = '';
        loadFurnitureTypes();
      }

      loadData();
    });
  });
}

// Setup Sets tab listeners
setupTabListeners(document.getElementById('sets-tab'), 'room');
setupTabListeners(document.getElementById('sets-tab'), 'style');

// Setup Items tab listeners
setupTabListeners(document.getElementById('items-tab'), 'room');
setupTabListeners(document.getElementById('items-tab'), 'style');

// Setup Rooms tab listeners
document.querySelectorAll('#rooms-room-tabs .room-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#rooms-room-tabs .room-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentRoom = tab.dataset.room;
    loadRoomDetails();
  });
});

// Type filter
document.getElementById('type-filter-select').addEventListener('change', (e) => {
  currentType = e.target.value;
  loadItems();
});

// ==========================================
// Data Loading
// ==========================================

function loadData() {
  switch (currentTab) {
    case 'sets':
      loadSets();
      break;
    case 'items':
      loadFurnitureTypes();
      loadItems();
      break;
    case 'rooms':
      loadRoomDetails();
      break;
    case 'home-settings':
    case 'contact-settings':
    case 'about-settings':
    case 'services-settings':
      if (typeof loadSettings === 'function' && !siteSettings) loadSettings();
      break;
  }
}

async function loadSets() {
  const grid = document.getElementById('sets-grid');
  grid.innerHTML = '<div class="loading-text">Loading sets...</div>';

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/sets?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`);
    const sets = await response.json();

    if (sets.length === 0) {
      grid.innerHTML = '<div class="empty-text">No sets found. Click "Add Set" to create one.</div>';
      return;
    }

    grid.innerHTML = sets.map(set => createSetCard(set)).join('');
    attachCardListeners(grid, 'FurnitureSet');
  } catch (error) {
    grid.innerHTML = '<div class="empty-text">Error loading sets.</div>';
    console.error(error);
  }
}

async function loadItems() {
  const grid = document.getElementById('items-grid');
  grid.innerHTML = '<div class="loading-text">Loading items...</div>';

  try {
    let url = `/${ADMIN_ROUTE}/api/items?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`;
    if (currentType) {
      url += `&type=${encodeURIComponent(currentType)}`;
    }

    const response = await fetch(url);
    const items = await response.json();

    if (items.length === 0) {
      grid.innerHTML = '<div class="empty-text">No items found. Click "Add Item" to create one.</div>';
      return;
    }

    grid.innerHTML = items.map(item => createItemCard(item)).join('');
    attachCardListeners(grid, 'FurnitureItem');
  } catch (error) {
    grid.innerHTML = '<div class="empty-text">Error loading items.</div>';
    console.error(error);
  }
}

async function loadFurnitureTypes() {
  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/furniture-types?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`);
    const types = await response.json();

    const select = document.getElementById('type-filter-select');
    select.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
      select.innerHTML += `<option value="${type}">${type}</option>`;
    });
  } catch (error) {
    console.error('Error loading furniture types:', error);
  }
}

async function loadRoomDetails() {
  const container = document.getElementById('room-details');
  container.innerHTML = '<div class="loading-text">Loading room details...</div>';

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/rooms`);
    const rooms = await response.json();
    const room = rooms.find(r => r.name === currentRoom);

    if (!room) {
      container.innerHTML = '<div class="empty-text">Room not found.</div>';
      return;
    }

    container.innerHTML = createRoomCard(room);
    attachRoomListeners(container, room);
  } catch (error) {
    container.innerHTML = '<div class="empty-text">Error loading room details.</div>';
    console.error(error);
  }
}

// ==========================================
// Card Templates
// ==========================================

function createSetCard(set) {
  const imageUrl = set.images && set.images[0] ? set.images[0].url : '';
  const description = set.description || '';
  const shortDesc = description.length > 60 ? description.substring(0, 60) + '...' : description;
  return `
    <div class="card" data-id="${set._id}" data-description="${description.replace(/"/g, '&quot;')}">
      <div class="card-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${set.name}">`
          : '<div class="no-image">No image</div>'
        }
        <button class="image-edit-btn" title="Update image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-name">
          <h3>${set.name}</h3>
          <button class="name-edit-btn" title="Edit name">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div class="inline-edit inline-edit-name">
          <input type="text" value="${set.name}" />
          <button class="inline-save-btn" data-field="name">Save</button>
          <button class="inline-cancel-btn">Cancel</button>
        </div>
        <div class="card-desc ${!description ? 'empty' : ''}">
          <p>${shortDesc || 'No description'}</p>
          <button class="desc-edit-btn" title="Edit description">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div class="inline-edit inline-edit-desc">
          <textarea rows="2">${description}</textarea>
          <button class="inline-save-btn" data-field="description">Save</button>
          <button class="inline-cancel-btn">Cancel</button>
        </div>
        <div class="card-meta">
          <span class="code">${set.code}</span>
          <span>${set.style}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-menu">
          <button class="menu-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
          <div class="menu-dropdown">
            <button class="menu-item delete">Delete Set</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createItemCard(item) {
  const imageUrl = item.images && item.images[0] ? item.images[0].url : '';
  const description = item.description || '';
  const shortDesc = description.length > 60 ? description.substring(0, 60) + '...' : description;
  return `
    <div class="card" data-id="${item._id}" data-description="${description.replace(/"/g, '&quot;')}">
      <div class="card-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${item.name}">`
          : '<div class="no-image">No image</div>'
        }
        <button class="image-edit-btn" title="Update image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      <div class="card-body">
        <div class="card-name">
          <h3>${item.name}</h3>
          <button class="name-edit-btn" title="Edit name">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div class="inline-edit inline-edit-name">
          <input type="text" value="${item.name}" />
          <button class="inline-save-btn" data-field="name">Save</button>
          <button class="inline-cancel-btn">Cancel</button>
        </div>
        <div class="card-desc ${!description ? 'empty' : ''}">
          <p>${shortDesc || 'No description'}</p>
          <button class="desc-edit-btn" title="Edit description">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div class="inline-edit inline-edit-desc">
          <textarea rows="2">${description}</textarea>
          <button class="inline-save-btn" data-field="description">Save</button>
          <button class="inline-cancel-btn">Cancel</button>
        </div>
        <div class="card-meta">
          <span class="code">${item.code}</span>
          <span>${item.type} · ${item.style}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-menu">
          <button class="menu-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
          <div class="menu-dropdown">
            <button class="menu-item delete">Delete Item</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createRoomCard(room) {
  const imageUrl = room.images && room.images[0] ? room.images[0].url : '';
  return `
    <div class="room-card" data-id="${room._id}">
      <div class="room-image">
        ${imageUrl
          ? `<img src="${imageUrl}" alt="${room.name}">`
          : '<div class="no-image">No image</div>'
        }
        <button class="image-edit-btn" title="Update image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      <div class="room-body">
        <h3>${room.name}</h3>
        <div class="room-field">
          <label>Description</label>
          <textarea id="room-description">${room.description || ''}</textarea>
        </div>
        <div class="room-actions">
          <button class="save-room-btn">Save Changes</button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// Card Event Listeners
// ==========================================

function attachCardListeners(grid, collection) {
  // Image edit
  grid.querySelectorAll('.image-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const id = card.dataset.id;
      openImageModal(collection, id, 0);
    });
  });

  // Name edit
  grid.querySelectorAll('.name-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      card.querySelector('.card-name').style.display = 'none';
      card.querySelector('.inline-edit-name').classList.add('active');
      card.querySelector('.inline-edit-name input').focus();
    });
  });

  // Description edit
  grid.querySelectorAll('.desc-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      card.querySelector('.card-desc').style.display = 'none';
      card.querySelector('.inline-edit-desc').classList.add('active');
      card.querySelector('.inline-edit-desc textarea').focus();
    });
  });

  // Inline save (handles both name and description)
  grid.querySelectorAll('.inline-save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.card');
      const id = card.dataset.id;
      const field = btn.dataset.field;

      if (field === 'name') {
        const newName = card.querySelector('.inline-edit-name input').value.trim();
        if (!newName) {
          showToast('Name cannot be empty', 'error');
          return;
        }
        await updateField(collection, id, { name: newName });
      } else if (field === 'description') {
        const newDesc = card.querySelector('.inline-edit-desc textarea').value.trim();
        await updateField(collection, id, { description: newDesc });
      }
    });
  });

  // Inline cancel
  grid.querySelectorAll('.inline-cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const editBox = e.target.closest('.inline-edit');

      if (editBox.classList.contains('inline-edit-name')) {
        card.querySelector('.card-name').style.display = 'flex';
      } else if (editBox.classList.contains('inline-edit-desc')) {
        card.querySelector('.card-desc').style.display = 'flex';
      }
      editBox.classList.remove('active');
    });
  });

  // Menu toggle
  grid.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardMenu = btn.closest('.card-menu');
      const wasActive = cardMenu.classList.contains('active');
      document.querySelectorAll('.card-menu').forEach(m => m.classList.remove('active'));
      if (!wasActive) cardMenu.classList.add('active');
    });
  });

  // Delete click
  grid.querySelectorAll('.menu-item.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const id = card.dataset.id;
      openDeleteModal(collection, id);
    });
  });
}

function attachRoomListeners(container, room) {
  // Image edit
  container.querySelector('.image-edit-btn').addEventListener('click', () => {
    openImageModal('Room', room._id, room.images && room.images.length > 0 ? 0 : -1);
  });

  // Save room (only description - hasIndividualItems is auto-calculated)
  container.querySelector('.save-room-btn').addEventListener('click', async () => {
    const description = document.getElementById('room-description').value;

    try {
      const response = await fetch(`/${ADMIN_ROUTE}/api/rooms/${room._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (response.ok) {
        showToast('Room updated successfully', 'success');
      } else {
        showToast('Error updating room', 'error');
      }
    } catch (error) {
      showToast('Error updating room', 'error');
      console.error(error);
    }
  });
}

// ==========================================
// API Actions
// ==========================================

async function updateField(collection, id, data) {
  const endpoint = collection === 'FurnitureSet' ? 'sets' : 'items';

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Updated successfully', 'success');
      loadData();
    } else {
      const error = await response.json();
      showToast(error.error || 'Error updating', 'error');
    }
  } catch (error) {
    showToast('Error updating', 'error');
    console.error(error);
  }
}

async function deleteItem(collection, id, button) {
  if (button) setButtonLoading(button, true);
  const endpoint = collection === 'FurnitureSet' ? 'sets' : 'items';

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/${endpoint}/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Deleted successfully', 'success');
      closeModal('delete-modal');
      loadData();
    } else {
      const error = await response.json();
      showToast(error.error || 'Error deleting', 'error');
    }
  } catch (error) {
    showToast('Error deleting', 'error');
    console.error(error);
  } finally {
    if (button) setButtonLoading(button, false);
  }
}

// ==========================================
// Modals
// ==========================================

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modals on outside click or cancel button
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal').classList.remove('active');
  });
});

// Room/Style initials for code prefix
const ROOM_INITIALS = {
  'Living Room': 'L',
  'Dining Room': 'D',
  'Bedroom': 'B',
  'Office': 'O',
  'Showpieces': 'S'
};

const STYLE_INITIALS = {
  'Royal': 'R',
  'Traditional': 'T',
  'Modern': 'M'
};

function getCodePrefix(room, style) {
  return (ROOM_INITIALS[room] || 'X') + (STYLE_INITIALS[style] || 'X') + '-';
}

// Add Set Modal
document.getElementById('add-set-btn').addEventListener('click', async () => {
  document.getElementById('set-modal-title').textContent = 'Add New Set';
  document.getElementById('set-id').value = '';
  document.getElementById('set-room').value = currentRoom;
  document.getElementById('set-style').value = currentStyle;
  document.getElementById('set-name').value = '';
  document.getElementById('set-description').value = '';
  document.getElementById('set-image').value = '';
  document.getElementById('set-image-preview').innerHTML = '';
  document.getElementById('set-code').value = '';
  document.getElementById('set-code-prefix').textContent = getCodePrefix(currentRoom, currentStyle);
  document.getElementById('set-room-display').textContent = currentRoom;
  document.getElementById('set-style-display').textContent = currentStyle;

  // Fetch next available code to show as suggestion
  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/sets/next-code?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById('set-code').placeholder = data.number;
    }
  } catch (e) {
    console.log('Could not fetch next code suggestion');
  }

  openModal('set-modal');
});

// Validate image file for size, format, and aspect ratio
function validateImage(file, expectedRatio, ratioLabel) {
  return new Promise((resolve, reject) => {
    // Check file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      reject(`File size must be less than 1MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }

    // Check file format (webp only)
    if (!file.name.toLowerCase().endsWith('.webp')) {
      reject('Only .webp format is allowed');
      return;
    }

    // Check aspect ratio
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const actualRatio = img.width / img.height;
      const tolerance = 0.05; // 5% tolerance

      if (Math.abs(actualRatio - expectedRatio) > tolerance) {
        reject(`Image must be ${ratioLabel} aspect ratio (current: ${img.width}x${img.height})`);
        return;
      }

      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject('Failed to load image');
    };

    img.src = url;
  });
}

// Set image preview with validation (4:3 aspect ratio)
document.getElementById('set-image').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const previewEl = document.getElementById('set-image-preview');

  if (file) {
    try {
      await validateImage(file, 4/3, '4:3');
      const reader = new FileReader();
      reader.onload = (e) => {
        previewEl.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast(error, 'error');
      e.target.value = '';
      previewEl.innerHTML = '';
    }
  } else {
    previewEl.innerHTML = '';
  }
});

// Add Item Modal
document.getElementById('add-item-btn').addEventListener('click', async () => {
  document.getElementById('item-modal-title').textContent = 'Add New Item';
  document.getElementById('item-id').value = '';
  document.getElementById('item-room').value = currentRoom;
  document.getElementById('item-style').value = currentStyle;
  document.getElementById('item-name').value = '';
  document.getElementById('item-type').value = '';
  document.getElementById('item-type-select').value = '';
  document.getElementById('item-type-new').value = '';
  document.getElementById('new-type-group').style.display = 'none';
  document.getElementById('item-price').value = '';
  document.getElementById('item-description').value = '';
  document.getElementById('item-image').value = '';
  document.getElementById('item-image-preview').innerHTML = '';
  document.getElementById('item-code').value = '';
  document.getElementById('item-code-prefix').textContent = getCodePrefix(currentRoom, currentStyle);
  document.getElementById('item-room-display').textContent = currentRoom;
  document.getElementById('item-style-display').textContent = currentStyle;

  // Populate furniture type dropdown
  const typeSelect = document.getElementById('item-type-select');
  typeSelect.innerHTML = '<option value="">Select type or add new...</option>';
  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/furniture-types?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`);
    if (response.ok) {
      const types = await response.json();
      types.forEach(type => {
        typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
      });
      typeSelect.innerHTML += '<option value="__new__">+ Add new type...</option>';
    }
  } catch (e) {
    console.log('Could not fetch furniture types');
  }

  // Fetch next available code to show as suggestion
  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/items/next-code?room=${encodeURIComponent(currentRoom)}&style=${encodeURIComponent(currentStyle)}`);
    if (response.ok) {
      const data = await response.json();
      document.getElementById('item-code').placeholder = data.number;
    }
  } catch (e) {
    console.log('Could not fetch next code suggestion');
  }

  openModal('item-modal');
});

// Handle furniture type dropdown change
document.getElementById('item-type-select').addEventListener('change', (e) => {
  const value = e.target.value;
  const newTypeGroup = document.getElementById('new-type-group');
  const typeHidden = document.getElementById('item-type');

  if (value === '__new__') {
    newTypeGroup.style.display = 'block';
    document.getElementById('item-type-new').focus();
    typeHidden.value = '';
  } else {
    newTypeGroup.style.display = 'none';
    typeHidden.value = value;
  }
});

// Handle new type input
document.getElementById('item-type-new').addEventListener('input', (e) => {
  document.getElementById('item-type').value = e.target.value;
});

// Item image preview with validation (1:1 aspect ratio)
document.getElementById('item-image').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const previewEl = document.getElementById('item-image-preview');

  if (file) {
    try {
      await validateImage(file, 1, '1:1');
      const reader = new FileReader();
      reader.onload = (e) => {
        previewEl.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast(error, 'error');
      e.target.value = '';
      previewEl.innerHTML = '';
    }
  } else {
    previewEl.innerHTML = '';
  }
});

// Set Form Submit
document.getElementById('set-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const room = document.getElementById('set-room').value;
  const style = document.getElementById('set-style').value;
  const codeNumber = document.getElementById('set-code').value.trim();

  // Validate code if provided
  if (codeNumber && !/^\d{2}$/.test(codeNumber)) {
    showToast('Code must be exactly 2 digits (e.g., 01, 15)', 'error');
    return;
  }

  // Build full code if number provided
  const customCode = codeNumber ? getCodePrefix(room, style) + codeNumber : '';

  const formData = new FormData();
  formData.append('room', room);
  formData.append('style', style);
  formData.append('name', document.getElementById('set-name').value);
  formData.append('description', document.getElementById('set-description').value);
  if (customCode) {
    formData.append('customCode', customCode);
  }

  const imageFile = document.getElementById('set-image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/sets`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      showToast('Set created successfully', 'success');
      closeModal('set-modal');
      loadSets();
    } else {
      const error = await response.json();
      showToast(error.error || 'Error creating set', 'error');
    }
  } catch (error) {
    showToast('Error creating set', 'error');
    console.error(error);
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// Item Form Submit
document.getElementById('item-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const room = document.getElementById('item-room').value;
  const style = document.getElementById('item-style').value;
  const codeNumber = document.getElementById('item-code').value.trim();

  // Validate code if provided
  if (codeNumber && !/^\d{3}$/.test(codeNumber)) {
    showToast('Code must be exactly 3 digits (e.g., 001, 015)', 'error');
    return;
  }

  // Build full code if number provided
  const customCode = codeNumber ? getCodePrefix(room, style) + codeNumber : '';

  const formData = new FormData();
  formData.append('room', room);
  formData.append('style', style);
  formData.append('name', document.getElementById('item-name').value);
  formData.append('type', document.getElementById('item-type').value);
  formData.append('price', document.getElementById('item-price').value || '');
  formData.append('description', document.getElementById('item-description').value);
  if (customCode) {
    formData.append('customCode', customCode);
  }

  const imageFile = document.getElementById('item-image').files[0];
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/items`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      showToast('Item created successfully', 'success');
      closeModal('item-modal');
      loadItems();
    } else {
      const error = await response.json();
      showToast(error.error || 'Error creating item', 'error');
    }
  } catch (error) {
    showToast('Error creating item', 'error');
    console.error(error);
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// Image Modal
function openImageModal(collection, documentId, imageIndex) {
  document.getElementById('image-collection').value = collection;
  document.getElementById('image-doc-id').value = documentId;
  document.getElementById('image-index').value = imageIndex >= 0 ? imageIndex : -1;
  document.getElementById('image-file').value = '';
  document.getElementById('image-preview').innerHTML = '';

  // Reset button loading state when opening modal
  const submitBtn = document.querySelector('#image-form button[type="submit"]');
  if (submitBtn) {
    setButtonLoading(submitBtn, false);
  }

  openModal('image-modal');
}

// Image preview
document.getElementById('image-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('image-preview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
});

// Image Form Submit
document.getElementById('image-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const collection = document.getElementById('image-collection').value;
  setButtonLoading(submitBtn, true);

  try {
    let response;

    // Hero image uploads use a different endpoint
    if (collection === 'HeroImage') {
      const slotIndex = document.getElementById('image-doc-id').value;
      const heroFormData = new FormData();
      heroFormData.append('image', formData.get('image'));
      heroFormData.append('slotIndex', slotIndex);

      response = await fetch(`/${ADMIN_ROUTE}/api/settings/home/hero-image`, {
        method: 'POST',
        body: heroFormData
      });
    } else {
      response = await fetch(`/${ADMIN_ROUTE}/api/upload-image`, {
        method: 'POST',
        body: formData
      });
    }

    if (response.ok) {
      showToast('Image uploaded successfully', 'success');
      closeModal('image-modal');
      // For hero images, reload settings; for others, reload data
      if (collection === 'HeroImage') {
        await loadSettings();
      } else {
        loadData();
      }
    } else {
      const error = await response.json();
      showToast(error.error || 'Error uploading image', 'error');
    }
  } catch (error) {
    showToast('Error uploading image', 'error');
    console.error(error);
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// Delete Modal
function openDeleteModal(collection, id) {
  deleteTarget = { collection, id };
  openModal('delete-modal');
}

document.getElementById('confirm-delete-btn').addEventListener('click', function() {
  if (deleteTarget) {
    deleteItem(deleteTarget.collection, deleteTarget.id, this);
  }
});

// ==========================================
// Toast Notifications
// ==========================================

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast active ${type}`;

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// ==========================================
// Close menus on outside click
// ==========================================

document.addEventListener('click', () => {
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
});

// ==========================================
// SITE SETTINGS HANDLERS
// ==========================================

let siteSettings = null;

async function loadSettings() {
  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/settings`);
    siteSettings = await response.json();
    populateHomeSettings();
    populateContactSettings();
    populateAboutSettings();
    populateServicesSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function populateHomeSettings() {
  if (!siteSettings) return;

  const home = siteSettings.home;
  document.getElementById('hero-tagline').value = home.hero.tagline || '';
  document.getElementById('hero-badges').value = (home.hero.badges || []).join(', ');

  // Populate hero images
  const heroImages = home.hero.images || [];
  const activeIndex = home.hero.activeImageIndex || 0;

  for (let i = 0; i < 3; i++) {
    const preview = document.getElementById(`hero-preview-${i}`);
    const slot = document.querySelector(`.hero-image-slot[data-slot="${i}"]`);
    const deleteBtn = slot?.querySelector('.btn-delete-hero');
    const radio = document.querySelector(`input[name="activeHeroImage"][value="${i}"]`);

    if (heroImages[i] && heroImages[i].url) {
      preview.innerHTML = `<img src="${heroImages[i].url}" alt="Hero ${i + 1}">`;
      if (deleteBtn) deleteBtn.disabled = false;
    } else {
      preview.innerHTML = '<span class="no-image-text">No image</span>';
      if (deleteBtn) deleteBtn.disabled = true;
    }

    // Set active class and radio
    if (slot) {
      slot.classList.toggle('active', i === activeIndex);
    }
    if (radio) {
      radio.checked = (i === activeIndex);
    }
  }

  // Populate stats
  const statsContainer = document.getElementById('hero-stats-container');
  statsContainer.innerHTML = '';
  (home.hero.stats || []).forEach((stat, index) => {
    addStatRow(stat.number, stat.label, index);
  });

  // Populate featured codes
  document.getElementById('signature-codes').value = (home.featuredCodes.signatureItems || []).join(', ');
  document.getElementById('featured-items-codes').value = (home.featuredCodes.featuredItems || []).join(', ');
  document.getElementById('featured-sets-codes').value = (home.featuredCodes.featuredSets || []).join(', ');
}

// Hero image upload handlers
document.querySelectorAll('.btn-upload-hero').forEach(btn => {
  btn.addEventListener('click', () => {
    const slotIndex = btn.dataset.slot;
    openHeroImageUpload(slotIndex);
  });
});

// Hero image delete handlers
document.querySelectorAll('.btn-delete-hero').forEach(btn => {
  btn.addEventListener('click', async () => {
    const slotIndex = btn.dataset.slot;
    if (!confirm('Delete this hero image?')) return;

    btn.disabled = true;
    try {
      const response = await fetch(`/${ADMIN_ROUTE}/api/settings/home/hero-image/${slotIndex}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Hero image deleted!', 'success');
        await loadSettings();
      } else {
        const err = await response.json();
        showToast(err.error || 'Delete failed', 'error');
      }
    } catch (error) {
      showToast('Delete failed', 'error');
      console.error(error);
    }
  });
});

// Active hero image selection
document.querySelectorAll('input[name="activeHeroImage"]').forEach(radio => {
  radio.addEventListener('change', async (e) => {
    const activeIndex = parseInt(e.target.value);

    // Check if this slot has an image
    const heroImages = siteSettings?.home?.hero?.images || [];
    if (!heroImages[activeIndex]?.url) {
      showToast('Cannot select empty slot as active', 'error');
      // Revert to previous
      populateHomeSettings();
      return;
    }

    try {
      const response = await fetch(`/${ADMIN_ROUTE}/api/settings/home/hero-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeIndex })
      });

      if (response.ok) {
        showToast('Active hero image updated!', 'success');
        await loadSettings();
      } else {
        const err = await response.json();
        showToast(err.error || 'Update failed', 'error');
        populateHomeSettings();
      }
    } catch (error) {
      showToast('Update failed', 'error');
      console.error(error);
      populateHomeSettings();
    }
  });
});

function openHeroImageUpload(slotIndex) {
  // Use the existing image modal
  const form = document.getElementById('image-form');
  form.dataset.heroSlot = slotIndex;

  document.getElementById('image-collection').value = 'HeroImage';
  document.getElementById('image-doc-id').value = slotIndex;
  document.getElementById('image-index').value = '-1';
  document.getElementById('image-file').value = '';
  document.getElementById('image-preview').innerHTML = '';

  // Reset button loading state when opening modal
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    setButtonLoading(submitBtn, false);
  }

  openModal('image-modal');
}

function populateContactSettings() {
  if (!siteSettings) return;

  const contact = siteSettings.contact;
  document.getElementById('contact-phone1').value = contact.phone1 || '';
  document.getElementById('contact-phone2').value = contact.phone2 || '';
  document.getElementById('contact-whatsapp-enquiry').value = contact.whatsappEnquiry || '';
  document.getElementById('contact-email').value = contact.email || '';
  document.getElementById('contact-form-email').value = contact.formEmail || '';
  document.getElementById('address-line1').value = contact.address?.line1 || '';
  document.getElementById('address-line2').value = contact.address?.line2 || '';
  document.getElementById('address-line3').value = contact.address?.line3 || '';
  document.getElementById('address-country').value = contact.address?.country || '';
  document.getElementById('hours-weekday').value = contact.businessHours?.weekday || '';
  document.getElementById('hours-weekend').value = contact.businessHours?.weekend || '';
}

function addStatRow(number = '', label = '', index = null) {
  const statsContainer = document.getElementById('hero-stats-container');
  const row = document.createElement('div');
  row.className = 'stat-row';
  row.innerHTML = `
    <input type="text" placeholder="45+" value="${number}" class="stat-number">
    <input type="text" placeholder="Years Crafting" value="${label}" class="stat-label">
    <button type="button" class="btn-remove-stat">&times;</button>
  `;
  row.querySelector('.btn-remove-stat').addEventListener('click', () => row.remove());
  statsContainer.appendChild(row);
}

// Add stat button
document.getElementById('add-stat-btn')?.addEventListener('click', () => {
  addStatRow();
});

// Home settings form submit
document.getElementById('home-settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(btn, true);

  // Collect stats
  const stats = [];
  document.querySelectorAll('#hero-stats-container .stat-row').forEach(row => {
    const number = row.querySelector('.stat-number').value.trim();
    const label = row.querySelector('.stat-label').value.trim();
    if (number && label) {
      stats.push({ number, label });
    }
  });

  // Parse comma-separated codes
  const parseCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  const data = {
    tagline: document.getElementById('hero-tagline').value.trim(),
    badges: parseCSV(document.getElementById('hero-badges').value),
    stats,
    signatureItems: parseCSV(document.getElementById('signature-codes').value),
    featuredItems: parseCSV(document.getElementById('featured-items-codes').value),
    featuredSets: parseCSV(document.getElementById('featured-sets-codes').value)
  };

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/settings/home`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Home settings saved!', 'success');
      loadSettings();
    } else {
      const err = await response.json();
      showToast(err.error || 'Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
    console.error(error);
  } finally {
    setButtonLoading(btn, false);
  }
});

// Contact settings form submit
document.getElementById('contact-settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(btn, true);

  const data = {
    phone1: document.getElementById('contact-phone1').value.trim(),
    phone2: document.getElementById('contact-phone2').value.trim(),
    whatsappEnquiry: document.getElementById('contact-whatsapp-enquiry').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    formEmail: document.getElementById('contact-form-email').value.trim(),
    addressLine1: document.getElementById('address-line1').value.trim(),
    addressLine2: document.getElementById('address-line2').value.trim(),
    addressLine3: document.getElementById('address-line3').value.trim(),
    addressCountry: document.getElementById('address-country').value.trim(),
    hoursWeekday: document.getElementById('hours-weekday').value.trim(),
    hoursWeekend: document.getElementById('hours-weekend').value.trim()
  };

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/settings/contact`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Contact settings saved!', 'success');
      loadSettings();
    } else {
      const err = await response.json();
      showToast(err.error || 'Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
    console.error(error);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ==========================================
// ABOUT SETTINGS HANDLERS
// ==========================================

function populateAboutSettings() {
  if (!siteSettings || !siteSettings.about) return;

  const about = siteSettings.about;

  // Story section
  document.getElementById('about-story-title').value = about.story?.title || '';
  document.getElementById('about-story-subtitle').value = about.story?.subtitle || '';
  document.getElementById('about-story-content').value = about.story?.content || '';

  // Story image preview
  const storyPreview = document.getElementById('story-image-preview');
  if (about.story?.image?.url) {
    storyPreview.innerHTML = `<img src="${about.story.image.url}" alt="Story">`;
  } else {
    storyPreview.innerHTML = '<span class="no-image-text">No image</span>';
  }

  // Values
  const valuesContainer = document.getElementById('values-container');
  valuesContainer.innerHTML = '';
  (about.values || []).forEach((value, index) => {
    addValueRow(value.icon, value.title, value.description, index);
  });

  // Process
  document.getElementById('about-process-intro').value = about.process?.intro || '';
  const processContainer = document.getElementById('process-steps-container');
  processContainer.innerHTML = '';
  (about.process?.steps || []).forEach((step, index) => {
    addProcessStepRow(step.title, step.description, step.image, index);
  });

  // Heritage
  document.getElementById('about-heritage-title').value = about.heritage?.title || '';
  document.getElementById('about-heritage-description').value = about.heritage?.description || '';
}

function addValueRow(icon = '', title = '', description = '', index = null) {
  const valuesContainer = document.getElementById('values-container');
  const row = document.createElement('div');
  row.className = 'dynamic-row value-row';
  row.innerHTML = `
    <div class="row-header">
      <span class="row-number">${valuesContainer.children.length + 1}</span>
      <button type="button" class="btn-remove-row">&times;</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Icon Key</label>
        <input type="text" class="value-icon" value="${icon}" placeholder="craftsmanship">
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="value-title" value="${title}" placeholder="Craftsmanship">
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="value-description" rows="2" placeholder="Value description...">${description}</textarea>
    </div>
  `;
  row.querySelector('.btn-remove-row').addEventListener('click', () => {
    row.remove();
    renumberRows(valuesContainer, 'value-row');
  });
  valuesContainer.appendChild(row);
}

function addProcessStepRow(title = '', description = '', image = null, index = null) {
  const container = document.getElementById('process-steps-container');
  const stepIndex = container.children.length;
  const row = document.createElement('div');
  row.className = 'dynamic-row process-step-row';
  row.dataset.stepIndex = stepIndex;
  row.innerHTML = `
    <div class="row-header">
      <span class="row-number">${stepIndex + 1}</span>
      <button type="button" class="btn-remove-row">&times;</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Step Title</label>
        <input type="text" class="step-title" value="${title}" placeholder="Design Brief">
      </div>
      <div class="form-group image-upload-inline">
        <label>Step Image</label>
        <div class="image-upload-row">
          <div class="image-preview-small step-image-preview">${image?.url ? `<img src="${image.url}" alt="Step">` : '<span class="no-image-text">No image</span>'}</div>
          <button type="button" class="btn-upload btn-upload-step" data-step-index="${stepIndex}">Upload</button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Step Description</label>
      <textarea class="step-description" rows="2" placeholder="Step description...">${description}</textarea>
    </div>
  `;
  row.querySelector('.btn-remove-row').addEventListener('click', () => {
    row.remove();
    renumberRows(container, 'process-step-row');
    updateStepIndices();
  });
  row.querySelector('.btn-upload-step').addEventListener('click', (e) => {
    const idx = e.target.dataset.stepIndex;
    openSettingsImageModal('about', 'process', idx);
  });
  container.appendChild(row);
}

function renumberRows(container, rowClass) {
  container.querySelectorAll(`.${rowClass}`).forEach((row, i) => {
    row.querySelector('.row-number').textContent = i + 1;
    if (row.dataset.stepIndex !== undefined) {
      row.dataset.stepIndex = i;
      const uploadBtn = row.querySelector('.btn-upload-step');
      if (uploadBtn) uploadBtn.dataset.stepIndex = i;
    }
    if (row.dataset.serviceIndex !== undefined) {
      row.dataset.serviceIndex = i;
      const uploadBtn = row.querySelector('.btn-upload-service');
      if (uploadBtn) uploadBtn.dataset.serviceIndex = i;
    }
  });
}

function updateStepIndices() {
  document.querySelectorAll('.process-step-row').forEach((row, i) => {
    row.dataset.stepIndex = i;
    const btn = row.querySelector('.btn-upload-step');
    if (btn) btn.dataset.stepIndex = i;
  });
}

// Add value button
document.getElementById('add-value-btn')?.addEventListener('click', () => {
  addValueRow();
});

// Add process step button
document.getElementById('add-process-step-btn')?.addEventListener('click', () => {
  addProcessStepRow();
});

// Story image upload button
document.querySelector('[data-section="story"]')?.addEventListener('click', () => {
  openSettingsImageModal('about', 'story');
});

// About settings form submit
document.getElementById('about-settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(btn, true);

  // Collect values
  const values = [];
  document.querySelectorAll('.value-row').forEach(row => {
    const icon = row.querySelector('.value-icon').value.trim();
    const title = row.querySelector('.value-title').value.trim();
    const description = row.querySelector('.value-description').value.trim();
    if (title && description) {
      values.push({ icon, title, description });
    }
  });

  // Collect process steps (text only - images handled separately)
  const steps = [];
  document.querySelectorAll('.process-step-row').forEach(row => {
    const title = row.querySelector('.step-title').value.trim();
    const description = row.querySelector('.step-description').value.trim();
    // Preserve existing image data
    const stepIndex = parseInt(row.dataset.stepIndex);
    const existingImage = siteSettings?.about?.process?.steps?.[stepIndex]?.image || { url: '', publicId: '' };
    if (title || description) {
      steps.push({ title, description, image: existingImage });
    }
  });

  const data = {
    story: {
      title: document.getElementById('about-story-title').value.trim(),
      subtitle: document.getElementById('about-story-subtitle').value.trim(),
      content: document.getElementById('about-story-content').value.trim()
    },
    values,
    process: {
      intro: document.getElementById('about-process-intro').value.trim(),
      steps
    },
    heritage: {
      title: document.getElementById('about-heritage-title').value.trim(),
      description: document.getElementById('about-heritage-description').value.trim()
    }
  };

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/settings/about`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('About settings saved!', 'success');
      loadSettings();
    } else {
      const err = await response.json();
      showToast(err.error || 'Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
    console.error(error);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ==========================================
// SERVICES SETTINGS HANDLERS
// ==========================================

function populateServicesSettings() {
  if (!siteSettings || !siteSettings.services) return;

  const services = siteSettings.services;

  // Intro
  document.getElementById('services-intro-title').value = services.intro?.title || '';
  document.getElementById('services-intro-description').value = services.intro?.description || '';

  // Services items
  const container = document.getElementById('services-items-container');
  container.innerHTML = '';
  (services.items || []).forEach((item, index) => {
    addServiceRow(item.title, item.description, item.features, item.image, index);
  });
}

function addServiceRow(title = '', description = '', features = [], image = null, index = null) {
  const container = document.getElementById('services-items-container');
  const serviceIndex = container.children.length;
  const row = document.createElement('div');
  row.className = 'dynamic-row service-row';
  row.dataset.serviceIndex = serviceIndex;
  row.innerHTML = `
    <div class="row-header">
      <span class="row-number">${serviceIndex + 1}</span>
      <button type="button" class="btn-remove-row">&times;</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Service Title</label>
        <input type="text" class="service-title" value="${title}" placeholder="Custom Furniture Design">
      </div>
      <div class="form-group image-upload-inline">
        <label>Service Image</label>
        <div class="image-upload-row">
          <div class="image-preview-small service-image-preview">${image?.url ? `<img src="${image.url}" alt="Service">` : '<span class="no-image-text">No image</span>'}</div>
          <button type="button" class="btn-upload btn-upload-service" data-service-index="${serviceIndex}">Upload</button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Service Description</label>
      <textarea class="service-description" rows="2" placeholder="Service description...">${description}</textarea>
    </div>
    <div class="form-group">
      <label>Features (one per line)</label>
      <textarea class="service-features" rows="3" placeholder="Feature 1\nFeature 2\nFeature 3...">${(features || []).join('\n')}</textarea>
    </div>
  `;
  row.querySelector('.btn-remove-row').addEventListener('click', () => {
    row.remove();
    renumberRows(container, 'service-row');
    updateServiceIndices();
  });
  row.querySelector('.btn-upload-service').addEventListener('click', (e) => {
    const idx = e.target.dataset.serviceIndex;
    openSettingsImageModal('services', null, idx);
  });
  container.appendChild(row);
}

function updateServiceIndices() {
  document.querySelectorAll('.service-row').forEach((row, i) => {
    row.dataset.serviceIndex = i;
    const btn = row.querySelector('.btn-upload-service');
    if (btn) btn.dataset.serviceIndex = i;
  });
}

// Add service button
document.getElementById('add-service-btn')?.addEventListener('click', () => {
  addServiceRow();
});

// Services settings form submit
document.getElementById('services-settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setButtonLoading(btn, true);

  // Collect services items
  const items = [];
  document.querySelectorAll('.service-row').forEach(row => {
    const title = row.querySelector('.service-title').value.trim();
    const description = row.querySelector('.service-description').value.trim();
    const featuresText = row.querySelector('.service-features').value.trim();
    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
    // Preserve existing image data
    const serviceIndex = parseInt(row.dataset.serviceIndex);
    const existingImage = siteSettings?.services?.items?.[serviceIndex]?.image || { url: '', publicId: '' };
    if (title || description) {
      items.push({ title, description, features, image: existingImage });
    }
  });

  const data = {
    intro: {
      title: document.getElementById('services-intro-title').value.trim(),
      description: document.getElementById('services-intro-description').value.trim()
    },
    items
  };

  try {
    const response = await fetch(`/${ADMIN_ROUTE}/api/settings/services`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showToast('Services settings saved!', 'success');
      loadSettings();
    } else {
      const err = await response.json();
      showToast(err.error || 'Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
    console.error(error);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ==========================================
// SETTINGS IMAGE UPLOAD HANDLER
// ==========================================

function openSettingsImageModal(page, section, itemIndex) {
  // Use the existing image modal but configure it for settings
  const modal = document.getElementById('image-modal');
  const form = document.getElementById('image-form');

  // Store settings upload info
  form.dataset.settingsPage = page;
  form.dataset.settingsSection = section || '';
  form.dataset.settingsIndex = itemIndex !== undefined ? itemIndex : '';

  // Clear the collection field to indicate this is a settings upload
  document.getElementById('image-collection').value = 'SiteSettings';
  document.getElementById('image-doc-id').value = page;
  document.getElementById('image-index').value = itemIndex !== undefined ? itemIndex : '-1';

  document.getElementById('image-file').value = '';
  document.getElementById('image-preview').innerHTML = '';

  openModal('image-modal');
}

// Override image form submit for settings uploads
const originalImageFormHandler = document.getElementById('image-form')?.onsubmit;

document.getElementById('image-form')?.addEventListener('submit', async function(e) {
  const collection = document.getElementById('image-collection').value;

  if (collection !== 'SiteSettings' && collection !== 'HeroImage') {
    // Use existing handler for regular uploads
    return;
  }

  e.preventDefault();

  const form = e.target;
  const file = document.getElementById('image-file').files[0];
  if (!file) {
    showToast('Please select an image', 'error');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  setButtonLoading(btn, true);

  // Handle HeroImage upload
  if (collection === 'HeroImage') {
    const slotIndex = form.dataset.heroSlot;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('slotIndex', slotIndex);

    try {
      const response = await fetch(`/${ADMIN_ROUTE}/api/settings/home/hero-image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showToast('Hero image uploaded!', 'success');
        closeModal('image-modal');
        await loadSettings();
      } else {
        const err = await response.json();
        showToast(err.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast('Upload failed', 'error');
      console.error(error);
    } finally {
      setButtonLoading(btn, false);
    }
    return;
  }

  // Handle SiteSettings (About/Services) uploads
  const page = form.dataset.settingsPage;
  const section = form.dataset.settingsSection;
  const itemIndex = form.dataset.settingsIndex;

  const formData = new FormData();
  formData.append('image', file);

  let endpoint = '';
  if (page === 'about') {
    formData.append('section', section);
    if (itemIndex !== '') {
      formData.append('stepIndex', itemIndex);
    }
    endpoint = `/${ADMIN_ROUTE}/api/settings/about/image`;
  } else if (page === 'services') {
    formData.append('itemIndex', itemIndex);
    endpoint = `/${ADMIN_ROUTE}/api/settings/services/image`;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      showToast('Image uploaded successfully!', 'success');
      closeModal('image-modal');

      // Refresh settings and update preview
      await loadSettings();

      // Update the specific preview
      if (page === 'about' && section === 'story') {
        document.getElementById('story-image-preview').innerHTML =
          `<img src="${result.image.url}" alt="Story">`;
      } else if (page === 'about' && section === 'process') {
        const stepRow = document.querySelector(`.process-step-row[data-step-index="${itemIndex}"]`);
        if (stepRow) {
          stepRow.querySelector('.step-image-preview').innerHTML =
            `<img src="${result.image.url}" alt="Step">`;
        }
      } else if (page === 'services') {
        const serviceRow = document.querySelector(`.service-row[data-service-index="${itemIndex}"]`);
        if (serviceRow) {
          serviceRow.querySelector('.service-image-preview').innerHTML =
            `<img src="${result.image.url}" alt="Service">`;
        }
      }
    } else {
      const err = await response.json();
      showToast(err.error || 'Upload failed', 'error');
    }
  } catch (error) {
    showToast('Upload failed', 'error');
    console.error(error);
  } finally {
    setButtonLoading(btn, false);
  }
});

// ==========================================
// Initial Load
// ==========================================

loadData();

