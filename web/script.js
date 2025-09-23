// ✅ Supabase Init
const { createClient } = supabase;

const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 👤 Admin emails
const ADMIN_EMAILS = ["akshsaini48@gmail.com", "niteshsaini014@gmail.com"];

// DOM elements
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const uploadForm = document.getElementById("uploadForm");
const statusEl = document.getElementById("status");
const loginScreen = document.getElementById("loginScreen");
const uploadSection = document.getElementById("uploadSection");
const productList = document.getElementById("productList");

// 🆕 Load and display products (Admin version – no enquiry form)
async function loadProducts() {
  if (!productList) return;
  productList.innerHTML = "Loading products...";

  const { data, error } = await supabaseClient
    .from("uploads")
    .select("id, firstname, category, description, image_url")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    productList.innerHTML = `<p style="color:red">Error loading products: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    productList.innerHTML = `<p>No products uploaded yet.</p>`;
    return;
  }

  productList.innerHTML = data
    .map(
      (item) => `
    <div class="product-card" data-id="${item.id}">
      <img src="${item.image_url}" alt="${item.firstname}" style="max-width:80px;border-radius:4px;">
      <div>
        <h4>${item.firstname}</h4>
        <p><b>${item.category}</b></p>
        <p>${item.description}</p>
      </div>
      <button class="delete-btn" data-id="${item.id}" 
        style="background:red;color:white;padding:5px 10px;border:none;border-radius:4px;cursor:pointer;">
        Delete
      </button>
    </div>
  `
    )
    .join("");

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
  });
}

// 🆕 Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const { error } = await supabaseClient.from("uploads").delete().eq("id", id);

  if (error) {
    alert("❌ Delete failed: " + error.message);
    return;
  }
  alert("✅ Product deleted");
  loadProducts();
}

// ✅ Handle login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        loginStatus.style.display = "block";
        loginStatus.textContent = "❌ Login failed: " + error.message;
        return;
      }

      if (data?.user?.email && ADMIN_EMAILS.includes(data.user.email.trim().toLowerCase())) {
        loginStatus.style.display = "block";
        loginStatus.textContent = "✅ Logged in as Admin";
        if (loginScreen && uploadSection) {
          loginScreen.style.display = "none";
          uploadSection.style.display = "block";
        }
        loadProducts(); // Load products on successful login
      } else {
        loginStatus.style.display = "block";
        loginStatus.textContent = "⚠️ You are not authorized as Admin.";
      }
    } catch (err) {
      console.error(err);
      loginStatus.style.display = "block";
      loginStatus.textContent = "❌ Unexpected error: " + err.message;
    }
  });
}

// ✅ Handle product upload
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("firstname")?.value.trim();
    const category = document.getElementById("category")?.value.trim();
    const description = document.getElementById("description")?.value.trim();
    const file = document.getElementById("photo")?.files[0];

    if (!firstname || !category || !description || !file) {
      if (statusEl) statusEl.textContent = "⚠️ Please fill all fields.";
      return;
    }

    try {
      const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
      if (userErr) throw userErr;

      const user = userData?.user;
      if (!user || !ADMIN_EMAILS.includes(user.email.trim().toLowerCase())) {
        throw new Error("Not authorized");
      }

      const fileName = `${Date.now()}-${file.name}`;
      const { error: storageError } = await supabaseClient.storage
        .from("photos")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: publicURL } = supabaseClient.storage
        .from("photos")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabaseClient.from("uploads").insert([
        {
          firstname,
          category,
          description,
          image_url: publicURL.publicUrl,
          user_id: user.id,
        }
      ]);

      if (insertError) throw insertError;

      if (statusEl) statusEl.textContent = "✅ Upload successful!";
      uploadForm.reset();
      loadProducts(); // Refresh product list
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = "❌ Upload failed: " + err.message;
    }
  });
}

// ✅ Mobile menu
function initMobileMenu() {
  const navOverlay = document.getElementById("navOverlay");
  const setExpanded = (btns, expanded) => {
    btns.forEach((b) => b.setAttribute("aria-expanded", expanded ? "true" : "false"));
  };
  const closeAnyMenu = () => {
    document.querySelectorAll(".nav-menu.open").forEach(m => m.classList.remove("open"));
    if (navOverlay) navOverlay.classList.remove("open");
    setExpanded(document.querySelectorAll("#menuToggle, .hamburger"), false);
    document.body.classList.remove("drawer-open");
  };
  const openForButton = (btn) => {
    const navbar = btn.closest(".navbar");
    const menu = navbar ? navbar.querySelector(".nav-menu") : document.querySelector(".nav-menu");
    if (!menu) return;
    const isOpen = menu.classList.contains("open");
    closeAnyMenu();
    if (!isOpen) {
      menu.classList.add("open");
      if (navOverlay) navOverlay.classList.add("open");
      setExpanded([btn], true);
      document.body.classList.add("drawer-open");
    }
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#menuToggle, .hamburger");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      openForButton(btn);
      return;
    }
    if (!e.target.closest(".nav-menu")) {
      closeAnyMenu();
    }
  });
  document.querySelectorAll("#menuToggle, .hamburger").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openForButton(btn); });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); e.stopPropagation(); openForButton(btn); }, { passive: false });
  });
  if (navOverlay) {
    navOverlay.addEventListener("click", closeAnyMenu);
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAnyMenu(); });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();

  const modal = document.getElementById("enquiryModal");
  const chatBtn = document.querySelector(".chat-btn");
  const closeBtn = document.querySelector(".close-btn");
  const enquiryForm = document.getElementById("enquiryForm");

  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  if (enquiryForm) {
    enquiryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(enquiryForm);

      try {
        const response = await fetch(enquiryForm.action, {
          method: enquiryForm.method,
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          alert("✅ Thank you! Your enquiry has been sent.");
          enquiryForm.reset();
          modal.style.display = "none";
        } else {
          alert("❌ There was a problem sending your enquiry.");
        }
      } catch (err) {
        alert("⚠️ Error: " + err.message);
      }
    });
  }
});

// 🆕 Function to attach Formspree to product forms
function attachProductEnquiryHandlers() {
  const productForms = document.querySelectorAll(".product-enquiry-form");
  productForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          alert("✅ Thank you! Your product enquiry has been sent.");
          form.reset();
        } else {
          alert("❌ There was a problem sending your enquiry.");
        }
      } catch (err) {
        alert("⚠️ Error: " + err.message);
      }
    });
  });
}

// Load preview products
async function loadHomeProducts() {
  const { data, error } = await supabaseClient
    .from("uploads")
    .select("id, firstname, category, image_url")
    .limit(6)
    .order("id", { ascending: false });

  const homeContainer = document.getElementById("home-products");
  if (data && data.length > 0) {
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="${item.image_url}" alt="${item.firstname}">
        <h4>${item.firstname}</h4>
        <p class="home-category"><em class="category">${item.category || ""}</em></p>
      `;
      div.addEventListener("click", () => {
        window.location.href = `product-details.html?id=${item.id}`;
      });
      homeContainer.appendChild(div);
    });
  }
}
loadHomeProducts();

// Search popup
const searchInput = document.getElementById("search-input");
const searchPopup = document.getElementById("search-popup");

searchInput.addEventListener("input", async function () {
  const query = this.value.trim().toLowerCase();
  if (!query) {
    searchPopup.style.display = "none";
    return;
  }

  const { data, error } = await supabaseClient
    .from("uploads")
    .select("id, firstname, image_url")
    .ilike("firstname", `%${query}%`)
    .limit(5);

  if (error || !data || data.length === 0) {
    searchPopup.innerHTML = "<div>No results found</div>";
    searchPopup.style.display = "block";
    return;
  }

  searchPopup.innerHTML = "";
  data.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${item.image_url}" alt="${item.firstname}">
      <span>${item.firstname}</span>
    `;
    div.addEventListener("click", () => {
      showProductCard(item);
    });
    searchPopup.appendChild(div);
  });
  searchPopup.style.display = "block";
});

function showProductCard(item) {
  searchPopup.style.display = "none";
  window.location.href = `product-details.html?id=${item.id}`;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-bar") && !e.target.closest("#search-popup")) {
    searchPopup.style.display = "none";
  }
});

let slideIndex = 0;
function showSlide(n) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;

  slides.forEach((s, i) => {
    s.classList.remove("active");
    s.style.display = i === slideIndex ? "block" : "none";
  });
  dots.forEach(d => d.classList.remove("active"));

  slides[slideIndex].style.display = "block";
  slides[slideIndex].classList.add("active");
  dots[slideIndex].classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  if (slides.length) {
    slides.forEach((s, i) => (s.style.display = i === 0 ? "block" : "none"));
    if (dots.length) {
      dots.forEach((d, i) => d.onclick = () => { slideIndex = i; showSlide(slideIndex); });
    }
    showSlide(slideIndex);
    setInterval(() => { slideIndex++; showSlide(slideIndex); }, 3000);
  }
});

function currentSlide(n) {
  slideIndex = n - 1;
  showSlide(slideIndex);
}
