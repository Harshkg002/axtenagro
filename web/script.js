<<<<<<< HEAD
// --- Supabase Init ---
const supabaseClient = supabase.createClient(
    "https://lvpyferhoytfcemdlvix.supabase.co",   // replace
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU"                          // replace
  );
  
  // --- Load Products ---
  async function loadHomeProducts() {
    console.log("Loading home products...");
    const { data, error } = await supabaseClient
      .from("uploads")
      .select("firstname, image_url")
      .order("id", { ascending: false })
      .limit(4);
  
    const container = document.getElementById("home-products");
  
    if (error) {
      console.error(error);
      container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
      return;
    }
    if (!data || data.length === 0) {
      container.innerHTML = `<p>No products found.</p>`;
      return;
    }
  
    container.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="${item.image_url}" alt="${item.firstname}">
        <h4>${item.firstname}</h4>
      `;
      container.appendChild(div);
    });
  }
  
  // --- Slider ---
  document.addEventListener("DOMContentLoaded", () => {
    loadHomeProducts();
  
    let index = 0;
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
  
    function showSlide(i) {
      slides.forEach((s, idx) => {
        s.style.display = idx === i ? "block" : "none";
        s.classList.toggle("active", idx === i);
        dots[idx].classList.toggle("active", idx === i);
      });
    }
    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }
    dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));
    setInterval(nextSlide, 3000);
    showSlide(0);
  
    // --- Search bar ---
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    function performSearch() {
      const q = searchInput.value.trim();
      if (!q) return alert("Please type something!");
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", e => { if (e.key === "Enter") performSearch(); });
  
    // --- Chat button ---
    document.querySelector(".chat-btn").addEventListener("click", () => window.location.href = "contact.html");
    document.querySelector(".chat-text").addEventListener("click", () => window.location.href = "contact.html");
  });
  
=======
const { createClient } = supabase;

// 🔑 Supabase credentials
const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 👤 Admin email
const ADMIN_EMAIL = "akshsaini48@gmail.com";

// DOM elements
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const uploadForm = document.getElementById("uploadForm");
const statusEl = document.getElementById("status");
const loginScreen = document.getElementById("loginScreen");
const uploadSection = document.getElementById("uploadSection");

// ✅ Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginStatus.style.display="block";
    loginStatus.textContent = "❌ Login failed: " + error.message;
  } else {
    if (data.user.email === ADMIN_EMAIL) {
      loginStatus.style.display="block";  
      loginStatus.textContent = "✅ Logged in as Admin";
      
      // 🔥 Toggle visibility
      loginScreen.style.display = "none";
      uploadSection.style.display = "block";
    } else {
      loginStatus.style.display="block";  
      loginStatus.textContent = "⚠️ You are not authorized as Admin.";
    }
  }
});

// ✅ Handle upload
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstname = document.getElementById("firstname").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const file = document.getElementById("photo").files[0];

  if (!firstname || !category || !description || !file) {
    statusEl.textContent = "⚠️ Please fill all fields.";
    return;
  }

  try {
    const userResp = await supabaseClient.auth.getUser();
    const user = userResp.data.user;
    if (!user || user.email !== ADMIN_EMAIL) throw new Error("Not authorized");

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
      },
    ]);

    if (insertError) throw insertError;

    statusEl.textContent = "✅ Upload successful!";
    uploadForm.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Upload failed: " + err.message;
  }
});
>>>>>>> ddef7610b19e22aa6dc70522a5e0b65bfa2d4680
