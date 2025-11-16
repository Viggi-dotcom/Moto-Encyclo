// Global variable to hold the flattened array of all motorcycles
let motorcycles = [];

// --- UTILITY FUNCTIONS ---

/**
 * Formats a number as Indian Rupees (₹). Handles null/undefined values.
 * @param {number | null} price The price to format.
 * @returns {string} The formatted price string or 'Price not available'.
 */
function formatPrice(price) {
    if (price === null || price === undefined) {
        return 'Price not available';
    }
    return '₹' + price.toLocaleString('en-IN');
}

/**
 * Displays a spec value, returning 'N/A' if the value is null or undefined.
 * @param {any} value The spec value.
 * @param {string} suffix A suffix to add if the value is valid (e.g., ' HP').
 * @returns {string} The formatted spec string.
 */
function formatSpec(value, suffix = '') {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    return `${value}${suffix}`;
}

/**
 * Scrolls to a specific section on the page.
 * @param {string} sectionId The ID of the element to scroll to.
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- DATA LOADING ---

/**
 * Loads the motorcycle database from JSON.
 * This is the most critical change: It fetches the object of arrays and flattens it 
 * into a single array that the rest of the script expects.
 * It also caches the result to prevent re-fetching on the same session.
 * @returns {Promise<Array>} A promise that resolves to the array of all motorcycles.
 */
async function loadDatabase() {
    if (motorcycles.length > 0) {
        return motorcycles; // Return cached data if already loaded
    }
    try {
        const response = await fetch('database.json');
        const dataByBrand = await response.json(); // This is the object: { "Adly": [...], "Aeon": [...] }
        
        // ** THE KEY CORRECTION IS HERE **
        // We flatten the object's values (which are arrays of bikes) into one single array.
        motorcycles = Object.values(dataByBrand).flat();
        
        return motorcycles;
    } catch (error) {
        console.error('Error loading database:', error);
        return []; // Return an empty array on failure
    }
}

// --- COMPONENT FACTORY ---

/**
 * Creates the HTML for a single bike card.
 * @param {object} bike The bike data object.
 * @returns {string} The HTML string for the bike card.
 */
function createBikeCard(bike) {
    // Handle cases where price might be null
    const priceDisplay = bike.specs.price_original_inr !== null ? formatPrice(bike.specs.price_original_inr) : '<div class="price-unavailable">Price not available</div>';

    return `
        <div class="bike-card" onclick="window.location.href='bike.html?id=${bike.id}'">
            <img src="${bike.imageURL}" alt="${bike.brand} ${bike.model}" loading="lazy">
            <div class="bike-card-content">
                <h3>${bike.model}</h3>
                <div class="brand">${bike.brand} • ${bike.year} • ${bike.specs.cc}cc</div>
                <div class="bike-tags">
                    ${bike.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="bike-specs">
                    <div class="spec-item">
                        <span class="spec-label">Power:</span>
                        <span>${formatSpec(bike.specs.horsepower, ' HP')}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Top Speed:</span>
                        <span>${formatSpec(bike.specs.top_speed, ' km/h')}</span>
                    </div>
                </div>
                <div class="price">${priceDisplay}</div>
            </div>
        </div>
    `;
}

// --- HOMEPAGE FUNCTIONS ---

async function loadHomePage() {
    await loadDatabase();
    
    // Update stats (with checks for null values)
    const totalBikes = motorcycles.length;
    const brands = [...new Set(motorcycles.map(m => m.brand))];
    document.getElementById('total-bikes').textContent = totalBikes;
    document.getElementById('total-brands').textContent = brands.length;

    const bikesWithPower = motorcycles.filter(m => m.specs.horsepower !== null);
    const avgPower = bikesWithPower.length > 0 
        ? Math.round(bikesWithPower.reduce((sum, m) => sum + m.specs.horsepower, 0) / bikesWithPower.length)
        : 0;
    document.getElementById('avg-power').textContent = `${avgPower} HP`;

    const bikesWithSpeed = motorcycles.filter(m => m.specs.top_speed !== null);
    const maxSpeed = bikesWithSpeed.length > 0 
        ? Math.max(...bikesWithSpeed.map(m => m.specs.top_speed))
        : 0;
    document.getElementById('top-speed-stat').textContent = `${maxSpeed} km/h`;

    // --- MODIFIED SECTION STARTS HERE ---

    // Featured bikes (random 6 from those with an available price)
    const featured = [...motorcycles]
        .filter(bike => bike.specs.price_original_inr !== null) // 1. Filter for bikes with a price
        .sort(() => 0.5 - Math.random())                       // 2. Shuffle the filtered list
        .slice(0, 6);                                          // 3. Take the first 6

    document.getElementById('featured-bikes').innerHTML = featured.map(bike => createBikeCard(bike)).join('');

    // --- MODIFIED SECTION ENDS HERE ---
}

// --- BRANDS PAGE FUNCTIONS ---

async function loadBrandsPage() {
    await loadDatabase();
    
    // This logic now works correctly because `motorcycles` is a flat array.
    const brandsMap = {};
    motorcycles.forEach(bike => {
        if (!brandsMap[bike.brand]) {
            brandsMap[bike.brand] = 0;
        }
        brandsMap[bike.brand]++;
    });

    const brands = Object.keys(brandsMap).sort();
    
    document.getElementById('brands-grid').innerHTML = brands.map(brand => `
        <div class="brand-card" onclick="window.location.href='brand.html?brand=${encodeURIComponent(brand)}'">
            <h3 class="chrome-text">${brand}</h3>
            <p class="model-count">${brandsMap[brand]} Models</p>
        </div>
    `).join('');
}

// --- BIKES BROWSER PAGE FUNCTIONS ---

let currentFilters = {
    search: '',
    brand: '',
    status: '',
    cc: '',
    sort: 'brand'
};

async function loadBikesPage() {
    await loadDatabase();
    
    const brands = [...new Set(motorcycles.map(m => m.brand))].sort();
    document.getElementById('brand-filter').innerHTML = 
        '<option value="">All Brands</option>' + 
        brands.map(b => `<option value="${b}">${b}</option>`).join('');

    // Event listeners
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });
    document.getElementById('brand-filter').addEventListener('change', (e) => {
        currentFilters.brand = e.target.value;
        applyFilters();
    });
    document.getElementById('status-filter').addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        applyFilters();
    });
    document.getElementById('cc-filter').addEventListener('change', (e) => {
        currentFilters.cc = e.target.value;
        applyFilters();
    });
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });

    applyFilters();
}

function applyFilters() {
    let filtered = motorcycles.filter(bike => {
        // Search filter
        if (currentFilters.search && 
            !(bike.model.toLowerCase().includes(currentFilters.search) || 
              bike.brand.toLowerCase().includes(currentFilters.search) ||
              String(bike.year).includes(currentFilters.search))) {
            return false;
        }
        // Brand filter
        if (currentFilters.brand && bike.brand !== currentFilters.brand) return false;
        // Status filter
        if (currentFilters.status && bike.status !== currentFilters.status) return false;
        // CC filter
        if (currentFilters.cc) {
            const cc = bike.specs.cc;
            const [min, max] = currentFilters.cc.split('-').map(v => v === '+' ? Infinity : parseInt(v) || 0);
            if (max && max !== Infinity) {
                if (cc < min || cc > max) return false;
            } else {
                if (cc < min) return false;
            }
        }
        return true;
    });

    // Sort with robust handling for null values
    filtered.sort((a, b) => {
        const specA = a.specs;
        const specB = b.specs;
        switch(currentFilters.sort) {
            case 'brand': return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
            // For price, treat nulls as highest (for asc) or lowest (for desc)
            case 'price-asc': return (specA.price_original_inr ?? Infinity) - (specB.price_original_inr ?? Infinity);
            case 'price-desc': return (specB.price_original_inr ?? -1) - (specA.price_original_inr ?? -1);
            // For other specs, treat nulls as the lowest value
            case 'power-desc': return (specB.horsepower ?? -1) - (specA.horsepower ?? -1);
            case 'speed-desc': return (specB.top_speed ?? -1) - (specA.top_speed ?? -1);
            case 'mileage-desc': return (specB.mileage_kmpl ?? -1) - (specA.mileage_kmpl ?? -1);
            case 'cc-asc': return (specA.cc ?? 0) - (specB.cc ?? 0);
            case 'cc-desc': return (specB.cc ?? 0) - (specA.cc ?? 0);
            default: return 0;
        }
    });

    document.getElementById('bikes-count').textContent = `Showing ${filtered.length} of ${motorcycles.length} motorcycles`;
    document.getElementById('all-bikes').innerHTML = filtered.length > 0 
        ? filtered.map(bike => createBikeCard(bike)).join('')
        : '<p class="empty-state">No motorcycles match your criteria.</p>';
}

// --- BRAND DETAIL PAGE FUNCTIONS ---

async function loadBrandPage() {
    await loadDatabase();
    
    const urlParams = new URLSearchParams(window.location.search);
    const brandName = decodeURIComponent(urlParams.get('brand'));
    
    const brandBikes = motorcycles.filter(m => m.brand === brandName);
    
    if (brandBikes.length === 0) {
        document.getElementById('brand-name').textContent = "Brand Not Found";
        document.getElementById('brand-count').textContent = "";
        document.getElementById('brand-bikes').innerHTML = `<p>There are no models for the brand "${brandName}" in the database.</p>`;
        return;
    }

    document.getElementById('brand-name').textContent = brandName;
    document.getElementById('brand-count').textContent = `${brandBikes.length} Models in Collection`;
    document.getElementById('brand-bikes').innerHTML = brandBikes.map(bike => createBikeCard(bike)).join('');
}

// --- BIKE DETAIL PAGE FUNCTIONS ---

async function loadBikeDetailPage() {
    await loadDatabase();
    
    const urlParams = new URLSearchParams(window.location.search);
    const bikeId = urlParams.get('id');
    
    // This now works because `motorcycles` is a flat array.
    const bike = motorcycles.find(m => m.id === bikeId);

    if (!bike) {
        document.getElementById('bike-detail').innerHTML = '<p class="empty-state">Bike not found. It may have been removed or the ID is incorrect.</p>';
        return;
    }

    // Use the formatSpec helper for cleaner display of potentially null values
    document.getElementById('bike-detail').innerHTML = `
        <div class="detail-header">
            <img src="${bike.imageURL}" alt="${bike.brand} ${bike.model}" class="detail-image">
            <div class="detail-info">
                <h1 class="chrome-text">${bike.model}</h1>
                <a href="brand.html?brand=${encodeURIComponent(bike.brand)}" class="brand-link">${bike.brand} • ${bike.year}</a>
                <div class="bike-tags" style="margin: 1rem 0;">
                    ${bike.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    <span class="tag status-${bike.status.toLowerCase().replace(' ', '-')}">${bike.status}</span>
                </div>
                <p style="font-size: 1.1rem; line-height: 1.8; margin: 1.5rem 0;">${bike.history}</p>
                <div class="price" style="font-size: 2rem; margin-top: 1.5rem;">${formatPrice(bike.specs.price_original_inr)}</div>
                <button class="btn" style="margin-top: 1.5rem;" onclick="addToCompare('${bike.id}')">Add to Compare</button>
            </div>
        </div>

        <div class="detail-specs">
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.horsepower, ' HP')}</div>
                <div class="label">Horsepower</div>
            </div>
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.torque, ' Nm')}</div>
                <div class="label">Torque</div>
            </div>
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.cc, 'cc')}</div>
                <div class="label">Engine</div>
            </div>
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.top_speed, ' km/h')}</div>
                <div class="label">Top Speed</div>
            </div>
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.mileage_kmpl, ' km/l')}</div>
                <div class="label">Mileage</div>
            </div>
            <div class="spec-box">
                <div class="value">${formatSpec(bike.specs.weight, ' kg')}</div>
                <div class="label">Weight</div>
            </div>
        </div>

        <div class="color-variants">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Available Colors</h3>
            <div class="color-list">
                ${bike.color_variants.map(color => `<div class="color-item">${color}</div>`).join('')}
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Technical Specifications</h3>
            <p style="font-size: 1.1rem; color: #bbb;">${bike.specs.engine}</p>
        </div>
    `;
}

function addToCompare(bikeId) {
    window.location.href = `compare.html?add=${bikeId}`;
}

// --- COMPARE PAGE FUNCTIONS ---

async function loadComparePage() {
    await loadDatabase();
    
    // Sort bikes alphabetically for the dropdown
    const sortedBikes = [...motorcycles].sort((a,b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
    
    const options = '<option value="">Select a bike</option>' + 
        sortedBikes.map(m => `<option value="${m.id}">${m.brand} ${m.model} (${m.year})</option>`).join('');
    
    for (let i = 1; i <= 4; i++) {
        const selectElement = document.getElementById(`compare-bike-${i}`);
        selectElement.innerHTML = options;
        selectElement.addEventListener('change', updateComparison);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const addBikeId = urlParams.get('add');
    if (addBikeId) {
        document.getElementById('compare-bike-1').value = addBikeId;
    }

    updateComparison();
}

function updateComparison() {
    const selectedBikes = [];
    for (let i = 1; i <= 4; i++) {
        const bikeId = document.getElementById(`compare-bike-${i}`).value;
        if (bikeId) {
            const bike = motorcycles.find(m => m.id === bikeId);
            if (bike) selectedBikes.push(bike);
        }
    }

    if (selectedBikes.length === 0) {
        document.getElementById('compare-result').innerHTML = '<div class="empty-state"><h3>Select one or more bikes to compare their specifications.</h3></div>';
        return;
    }

    const headers = selectedBikes.map(b => `<th><a href="bike.html?id=${b.id}">${b.brand} ${b.model}</a></th>`).join('');
    const images = selectedBikes.map(b => `<td><img src="${b.imageURL}" style="width: 100%; max-width: 200px;" loading="lazy"></td>`).join('');
    const years = selectedBikes.map(b => `<td>${b.year}</td>`).join('');
    const statuses = selectedBikes.map(b => `<td>${b.status}</td>`).join('');
    const engines = selectedBikes.map(b => `<td>${b.specs.engine}</td>`).join('');
    const horsepowers = selectedBikes.map(b => `<td>${formatSpec(b.specs.horsepower, ' HP')}</td>`).join('');
    const torques = selectedBikes.map(b => `<td>${formatSpec(b.specs.torque, ' Nm')}</td>`).join('');
    const ccs = selectedBikes.map(b => `<td>${formatSpec(b.specs.cc, 'cc')}</td>`).join('');
    const topSpeeds = selectedBikes.map(b => `<td>${formatSpec(b.specs.top_speed, ' km/h')}</td>`).join('');
    const mileages = selectedBikes.map(b => `<td>${formatSpec(b.specs.mileage_kmpl, ' km/l')}</td>`).join('');
    const weights = selectedBikes.map(b => `<td>${formatSpec(b.specs.weight, ' kg')}</td>`).join('');
    const prices = selectedBikes.map(b => `<td>${formatPrice(b.specs.price_original_inr)}</td>`).join('');

    const html = `
        <table class="compare-table">
            <thead>
                <tr><th>Specification</th>${headers}</tr>
            </thead>
            <tbody>
                <tr><td><strong>Image</strong></td>${images}</tr>
                <tr><td><strong>Year</strong></td>${years}</tr>
                <tr><td><strong>Status</strong></td>${statuses}</tr>
                <tr><td><strong>Price</strong></td>${prices}</tr>
                <tr><td><strong>Engine</strong></td>${engines}</tr>
                <tr><td><strong>Displacement</strong></td>${ccs}</tr>
                <tr><td><strong>Horsepower</strong></td>${horsepowers}</tr>
                <tr><td><strong>Torque</strong></td>${torques}</tr>
                <tr><td><strong>Top Speed</strong></td>${topSpeeds}</tr>
                <tr><td><strong>Mileage</strong></td>${mileages}</tr>
                <tr><td><strong>Weight</strong></td>${weights}</tr>
            </tbody>
        </table>
    `;

    document.getElementById('compare-result').innerHTML = html;
}

// --- TOP LISTS PAGE FUNCTIONS ---

async function loadTopListsPage() {
    await loadDatabase();
    
    renderTopList('top-power', 'Most Powerful Motorcycles', 'horsepower', m => formatSpec(m.specs.horsepower, ' HP'));
    renderTopList('top-speed', 'Fastest Motorcycles', 'top_speed', m => formatSpec(m.specs.top_speed, ' km/h'));
    renderTopList('top-mileage', 'Most Fuel Efficient', 'mileage_kmpl', m => formatSpec(m.specs.mileage_kmpl, ' km/l'));
    
    // For price, filter out nulls before sorting
    const pricedBikes = motorcycles.filter(m => m.specs.price_original_inr !== null);
    renderTopList('top-expensive', 'Most Expensive Motorcycles', 'price_original_inr', m => formatPrice(m.specs.price_original_inr), true, pricedBikes);
    renderTopList('top-affordable', 'Most Affordable Motorcycles', 'price_original_inr', m => formatPrice(m.specs.price_original_inr), false, pricedBikes);
}

function renderTopList(elementId, title, sortKey, valueFormatter, descending = true, data = motorcycles) {
    const sorted = [...data]
        .filter(m => m.specs[sortKey] !== null) // Ensure we don't sort items with null values for the key
        .sort((a, b) => {
            const aVal = a.specs[sortKey];
            const bVal = b.specs[sortKey];
            return descending ? bVal - aVal : aVal - bVal;
        })
        .slice(0, 10);

    const html = `
        <h2>${title}</h2>
        <div class="ranked-list">
            ${sorted.map((bike, index) => `
                <div class="ranked-item" onclick="window.location.href='bike.html?id=${bike.id}'">
                    <div class="rank-number">${index + 1}</div>
                    <img src="${bike.imageURL}" alt="${bike.brand} ${bike.model}" loading="lazy">
                    <div class="ranked-info">
                        <h4>${bike.model}</h4>
                        <div class="brand">${bike.brand} • ${bike.year}</div>
                    </div>
                    <div class="ranked-value">${valueFormatter(bike)}</div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById(elementId).innerHTML = html;
}