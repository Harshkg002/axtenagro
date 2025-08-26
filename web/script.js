// Admin password (in production, this should be more secure)
const ADMIN_PASSWORD = "admin123"

// Default products data
const defaultProducts = [
  {
    id: 1,
    name: "Organic Jaggery",
    category: "Organic Jaggery",
    description:
      "Premium quality organic jaggery made from pure sugarcane juice. Rich in minerals and completely natural.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Sattu Powder",
    category: "Grains",
    description: "Nutritious sattu powder made from roasted gram. High in protein and perfect for healthy drinks.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Masala Sattu",
    category: "Spices",
    description: "Flavored sattu powder with aromatic spices. Ready to mix and drink for instant nutrition.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Fox Nuts (Makhana)",
    category: "Makhana",
    description: "Premium quality fox nuts, perfect for snacking. Rich in protein and low in calories.",
    image: "/placeholder.svg?height=200&width=300",
  },
]

// Initialize products in localStorage if not exists
function initializeProducts() {
  if (!localStorage.getItem("N5 Overseas_Products")) {
    localStorage.setItem("N5 Overseas", JSON.stringify(defaultProducts))
  }
}

// Get products from localStorage
function getProducts() {
  const products = localStorage.getItem("N5 Overseas_Products")
  return products ? JSON.parse(products) : []
}

// Save products to localStorage
function saveProducts(products) {
  localStorage.setItem("N5 Overseas_Products", JSON.stringify(products))
}

// Generate unique ID for new products
function generateId() {
  const products = getProducts()
  return products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1
}

// Display products on homepage
function displayHomeProducts() {
  const container = document.getElementById("home-products")
  if (!container) return

  const products = getProducts().slice(0, 4) // Show only first 4 products

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                ${product.price ? `<div class="product-price">₹${product.price}/${product.unit}</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

// Display all products on products page
function displayProducts(productsToShow = null) {
  const container = document.getElementById("products-container")
  const noProductsDiv = document.getElementById("no-products")

  if (!container) return

  const products = productsToShow || getProducts()

  if (products.length === 0) {
    container.innerHTML = ""
    if (noProductsDiv) noProductsDiv.style.display = "block"
    return
  }

  if (noProductsDiv) noProductsDiv.style.display = "none"

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                ${product.price ? `<div class="product-price">₹${product.price}/${product.unit}</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

// Filter products based on search and category
function filterProducts() {
  const searchTerm = document.getElementById("product-search")?.value.toLowerCase() || ""
  const categoryFilter = document.getElementById("category-filter")?.value || ""

  const products = getProducts()
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm)
    const matchesCategory = !categoryFilter || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  displayProducts(filteredProducts)
}

// Hero slider functionality
let currentSlideIndex = 0
const slides = document.querySelectorAll(".slide")
const dots = document.querySelectorAll(".dot")

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index)
  })
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index)
  })
}

function currentSlide(index) {
  currentSlideIndex = index - 1
  showSlide(currentSlideIndex)
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length
  showSlide(currentSlideIndex)
}

// Auto-advance slides
if (slides.length > 0) {
  setInterval(nextSlide, 5000)
}

// Admin functionality
let isLoggedIn = false
let editingProductId = null

// Check admin login
function checkAdminLogin() {
  const loginScreen = document.getElementById("login-screen")
  const dashboard = document.getElementById("admin-dashboard")

  if (!loginScreen || !dashboard) return

  if (isLoggedIn) {
    loginScreen.style.display = "none"
    dashboard.style.display = "block"
    loadAdminProducts()
    updateStats()
  } else {
    loginScreen.style.display = "flex"
    dashboard.style.display = "none"
  }
}

// Admin login form
document.getElementById("admin-login-form")?.addEventListener("submit", (e) => {
  e.preventDefault()
  const password = document.getElementById("admin-password").value
  const errorDiv = document.getElementById("login-error")

  if (password === ADMIN_PASSWORD) {
    isLoggedIn = true
    checkAdminLogin()
    errorDiv.style.display = "none"
  } else {
    errorDiv.style.display = "block"
  }
})

// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  isLoggedIn = false
  editingProductId = null
  document.getElementById("product-form").reset()
  document.getElementById("cancel-edit").style.display = "none"
  checkAdminLogin()
})

// Product form submission
document.getElementById("product-form")?.addEventListener("submit", (e) => {
  e.preventDefault()

  const name = document.getElementById("product-name").value
  const category = document.getElementById("product-category").value
  const description = document.getElementById("product-description").value
  const price = Number.parseFloat(document.getElementById("product-price").value) || 0
  const unit = document.getElementById("product-unit").value
  const imageFile = document.getElementById("product-image").files[0]

  if (!name || !category || !description) {
    alert("Please fill in all required fields")
    return
  }

  const products = getProducts()

  if (editingProductId) {
    // Update existing product
    const productIndex = products.findIndex((p) => p.id === editingProductId)
    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        name,
        category,
        description,
        price,
        unit,
      }

      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          products[productIndex].image = e.target.result
          saveProducts(products)
          loadAdminProducts()
          updateStats()
          resetForm()
        }
        reader.readAsDataURL(imageFile)
      } else {
        saveProducts(products)
        loadAdminProducts()
        updateStats()
        resetForm()
      }
    }
  } else {
    // Add new product
    if (!imageFile) {
      alert("Please select an image for the product")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const newProduct = {
        id: generateId(),
        name,
        category,
        description,
        image: e.target.result,
      }

      products.push(newProduct)
      saveProducts(products)
      loadAdminProducts()
      updateStats()
      resetForm()
    }
    reader.readAsDataURL(imageFile)
  }
})

// Reset form
function resetForm() {
  document.getElementById("product-form").reset()
  document.getElementById("image-preview").innerHTML = ""
  document.getElementById("cancel-edit").style.display = "none"
  editingProductId = null
}

// Cancel edit
document.getElementById("cancel-edit")?.addEventListener("click", resetForm)

// Image preview
document.getElementById("product-image")?.addEventListener("change", (e) => {
  const file = e.target.files[0]
  const preview = document.getElementById("image-preview")

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
    }
    reader.readAsDataURL(file)
  } else {
    preview.innerHTML = ""
  }
})

// Load products in admin table
function loadAdminProducts() {
  const tbody = document.getElementById("admin-products-list")
  if (!tbody) return

  const products = getProducts()

  tbody.innerHTML = products
    .map(
      (product) => `
        <tr>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price ? `₹${product.price}/${product.unit}` : "N/A"}</td>
            <td class="table-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

// Edit product
function editProduct(id) {
  const products = getProducts()
  const product = products.find((p) => p.id === id)

  if (product) {
    editingProductId = id
    document.getElementById("product-name").value = product.name
    document.getElementById("product-category").value = product.category
    document.getElementById("product-description").value = product.description
    document.getElementById("product-price").value = product.price || ""
    document.getElementById("product-unit").value = product.unit
    document.getElementById("image-preview").innerHTML = `<img src="${product.image}" alt="Preview">`
    document.getElementById("cancel-edit").style.display = "inline-block"

    // Scroll to form
    document.getElementById("product-form").scrollIntoView({ behavior: "smooth" })
  }
}

// Delete product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    const products = getProducts()
    const filteredProducts = products.filter((p) => p.id !== id)
    saveProducts(filteredProducts)
    loadAdminProducts()
    updateStats()
  }
}

// Update statistics
function updateStats() {
  const products = getProducts()
  const categories = [...new Set(products.map((p) => p.category))]

  const totalProductsEl = document.getElementById("total-products")
  const totalCategoriesEl = document.getElementById("total-categories")

  if (totalProductsEl) totalProductsEl.textContent = products.length
  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length
}

// Export data
document.getElementById("export-data")?.addEventListener("click", () => {
  const products = getProducts()
  const dataStr = JSON.stringify(products, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(dataBlob)
  link.download = "axtenagro-products.json"
  link.click()
})

// Import data
document.getElementById("import-data")?.addEventListener("click", () => {
  document.getElementById("import-file").click()
})

document.getElementById("import-file")?.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const products = JSON.parse(e.target.result)
        if (Array.isArray(products)) {
          saveProducts(products)
          loadAdminProducts()
          updateStats()
          alert("Products imported successfully!")
        } else {
          alert("Invalid file format")
        }
      } catch (error) {
        alert("Error reading file: " + error.message)
      }
    }
    reader.readAsText(file)
  }
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeProducts()

  // Check if we're on admin page
  if (window.location.pathname.includes("admin.html")) {
    checkAdminLogin()
  } else {
    // Load products for public pages
    displayHomeProducts()
    displayProducts()
  }

  // Add search functionality if on products page
  const searchInput = document.getElementById("product-search")
  const categorySelect = document.getElementById("category-filter")

  if (searchInput) {
    searchInput.addEventListener("input", filterProducts)
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", filterProducts)
  }
})

// Make functions global for onclick handlers
window.editProduct = editProduct
window.deleteProduct = deleteProduct
window.currentSlide = currentSlide
window.filterProducts = filterProducts
