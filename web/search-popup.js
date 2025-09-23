// --- search-popup.js ---
// Shared search popup logic for all pages

const { createClient } = supabase;
const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchPopup = document.getElementById("search-popup");

  if (!searchInput || !searchPopup) return;

  searchInput.addEventListener("input", async function () {
    const q = this.value.trim().toLowerCase();
    if (!q) {
      searchPopup.style.display = "none";
      return;
    }

    const { data, error } = await supabaseClient
      .from("uploads")
      .select("id, firstname, image_url")
      .ilike("firstname", `%${q}%`)
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
        window.location.href = `product-details.html?id=${item.id}`;
      });
      searchPopup.appendChild(div);
    });
    searchPopup.style.display = "block";
  });

  // Close popup if click outside
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-bar") && !e.target.closest("#search-popup")) {
      searchPopup.style.display = "none";
    }
  });
});
