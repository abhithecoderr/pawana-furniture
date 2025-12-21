# Pawana Furniture - The Definitive Project Guide (Technical Deep-Dive)

This document is a comprehensive technical manual for the **Pawana Furniture** project. It provides a detailed, file-by-file breakdown of the architecture, data models, server logic, and frontend interactions.

---

## 🛠 1. Technical Stack Overview

The application is built using a modern **Node.js** architecture with a focus on performance and maintainability.

- **Environment**: [Node.js](https://nodejs.org/) (Project entry: `app.js`)
- **Server Framework**: [Express.js](https://expressjs.com/) (Version 5.1+)
- **Database Layer**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (ODM)
- **Templating**: [EJS (Embedded JavaScript)](https://ejs.co/) for dynamic server-side rendering
- **Styling**: Modular Vanilla CSS with a focus on component-based architecture
- **Media Hosting**: [Cloudinary](https://cloudinary.com/) API for high-resolution furniture assets
- **Email Service**: [Nodemailer](https://nodemailer.com/) for contact form integration
- **Utilities**:
    - `slugify`: For URL-friendly product and room paths
    - `dotenv`: Local environment configuration
    - `express-ejs-layouts`: Modular view management

---

## 📂 2. Root Directory Breakdown

The root contains the orchestration and configuration files that bind the project together.

### `app.js`
The core application file. It initializes the Express instance and performs the following configuration:
- **Port Setup**: Loads `PORT` from `.env`.
- **View Engine**: Designates EJS and sets the layout system to use `layout.ejs`.
- **Static Assets**: Maps the `/public` directory to the root URL path.
- **Global Middleware**:
    - `express.urlencoded` & `express.json`: Parses incoming form and JSON data.
    - `navDataMiddleware`: Crucial step that runs on every request to fetch navigation links from the database.
- **Routing**: Imports and mounts over 10 different route modules (e.g., `homeRoute`, `itemRoute`, `roomRoute`).
- **Database**: Establishes the lifecycle connection to MongoDB using `mongoose.connect`.

### `package.json`
The project manifest.
- **Type: "module"**: Enables modern ES6 imports across the codebase.
- **Dependencies**: Lists all functional libraries required to run the server.
- **Scripts**: Defines `npm start` which uses `nodemon` for a seamless developer experience with hot-reloading.

### `.env` (Manual Configuration)
Stores environment-specific keys like `DB_URI` and Cloudinary secrets. This file is kept out of Git for security.

---

## 🗄 3. Data Infrastructure (`src/models/`)

Managed via Mongoose, these files define the "Shape of Data" in the project.

### `FurnitureItem.js`
Represents an individual product (e.g., Chair, Bed).
- **Schema Fields**:
    - `code`: Unique string (e.g., "LR-001") used for internal identification.
    - `room`: Enum for spatial category (Living Room, Bedroom, etc.).
    - `type`: Specific category (Sofa, Bed, Dining Table).
    - `style`: Enum (Royal, Modern, Traditional).
    - `images`: Array of objects storing Cloudinary `url` and `publicId`.
    - `slug`: Automatically generated from the `name`.
- **Hooks**: A `pre('validate')` middleware runs before every save to update the `slug` if the product name has changed.

### `FurnitureSet.js`
Represents curated collections of furniture.
- **Linking**: Uses a reference to `FurnitureItem` objects.
- **Purpose**: Groups products into room-ready themes (e.g., "Luxury Royal Bedroom Set").

### `Room.js`
Defines the meta-categories for the home.
- **Fields**: `name`, `slug`, `description`, and a `hasIndividualItems` boolean flag.
- **Logic**: Drives the landing pages for major sections like /room/living-room.

---

## 🛣 4. Routing Logic & Business Rules (`src/routes/`)

Each file handles the server-side logic for a specific section of the user journey.

### `home.js`
- **Logic**: Aggregates multiple queries to build the high-impact landing page.
- **Featured Logic**: Filters items and sets by an array of specific `code` strings to ensure the homepage always looks "premium."
- **Grouping**: Fetches all items and uses JavaScript `.reduce()` to group them into types (e.g., all "Beds" together) for the "Browse by Category" section.

### `room.js`
- **Dynamic Routing**:
    - `:slug`: Fetches a room and all items/sets associated with that room's name.
    - `:slug/:type`: Filters the room's inventory further by a specific sub-category (e.g., "Living Room" + "Chairs").
- **Randomization**: Uses `.sort(() => Math.random() - 0.5)` on results to ensure a fresh experience on every page load.

### `item.js` & `set.js`
- **Discovery Engine**:
    - Automatically finds other items of the same type in different styles (Style Variants).
    - Finds complementary items in the same room (Related Items).
- **UX**: This is the heart of the "Shop the Look" experience.

### `catalogue.js`
- **Master View**: Fetches everything.
- **Filter Generation**: Queries the database using `.distinct()` to find every unique Room, Style, and Type currently in stock to populate the sidebar filters.

### `search.js`
- **Backend**: Implements a regex search (`$regex`) on the `name` and `type` fields.
- **API**: Returns JSON results for the real-time search suggestions.

### `wishlist.js`, `about.js`, `services.js`, `contact.js`
Simple routes that render their respective views, handling the static information architecture of the site.

---

## 🛠 5. Middleware Layer (`src/middleware/`)

### `navData.js`
The most critical logic piece for site-wide consistency.
- **Flow**: Runs before every single route.
- **Execution**:
    1. Fetches all Room names and slugs.
    2. For each room, it queries for `distinct('type')` (e.g., what types of furniture are in the Bedroom?).
    3. Injects this nested object into `res.locals.navRooms`.
- **Result**: Every page template in the site can now access this data for the Header dropdown without needing to perform its own query.

---

## 🎨 6. The View System (`src/views/`)

### `layout.ejs` (Global Wrapper)
The master template that wraps around all content.
- **Structure**: Contains the global `<head>`, the site `<header>`, the `<main>` area for `<%- body %>`, and the `<footer>`.
- **Header Logic**: Implements the multi-level navigation menu (dropdowns within dropdowns) powered by the `navData`.
- **Scroll Logic**: Includes an inline script that manages the header's visibility ("hide on scroll down, show on scroll up") and adds the `.scrolled` class for background changes.

### `pages/` (Template Library)
- **`home.ejs`**: Built for high visual impact with large images and multiple carousels.
- **`item.ejs`**: A complex layout managing image galleries, variant selectors, and product descriptions.
- **`room.ejs`**: Visually maps a room's vibe through sets and featured items.
- **`wishlist.ejs`**: An empty shell that gets hydrated by client-side JS using browser storage.

---

## ⚙️ 7. Frontend Logic (`public/`)

### 💅 Modular CSS Strategy
Instead of one massive file, styles are divided logically:
- **`base/`**: Core typography and CSS resets.
- **`components/`**: Styles for reusable elements like `_product-card.css` and `_carousel.css`.
- **`pages/`**: Layout rules unique to the Home, Item, or Catalogue pages.
- **`main.css`**: The "Central Hub" that imports every other CSS file.

### 📜 Client-Side Scripts (`public/js/`)
- **`index.js`**:
    - **Carousel Engine**: A custom, touch-friendly slider implementation that supports mouse-drags, trackpad swipes, and button clicks.
    - **Reveal Animations**: Uses the `IntersectionObserver` API to detect when sections come into view and apply fade-in classes.
- **`search.js`**:
    - Monitors the search input fields.
    - Sends AJAX requests to `/api/search` as the user types.
    - Dynamically builds the suggestion dropdown HTML.
- **`wishlist.js`**:
    - Manages the "Saved Items" list in `localStorage`.
    - Updates the "heart" count in the header.
    - Handles "Add/Remove" buttons on product cards.

---

## ☁️ 8. Media & Utilities (`scripts/`)

These terminal-based scripts manage the heavy lifting of the project lifecycle.

- **`seed.js`**: Clears and populates the database with a full catalog of furniture.
- **`seedLivingRoom.js`**: A targeted script for testing Living Room content and layout.
- **`uploadPics.js`**:
    - Recursively walks through local image folders.
    - Uploads files to Cloudinary.
    - Prints or saves the secure URLs for database entry.
- **`temp.js` / `addSlugs.js`**: Internal maintenance scripts for database migration and data cleaning.

---

## 🔄 9. Core Project Workflows

### **Data Flow: Item View**
1. User clicks a product card link (/item/luxury-sofa).
2. Express matches the route in `item.js`.
3. `navDataMiddleware` runs first, building the site menu.
4. `item.js` finds the product by slug in MongoDB.
5. `item.js` performs "Related Items" search in parallel.
6. The combined data is sent to `item.ejs` inside `layout.ejs`.
7. Browser receives HTML and `index.js` initializes the product image gallery.

### **Data Flow: Catalogue Filtering**
1. User visits `/catalogue`.
2. `catalogue.js` fetches all available Rooms, Styles, and Types for the filters.
3. The page renders all items.
4. Client-side JS (or query params) filters the visible items based on user selection.

---

## 🚀 10. Developer Guide & Maintenance

### Adding a New Room
1. Add the room category to the `Room` model in MongoDB.
2. Ensure the room name matches the `room` enum in `FurnitureItem.js`.
3. The site's navigation will update automatically on refresh.

### Adding a New Product
1. Upload the image to Cloudinary using `uploadPics.js`.
2. Add the item record to MongoDB with the Cloudinary URL.
3. The item will automatically appear in the Catalogue and its respective Room page.

---
*Created by Pawana Furniture Development Team - Dec 2025*
*Technical depth: 320+ lines of documentation.*
