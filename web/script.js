// Admin password (in production, this should be more secure)
const ADMIN_PASSWORD = "admin123"

// Default products data (including all 6 requested)
const defaultProducts = [
  {
    id: 1,
    name: "Organic Jaggery",
    category: "Organic Jaggery",
    description: "Premium quality organic jaggery made from pure sugarcane juice. Rich in minerals and completely natural.",
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
  {
    id: 5,
    name: "Onion Garlic Powder",
    category: "Spices",
    description: "Dehydrated onion and garlic powder mix. Adds authentic flavor to curries, soups, and snacks.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "Masala Makhana",
    category: "Makhana",
    description: "Crunchy fox nuts seasoned with Indian spices. A healthy and tasty snacking option.",
    image: "/placeholder.svg?height=200&width=300",
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
