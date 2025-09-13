// Supabase init
const { createClient } = supabase;
const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const container = document.getElementById("products-container");
const noProducts = document.getElementById("no-products");

async function fetchProducts() {
  container.innerHTML = "<p>Loading products...</p>";

  const { data, error } = await supabaseClient
    .from("uploads")
    .select("id, firstname, category, description, image_url")
    .order("id", { ascending: false });

  if (error) {
    container.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    noProducts.style.display = "block";
    container.innerHTML = "";
    return;
  } else {
    noProducts.style.display = "none";
  }

  container.innerHTML = "";
  data.forEach(item => {
    const words = (item.description || "").split(/\s+/);
    const shortDesc = words.slice(0, 15).join(" ");
    const needsEllipsis = words.length > 15;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <a href="product-details.html?id=${item.id}">
        <img src="${item.image_url}" alt="${item.firstname}">
        <h3>${item.firstname}</h3>
        <p><em>${item.category}</em></p>
        <p class="description">${shortDesc}${needsEllipsis ? "..." : ""}</p>
        <span class="read-more">Read more</span>
      </a>
    `;
    container.appendChild(card);
  });
}

// Search filter
function initSearch() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.querySelector(".search-btn");

  function performSearch() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const cards = document.querySelectorAll(".product-card");
    let found = false;

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(q) ? "" : "none";
      if (text.includes(q)) found = true;
    });

    noProducts.style.display = found ? "none" : "block";
  }

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") performSearch();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  initSearch();
});
