const { createClient } = supabase;
const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

async function loadProduct(id = productId) {
  const section = document.getElementById("product-details");
  if (!id) {
    section.innerHTML = `<p style="color:red;">❌ No product ID provided.</p>`;
    return;
  }
  const { data, error } = await supabaseClient
    .from("uploads")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    section.innerHTML = `<p style="color:red;">❌ Product not found.</p>`;
    return;
  }

  section.innerHTML = `
    <div class="product-details">
      <div class="product-top">
        <img src="${data.image_url}" alt="${data.firstname}">
        <div class="product-meta">
          <h2>${data.firstname}</h2>
          <p><strong>Category:</strong> ${data.category}</p>
          <button class="enquire-btn" id="enquireBtn">Enquire Now</button>
          <button class="back-btn" id="backBtn">← Back</button>
        </div>
      </div>
      <div class="product-description">
        <p>${data.description}</p>
      </div>
    </div>
  `;

  document.getElementById("enquireBtn").addEventListener("click", () => {
    document.getElementById("enquiryModal").style.display = "block";
  });

  loadRelatedProducts(data.category, data.id);
}

document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "backBtn") {
      window.history.back(); // takes user to previous page
    }
  });
  
  

async function loadRelatedProducts(category, excludeId) {
  const { data: sameCategory } = await supabaseClient
    .from("uploads")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(5);

  const relatedList = document.querySelector(".related-list");
  relatedList.innerHTML = "";

  (sameCategory || []).forEach(item => {
    const div = document.createElement("div");
    div.className = "related-item";
    div.innerHTML = `
      <img src="${item.image_url}" alt="${item.firstname}">
      <p>${item.firstname}</p>
    `;
    div.addEventListener("click", () => loadProduct(item.id));
    relatedList.appendChild(div);
  });
}

loadProduct();

document.getElementById("closeModal").onclick = function() {
  document.getElementById("enquiryModal").style.display = "none";
};
window.onclick = function(event) {
  if (event.target == document.getElementById("enquiryModal")) {
    document.getElementById("enquiryModal").style.display = "none";
  }
};

document.getElementById("enquiryForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Your enquiry has been sent!");
  document.getElementById("enquiryModal").style.display = "none";
  this.reset();
});
