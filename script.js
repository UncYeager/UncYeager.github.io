// Password protection
const ADMIN_PASSWORD = "test22194"; // Change this to your real password

// Admin toggle function
function toggleAdmin() {
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("adminToggle").style.display = "none";
  }
}

// Initialize admin button
document.getElementById("adminToggle").style.display = "block";
document.getElementById("adminToggle").onclick = toggleAdmin;

// Helper function to convert image to base64
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Post creation function (with image support)
document.getElementById("addPost").onclick = async function() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const imageFile = document.getElementById("postImage").files[0];

  if (title && content) {
    let imageHTML = "";
    
    // If image is uploaded
    if (imageFile) {
      try {
        const imageBase64 = await getBase64(imageFile);
        imageHTML = `<img src="${imageBase64}" style="max-width: 100%; border-radius: 5px; margin: 10px 0;">`;
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }

    const newPost = document.createElement("div");
    newPost.className = "blog-post";
    newPost.innerHTML = `
      <div class="blog-title">${title}</div>
      <div class="blog-date">Posted on: ${new Date().toLocaleDateString()}</div>
      ${imageHTML}
      <div class="blog-content"><p>${content.replace(/\n/g, '</p><p>')}</p></div>
    `;

    // Insert new post at the top
    const contentDiv = document.querySelector(".content");
    const firstPost = contentDiv.querySelector(".blog-post");
    contentDiv.insertBefore(newPost, firstPost);
    
    // Clear form
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    
    alert("Post published!");
  } else {
    alert("Please fill in both title and content!");
  }
};
