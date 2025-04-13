// Firebase initialization (make sure this is at the top of your file)
const firebaseConfig = {
  apiKey: "AIzaSyAf5WOJQex9gkbu4D4-FByRd80oV1CyHxQ",
  authDomain: "myblog-b5fc3.firebaseapp.com",
  projectId: "myblog-b5fc3",
  storageBucket: "myblog-b5fc3.appspot.com",
  messagingSenderId: "20036951841",
  appId: "1:20036951841:web:f088d57c590b872147a860"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enhanced loadPosts() with debugging
async function loadPosts() {
  try {
    console.log("[DEBUG] Attempting to load posts from Firestore...");
    
    const querySnapshot = await db.collection("posts")
      .orderBy("timestamp", "desc")
      .get();

    console.log(`[DEBUG] Found ${querySnapshot.size} posts`);
    
    // Clear existing posts (except template)
    const postsContainer = document.querySelector(".content");
    document.querySelectorAll('.blog-post:not(.template)').forEach(el => el.remove());
    
    if (querySnapshot.empty) {
      console.log("[DEBUG] No posts found in Firestore");
      return;
    }

    querySnapshot.forEach((doc) => {
      console.log(`[DEBUG] Processing post ${doc.id}:`, doc.data());
      if (doc.exists) {
        renderPost(doc.data());
      } else {
        console.log("[DEBUG] Document doesn't exist:", doc.id);
      }
    });
  } catch (error) {
    console.error("[ERROR] Firestore load error:", error);
    alert("Error loading posts. Check console for details.");
  }
}

// Enhanced post creation with debugging
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

    // Process image if exists
    let imageBase64 = "";
    const imageFile = document.getElementById("postImage").files[0];
    
    if (imageFile) {
      console.log("[DEBUG] Processing image...");
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
    
    console.log("[DEBUG] Saving to Firestore...");
    const docRef = await db.collection("posts").add({
      title,
      content,
      image: imageBase64 ? `<img src="${imageBase64}" alt="Blog image">` : "",
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`[DEBUG] Post saved with ID: ${docRef.id}`);
    
    // Clear form
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    
    // Refresh posts
    await loadPosts();
    alert("Post published successfully!");
    
  } catch (error) {
    console.error("[ERROR] Post creation failed:", error);
    alert(`Failed to save post: ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "Publish";
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("[DEBUG] DOM loaded, initializing...");
  loadPosts();
});
