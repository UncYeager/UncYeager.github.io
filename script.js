<!-- Load Firebase SDKs FIRST -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>

<script>
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAf5WOJQex9gkbu4D4-FByRd80oV1CyHxQ",
    authDomain: "myblog-b5fc3.firebaseapp.com",
    projectId: "myblog-b5fc3",
    storageBucket: "myblog-b5fc3.appspot.com",
    messagingSenderId: "20036951841",
    appId: "1:20036951841:web:f088d57c590b872147a860"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Password protection
  const ADMIN_PASSWORD = "test22194"; // Change to a strong password!
  
  // Image to Base64 converter
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Render a single post
  function renderPost(post) {
    const postsContainer = document.querySelector(".content");
    const firstPost = document.querySelector(".blog-post");
    
    const newPost = document.createElement("div");
    newPost.className = "blog-post";
    newPost.innerHTML = `
      <div class="blog-title">${post.title}</div>
      <div class="blog-date">Posted on: ${new Date(post.timestamp?.toDate() || post.timestamp).toLocaleDateString()}</div>
      ${post.image || ''}
      <div class="blog-content"><p>${post.content.replace(/\n/g, '</p><p>')}</p></div>
    `;
    
    postsContainer.insertBefore(newPost, firstPost);
  }

  // Load all posts when page loads
  async function loadPosts() {
    try {
      console.log("[DEBUG] Loading posts...");
      
      // Clear existing posts (except template)
      document.querySelectorAll('.blog-post:not(.template)').forEach(el => el.remove());
      
      const querySnapshot = await db.collection("posts")
        .orderBy("timestamp", "desc")
        .get();

      console.log(`[DEBUG] Found ${querySnapshot.size} posts`);
      
      querySnapshot.forEach((doc) => {
        console.log(`[DEBUG] Rendering post ${doc.id}`);
        renderPost(doc.data());
      });
    } catch (error) {
      console.error("[ERROR] Load error:", error);
      alert("Error loading posts. Check console.");
    }
  }

  // Create new post
  document.getElementById("addPost").onclick = async function() {
    const btn = this;
    
    try {
      // Validate input
      const title = document.getElementById("postTitle").value.trim();
      const content = document.getElementById("postContent").value.trim();
      
      if (!title || !content) {
        alert("Title and content are required!");
        return;
      }

      // Password check
      const password = prompt("Enter admin password:");
      if (password !== ADMIN_PASSWORD) {
        alert("Authentication failed!");
        return;
      }

      // Process image
      let imageBase64 = "";
      const imageFile = document.getElementById("postImage").files[0];
      
      if (imageFile) {
        if (imageFile.size > 2 * 1024 * 1024) {
          alert("Image too large! Max 2MB allowed.");
          return;
        }
        if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
          alert("Only JPG/PNG images allowed!");
          return;
        }
        imageBase64 = await getBase64(imageFile);
      }

      // Save to Firestore
      btn.disabled = true;
      btn.textContent = "Publishing...";
      
      const docRef = await db.collection("posts").add({
        title,
        content,
        image: imageBase64 ? `<img src="${imageBase64}" alt="Blog image">` : "",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("[SUCCESS] Post saved with ID:", docRef.id);
      
      // Reset form and reload
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      document.getElementById("postImage").value = "";
      
      await loadPosts();
      alert("Post published!");
      
    } catch (error) {
      console.error("[ERROR] Save failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = "Publish";
    }
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    console.log("[INIT] Page loaded");
    document.getElementById("adminToggle").style.display = "block";
    loadPosts();
    
    // Test connection
    db.collection("test").doc("test").get()
      .then(() => console.log("[CONNECTION] Firestore working"))
      .catch(e => console.error("[CONNECTION] Firestore error:", e));
  });
</script>
