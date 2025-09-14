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

// 🆕 Load and display products
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
    const price = parseFloat(document.getElementById("price")?.value.trim());
    const quantity = document.getElementById("quantity")?.value.trim();
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
          price,
          quantity,
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

// ✅ Enquiry popup + product enquiry logic
document.addEventListener("DOMContentLoaded", () => {
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

  // ✅ Popup form submission via Formspree
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
    .select("id, firstname, image_url")
    .limit(3)
    .order("id", { ascending: false });

  const homeContainer = document.getElementById("home-products");
  if (data && data.length > 0) {
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="${item.image_url}" alt="${item.firstname}">
        <h4>${item.firstname}</h4>
      `;
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
  const homeContainer = document.getElementById("home-products");
  homeContainer.innerHTML = "";

  const div = document.createElement("div");
  div.className = "product-card";
  div.innerHTML = `
    <img src="${item.image_url}" alt="${item.firstname}">
    <h4>${item.firstname}</h4>
  `;
  homeContainer.appendChild(div);

  document.querySelector(".products-preview").scrollIntoView({ behavior: "smooth" });
}

// Close popup when clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-bar") && !e.target.closest("#search-popup")) {
    searchPopup.style.display = "none";
  }
});


let slideIndex = 0;

function showSlide(n) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  // wrap around
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;

  // hide all
  slides.forEach(s => (s.style.display = "none"));
  dots.forEach(d => d.classList.remove("active"));

  // show current
  slides[slideIndex].style.display = "block";
  dots[slideIndex].classList.add("active");
}

// initialize + auto-play
document.addEventListener("DOMContentLoaded", () => {
  showSlide(slideIndex);

  setInterval(() => {
    slideIndex++;
    showSlide(slideIndex);
  }, 3000); // change every 3s
});

// when user clicks dots
function currentSlide(n) {
  slideIndex = n - 1;
  showSlide(slideIndex);
}


