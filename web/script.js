// ===========================
// Supabase Client Setup
// ===========================
const SUPABASE_URL = "https://lvpyferhoytfcemdlvix.supabase.co"; // your project URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cHlmZXJob3l0ZmNlbWRsdml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzMwOTQsImV4cCI6MjA3MjcwOTA5NH0.K-Vv9sbo3TG9CL7XPKQkQIUEx18kvGh7Vqju9oH7KEU"; // replace with your anon public key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Only these users can access the admin dashboard
const allowedAdmins = ["akshsaini1919@gmail.com", "akshsaini148@gmail.com"];

// ===========================
// Admin Login
// ===========================
document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("❌ Login error:", error.message);
    alert("❌ Login failed: " + error.message);
    return;
  }

  // Check if user is allowed
  if (!allowedAdmins.includes(email)) {
    alert("❌ You are not authorized to access the admin panel.");
    await supabase.auth.signOut();
    return;
  }

  // Show dashboard
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "block";

  console.log("✅ Logged in:", email);
});

// ===========================
// Add New Product
// ===========================
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("product-name").value;
  const category = document.getElementById("product-category").value;
  const description = document.getElementById("product-description").value;
  const fileInput = document.getElementById("product-image");
  const file = fileInput.files[0];

  if (!file) {
    alert("❌ Please select a product image.");
    return;
  }

  // ===========================
  // Upload image to Supabase Storage
  // ===========================
  const fileName = `${Date.now()}_${file.name}`;
  const { data: imageData, error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type
    });

  if (uploadError) {
    console.error("❌ Image upload failed:", uploadError);
    alert("❌ Image upload failed: " + uploadError.message);
    return;
  }

  // Get Public URL for the image
  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  console.log("✅ Image uploaded at:", imageUrl);

  // ===========================
  // Insert product into Database
  // ===========================
  const { error: dbError } = await supabase.from("products").insert([
    {
      name: name,
      category: category,
      description: description,
      image: imageUrl
    }
  ]);

  if (dbError) {
    console.error("❌ Database insert failed:", dbError);
    alert("❌ Product save failed: " + dbError.message);
    return;
  }

  alert("✅ Product added successfully!");
  document.getElementById("product-form").reset();
});

// ===========================
// Logout
// ===========================
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
  console.log("✅ Logged out");
});
