// Password protection (replace "YOUR_PASSWORD" with a real password)
const ADMIN_PASSWORD = "dragon123"; // Example password

function toggleAdmin() {
  const password = prompt("Enter admin password:");
  if (password === ADMIN_PASSWORD) {
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("adminToggle").style.display = "none";
  }
}

// Add this to your existing script.js or create new
document.getElementById("adminToggle").style.display = "block"; // Show admin button
document.getElementById("adminToggle").onclick = toggleAdmin;

// Post creation function
document.getElementById("addPost").onclick = function() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  
  if (title && content) {
    const newPost = document.createElement("div");
    newPost.className = "blog-post";
    newPost.innerHTML = `
      <div class="blog-title">${title}</div>
      <div class="blog-date">Posted on: ${new Date().toLocaleDateString()}</div>
      <div class="blog-content"><p>${content.replace(/\n/g, '</p><p>')}</p></div>
    `;
    
    document.querySelector(".content").insertBefore(newPost, document.querySelector(".blog-post"));
    alert("Post published!");
  }
};
