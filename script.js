// Get elements
const signUpModal = document.getElementById("signUpModal");
const openSignUp = document.getElementById("openSignUp");
const closeBtn = document.querySelector(".close");
const testModeButton = document.getElementById("testModeButton");

// Open the sign-up modal
openSignUp.addEventListener("click", (e) => {
  e.preventDefault();
  signUpModal.style.display = "flex";
});

// Close the sign-up modal
closeBtn.addEventListener("click", () => {
  signUpModal.style.display = "none";
});

// Close the modal if user clicks outside the content
window.addEventListener("click", (e) => {
  if (e.target === signUpModal) {
    signUpModal.style.display = "none";
  }
});

// Redirect to dashboard in test mode
testModeButton.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
