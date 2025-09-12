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
