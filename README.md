# Motorcycle Encyclopedia - "Asphalt & Chrome"

A comprehensive, multi-page motorcycle encyclopedia website featuring 50+ motorcycles with detailed specifications, comparisons, and top lists.

## 🚀 Features

- **Homepage**: Hero section, statistics dashboard, and featured motorcycles
- **Brands Page**: Alphabetically sorted list of all motorcycle brands
- **Browse Bikes**: Advanced filtering and sorting capabilities
- **Brand Details**: View all models from a specific manufacturer
- **Bike Details**: Complete specifications, history, and color variants
- **Compare Tool**: Side-by-side comparison of up to 4 motorcycles
- **Top Lists**: Curated rankings by power, speed, fuel efficiency, and price

## 📁 File Structure

```
motorcycle-encyclopedia/
├── index.html          # Homepage
├── brands.html         # All brands page
├── bikes.html          # Browse/filter bikes page
├── brand.html          # Single brand details (dynamic)
├── bike.html           # Single bike details (dynamic)
├── compare.html        # Bike comparison tool
├── top_lists.html      # Top rankings page
├── style.css           # All styling
├── script.js           # All JavaScript functionality
├── database.json       # Motorcycle data (53 bikes)
└── README.md           # This file
```

## 🎨 Design Theme: "Asphalt & Chrome"

- **Background**: Textured asphalt black (#181818)
- **Text**: Off-white (#e0e0e0)
- **Accent**: Bright red (#ff4444) for highlights
- **Chrome Effect**: Metallic gradient on headings
- **Image Effects**: Grayscale to color on hover
- **Button Effects**: Animated glint/sheen

## 🖥️ How to Run

### Option 1: Using Python (Recommended)
```bash
# Navigate to the project folder
cd motorcycle-encyclopedia

# Start a local server (Python 3)
python -m http.server 8000

# Or using Python 2
python -m SimpleHTTPServer 8000

# Open browser to: http://localhost:8000
```

### Option 2: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project folder
cd motorcycle-encyclopedia

# Start server
http-server

# Open browser to: http://localhost:8080
```

### Option 3: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## ⚠️ Important Note

This website requires a **local server** to run properly because:
- It uses `fetch()` to load `database.json`
- Modern browsers block `fetch()` requests on `file://` protocol for security reasons

**Do NOT** simply double-click `index.html` - it will not work correctly!

## 🔍 Features Breakdown

### Filtering & Sorting
- Search by brand or model name
- Filter by brand, status, engine CC range
- Sort by price, horsepower, top speed, mileage, CC

### Dynamic Pages
- **brand.html**: Uses URL parameter `?brand=BrandName`
- **bike.html**: Uses URL parameter `?id=bike_id`
- **compare.html**: Supports `?add=bike_id` from detail pages

### Top Lists Navigation
- Click quick navigation buttons to jump to specific rankings
- Smooth scroll behavior

## 💾 Database Structure

Each motorcycle in `database.json` includes:
- Basic info (id, brand, model, year, status)
- Tags and category
- Image URL
- Historical description
- Complete specifications (engine, power, torque, mileage, speed, weight, price)
- Color variants

All prices are in Indian Rupees (INR).

## 📱 Responsive Design

Fully responsive with breakpoints:
- Mobile: < 768px (single column layouts)
- Tablet: 768px - 1024px
- Desktop: > 1024px (multi-column grids)

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Grid, Flexbox, animations, gradients
- **JavaScript (ES6+)**: Async/await, fetch API, DOM manipulation
- **JSON**: Data storage

No external frameworks or libraries required!

## 📊 Statistics

- **53 Motorcycles** from 20+ brands
- **8 Filtering Options**
- **8 Sorting Methods**
- **5 Top Lists**
- **Compare up to 4 bikes** simultaneously

## 🎯 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## 👨‍💻 Author

Built with passion for motorcycles and web development.

---

**Enjoy exploring the world of motorcycles!** 🏍️💨
