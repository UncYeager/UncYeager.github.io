<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
<script>
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyAf5WOJQex9gkbu4D4-FByRd80oV1CyHxQ",

  authDomain: "myblog-b5fc3.firebaseapp.com",

  projectId: "myblog-b5fc3",

  storageBucket: "myblog-b5fc3.firebasestorage.app",

  messagingSenderId: "20036951841",

  appId: "1:20036951841:web:f088d57c590b872147a860",

  measurementId: "G-MN5XDTP5HJ"

};
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Password protection
  const ADMIN_PASSWORD = "test22194"; // Change to a strong password!
  document.getElementById("adminToggle").style.display = "block";
  
  document.getElementById("adminToggle").onclick = function() {
    const password = prompt("Enter admin password:");
    if (password === ADMIN_PASSWORD) {
      document.getElementById("adminPanel").style.display = "block";
      this.style.display = "none";
    } else {
      alert("Incorrect password!");
    }
  };

  // Image to Base64 converter
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Load all posts when page loads
  document.addEventListener('DOMContentLoaded', loadPosts);

  async function loadPosts() {
    try {
      // Clear existing posts (keep only template posts)
      const postsContainer = document.querySelector(".content");
      document.querySelectorAll('.blog-post:not(.template)').forEach(el => el.remove());
      
      const querySnapshot = await db.collection("posts")
        .orderBy("timestamp", "desc")
        .get();
        
      querySnapshot.forEach((doc) => {
        renderPost(doc.data());
      });
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("Error loading posts. Check console for details.");
    }
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

  // Create new post
  document.getElementById("addPost").onclick = async function() {
    const password = prompt("Enter admin password to confirm:");
    if (password !== ADMIN_PASSWORD) {
      alert("Authentication failed!");
      return;
    }
    
    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();
    const imageFile = document.getElementById("postImage").files[0];
    
    if (!title || !content) {
      alert("Title and content are required!");
      return;
    }
    
    let imageBase64 = "";
    if (imageFile) {
      // Basic image validation
      if (imageFile.size > 2 * 1024 * 1024) {
        alert("Image too large! Max 2MB allowed.");
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(imageFile.type)) {
        alert("Only JPG/PNG images allowed!");
        return;
      }
      
      try {
        imageBase64 = await getBase64(imageFile);
      } catch (error) {
        console.error("Image error:", error);
        alert("Failed to process image!");
        return;
      }
    }
    
    const btn = this;
    try {
      // Show loading state
      btn.disabled = true;
      btn.textContent = "Publishing...";
      
      await db.collection("posts").add({
        title,
        content,
        image: imageBase64 ? `<img src="${imageBase64}" alt="Blog image" style="max-width:100%; border-radius:5px; margin:10px 0;">` : "",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Clear form
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      document.getElementById("postImage").value = "";
      
      // Reload posts
      await loadPosts();
      
      alert("Post published successfully!");
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to save post: " + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Publish";
    }
  };
</script>
