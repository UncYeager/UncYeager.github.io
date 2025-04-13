// Password protection (unchanged)
const ADMIN_PASSWORD = "test22194"; // CHANGE THIS!
document.getElementById("adminToggle").style.display = "block";
document.getElementById("adminToggle").onclick = function() {
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    document.getElementById("adminPanel").style.display = "block";
    this.style.display = "none";
  }
};

// Image to Base64 converter (unchanged)
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
    const querySnapshot = await db.collection("posts")
      .orderBy("timestamp", "desc")
      .get();
      
    querySnapshot.forEach((doc) => {
      renderPost(doc.data());
    });
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

// Render a single post
function renderPost(post) {
  const newPost = document.createElement("div");
  newPost.className = "blog-post";
  newPost.innerHTML = `
    <div class="blog-title">${post.title}</div>
    <div class="blog-date">Posted on: ${new Date(post.timestamp).toLocaleDateString()}</div>
    ${post.image || ''}
    <div class="blog-content"><p>${post.content.replace(/\n/g, '</p><p>')}</p></div>
  `;
  
  document.querySelector(".content").insertBefore(
    newPost, 
    document.querySelector(".blog-post")
  );
}

// Create new post
document.getElementById("addPost").onclick = async function() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const imageFile = document.getElementById("postImage").files[0];
  
  if (title && content) {
    let imageBase64 = "";
    
    if (imageFile) {
      try {
        imageBase64 = await getBase64(imageFile);
      } catch (error) {
        console.error("Image error:", error);
      }
    }
    
    try {
      await db.collection("posts").add({
        title,
        content,
        image: imageBase64 ? `<img src="${imageBase64}" alt="Blog image">` : "",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Clear form
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      document.getElementById("postImage").value = "";
      
      // Reload posts to show the new one
      // (We could optimize this by just adding the new post)
      document.querySelectorAll('.blog-post:not(.template)').forEach(el => el.remove());
      loadPosts();
      
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to save post. Check console for details.");
    }
  }
};
