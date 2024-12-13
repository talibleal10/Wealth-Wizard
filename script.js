
document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const signUpModal = document.getElementById("signUpModal");
  const openSignUp = document.getElementById("openSignUp");
  const closeBtn = document.querySelector(".close");
  const testModeButton = document.getElementById("testModeButton");

  // Check if elements exist to avoid errors
  if (openSignUp) {
    openSignUp.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.style.display = "flex";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      signUpModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === signUpModal) {
      signUpModal.style.display = "none";
    }
  });

  if (testModeButton) {
    testModeButton.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }
});


document.getElementById("signUpForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const income = document.getElementById("income").value || 0; // Default income to 0

  try {
      const response = await fetch("http://augwebapps.com:3812/signup.html", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName, email, password, income }),
      });

      const data = await response.json();

      if (response.ok) {
          alert(data.message); // Show success message
      } else {
          alert(data.error); // Show error message
      }
  } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
  }
});

//signing up
document.getElementById('signUpForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const income = document.getElementById('income').value;

  const data = { fullName, email, password, income };

  try {
      const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
          alert('Signup successful! Please sign in.');
          window.location.href = 'signin.html';
      } else {
          alert(result.message);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
  }
});

//signing in
document.querySelector('form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('user').value;
  const password = document.getElementById('password').value;

  const data = { email, password };

  try {
      const response = await fetch('/api/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
          alert('Signin successful!');
          // Redirect to dashboard or transactions page
          window.location.href = 'dashboard.html';
      } else {
          alert(result.message);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
  }
});
