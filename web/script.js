// ---------------- FIREBASE IMPORTS ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, doc, setDoc, getDocs, query, orderBy, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBbqGo-y2jA8qNb_OTD0dwMspbf7aItabM",
  authDomain: "n5-overseas-9dfe6.firebaseapp.com",
  projectId: "n5-overseas-9dfe6",
  storageBucket: "n5-overseas-9dfe6.appspot.com",
  messagingSenderId: "544772467104",
  appId: "1:544772467104:web:dee7d93d701df1f2f71cc5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- PLACEHOLDER IMAGE ----------------
const PLACEHOLDER_IMAGE = "images/no-image.png"; // <-- Add this file in your images/ folder

// ---------------- FALLBACK DEFAULT PRODUCTS ----------------
const defaultProducts = [
  {
    id: 1,
    name: "Organic Jaggery",
    category: "Organic Jaggery",
    description: "Premium quality organic jaggery made from pure sugarcane juice. Rich in minerals and completely natural.",
    image: "images/download-1.jpg",
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
];

// ---------------- FETCH PRODUCTS ----------------
async function getProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("⚠️ Firestore unavailable, using local defaultProducts.", err);
    return defaultProducts;
  }
}

// ---------------- RENDER PRODUCTS ----------------
async function renderProducts() {
  const products = await getProducts();

  // Homepage preview
  const homeContainer = document.getElementById("home-products");
  if (homeContainer) {
    homeContainer.innerHTML = products.slice(0, 3).map(productToHTML).join("");
  }

  // Products page
  const productsContainer = document.getElementById("products-container");
  if (productsContainer) {
    productsContainer.innerHTML = products.map(productToHTML).join("");
  }

  // Product details page
  const detailsEl = document.getElementById("product-details");
  if (detailsEl) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = products.find(p => String(p.id) === id || p.id === id);
    if (!product) {
      detailsEl.innerHTML = "<div class='no-products'>Product not found.</div>";
    } else {
      const imgSrc = product.image && product.image.trim() !== "" ? product.image : PLACEHOLDER_IMAGE;
      detailsEl.innerHTML = `
        <div class="product-card" style="max-width:900px;margin:auto;">
          <img src="${imgSrc}" alt="${product.name}" style="height:420px;object-fit:cover;width:100%;">
          <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h2 style="margin:10px 0 6px 0;">${product.name}</h2>
            <p>${product.description}</p>
            <div style="margin-top:16px;">
              <a class="btn-primary" href="contact.html">Enquire Now</a>
              <a class="btn-secondary" href="products.html" style="margin-left:8px;">← Back to Products</a>
            </div>
          </div>
        </div>`;
    }
  }
}

const OWNER_EMAIL = "akshsaini48@gmail.com";

// ---------------- ADMIN LOGIN ----------------
window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form");
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("admin-dashboard");
  const errorEl = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("admin-email").value;
      const password = document.getElementById("admin-password").value;

      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);

        if (userCred.user.email === OWNER_EMAIL) {
          // ✅ Success
          loginScreen.style.display = "none";
          dashboard.style.display = "block";
          errorEl.style.display = "none";
          await renderAdminProductsTable();
          await renderProducts();
        } else {
          // ❌ Not the admin
          errorEl.textContent = "You are not authorized as admin.";
          errorEl.style.display = "block";
          await signOut(auth);
        }
      } catch (err) {
        errorEl.textContent = "Invalid email or password.";
        errorEl.style.display = "block";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      loginScreen.style.display = "flex";
      dashboard.style.display = "none";
    });
  }
});

// ---------------- PRODUCT CARD HELPER ----------------
function productToHTML(p) {
  const imgSrc = p.image && p.image.trim() !== "" ? p.image : PLACEHOLDER_IMAGE;
  return `
    <a class="product-card-link" href="product-details.html?id=${p.id}">
      <div class="product-card">
        <img src="${imgSrc}" alt="${p.name}">
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
        </div>
      </div>
    </a>
  `;
}

// ---------------- ADMIN PRODUCTS TABLE ----------------
async function renderAdminProductsTable() {
  const list = document.getElementById("admin-products-list");
  if (!list) return;
  const products = await getProducts();

  // Stats
  const totalEl = document.getElementById("total-products");
  const catsEl = document.getElementById("total-categories");
  totalEl && (totalEl.textContent = String(products.length));
  catsEl && (catsEl.textContent = String(new Set(products.map(p => p.category)).size));

  // ✅ Only Image | Name | Category | Delete
  list.innerHTML = products.map(p => {
    const imgSrc = p.image && p.image.trim() !== "" ? p.image : PLACEHOLDER_IMAGE;
    return `
      <tr>
        <td><img src="${imgSrc}" alt="${p.name}"></td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td class="table-actions">
          <button class="btn-delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>`;
  }).join("");

  // Delete handlers
  list.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "products", btn.getAttribute("data-id")));
      await renderAdminProductsTable();
      await renderProducts();
    });
  });
}

// ---------------- INITIAL RENDER ----------------
window.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("admin-login-form")) {
    await renderProducts();
  }
});

// ---------------- SLIDER SCRIPT ----------------
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {
  if (slides.length === 0 || dots.length === 0) return;
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
    if (dots[i]) dots[i].classList.toggle("active", i === index);
  });
}

function nextSlide() {
  if (slides.length === 0) return;
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}

if (slides.length > 0 && dots.length > 0) {
  setInterval(nextSlide, 3000);
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      slideIndex = i;
      showSlide(slideIndex);
    });
  });
}

// ---------------- CHAT WIDGET ----------------
const chatBtn = document.querySelector(".chat-btn");
if (chatBtn) {
  chatBtn.addEventListener("click", () => {
    window.location.href = "contact.html";
  });
}


// ---------------- ADD PRODUCT FORM HANDLER ----------------
window.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("product-form");

  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("product-name").value.trim();
      const category = document.getElementById("product-category").value.trim();
      const description = document.getElementById("product-description").value.trim();
      const imageInput = document.getElementById("product-image");

      // Use placeholder if no image selected
      let imageUrl = PLACEHOLDER_IMAGE;

      if (imageInput && imageInput.files && imageInput.files[0]) {
        // For now, just read local file name (not upload to Firebase Storage)
        // If you want full upload, we’ll add Firebase Storage later
        imageUrl = URL.createObjectURL(imageInput.files[0]);
      }

      if (!name || !category || !description) {
        alert("⚠️ Please fill out all required fields.");
        return;
      }

      try {
        // Add to Firestore
        const newDocRef = doc(collection(db, "products"));
        await setDoc(newDocRef, {
          name,
          category,
          description,
          image: imageUrl
        });

        alert("✅ Product added successfully!");
        productForm.reset();
        document.getElementById("image-preview").innerHTML = "";

        // Refresh tables and product list
        await renderAdminProductsTable();
        await renderProducts();

      } catch (err) {
        console.error("❌ Error adding product:", err);
        alert("Error adding product. Check console for details.");
      }
    });
  }
});

