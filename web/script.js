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
  