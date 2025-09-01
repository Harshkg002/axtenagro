// Admin password (in production, this should be more secure)
const ADMIN_PASSWORD = "admin123"

// Default products data (including all 6 requested)
const defaultProducts = [
  {
    id: 1,
    name: "Organic Jaggery",
    category: "Organic Jaggery",
    description: "Premium quality organic jaggery made from pure sugarcane juice. Rich in minerals and completely natural.",
    image: "web/images/download-1.jpg",
  },
  {
    id: 2,
    name: "Sattu Powder",
    category: "Grains",
    description: "Nutritious sattu powder made from roasted gram. High in protein and perfect for healthy drinks.",
    image: "images/shopping.webp",
  },
  {
    id: 3,
    name: "Masala Sattu",
    category: "Spices",
    description: "Flavored sattu powder with aromatic spices. Ready to mix and drink for instant nutrition.",
    image: "images/unnamed-3.png",
  },
  {
    id: 4,
    name: "Fox Nuts (Makhana)",
    category: "Makhana",
    description: "Premium quality fox nuts, perfect for snacking. Rich in protein and low in calories.",
    image: "images/download.jpg",
  },
  {
    id: 5,
    name: "Onion Garlic Powder",
    category: "Spices",
    description: "Dehydrated onion and garlic powder mix. Adds authentic flavor to curries, soups, and snacks.",
    image: "images/unnamed-2.png",
  },
  {
    id: 6,
    name: "Masala Makhana",
    category: "Makhana",
    description: "Crunchy fox nuts seasoned with Indian spices. A healthy and tasty snacking option.",
    image: "images/download-1.jpg",
  },
]

// Correct storage key
const STORAGE_KEY = "N5 Overseas_Products"

// Initialize products in localStorage if not exists (or add missing ones)
function initializeProducts() {
  let storedProducts = getProducts()

  // For each default product, check if it already exists by name
  defaultProducts.forEach((defaultProduct) => {
    const exists = storedProducts.some(
      (p) => p.name.toLowerCase() === defaultProduct.name.toLowerCase()
    )
    if (!exists) {
      storedProducts.push({ ...defaultProduct, id: generateId(storedProducts) })
    }
  })

  saveProducts(storedProducts)
}

// Get products from localStorage
function getProducts() {
  const products = localStorage.getItem(STORAGE_KEY)
  return products ? JSON.parse(products) : []
}

// Save products to localStorage
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

// Generate unique ID for new products
function generateId(products = null) {
  const allProducts = products || getProducts()
  return allProducts.length > 0 ? Math.max(...allProducts.map((p) => p.id)) + 1 : 1
}

// Render products to the homepage and products page
function renderProducts() {
  const products = getProducts()

  // Homepage preview
  const homeContainer = document.getElementById("home-products")
  if (homeContainer) {
    homeContainer.innerHTML = products
      .slice(0, 5) // show only first 4 on homepage
      .map(productToHTML)
      .join("")
  }

  // Products page
  const productsContainer = document.getElementById("products-container")
  if (productsContainer) {
    productsContainer.innerHTML = products.map(productToHTML).join("")
  }
}

// Helper to generate product card HTML
function productToHTML(p) {
  return `
    <a class="product-card-link" href="product-details.html?id=${p.id}">
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
        </div>
      </div>
    </a>
  `;
}



// Initialize and render when page loads
window.addEventListener("DOMContentLoaded", () => {
  initializeProducts()
  renderProducts()
})
