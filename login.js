document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form")
  const loginMessage = document.getElementById("login-message")

  // Check if user is already logged in
  if (localStorage.getItem("loggedInUser")) {
    window.location.href = "index.html"
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value

    if (!username) {
      showLoginMessage("Please enter your username", "error")
      return
    }

    // Password is "indecisive" - we accept any password
    // Store the username in localStorage
    localStorage.setItem("loggedInUser", username)

    // Show success message
    showLoginMessage("Login successful! Redirecting...", "success")

    // Redirect to the main page after a short delay
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  })

  function showLoginMessage(message, type) {
    loginMessage.textContent = message
    loginMessage.className = "login-message " + type

    // Hide the message after 3 seconds if it's an error
    if (type === "error") {
      setTimeout(() => {
        loginMessage.textContent = ""
        loginMessage.className = "login-message"
      }, 3000)
    }
  }
})

