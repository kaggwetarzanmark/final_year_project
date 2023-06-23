// logout.js

function handleLogout() {
    const logoutButton = document.getElementById("logout-button");
  
    logoutButton.addEventListener("click", () => {
      fetch("/logout", {
        method: "GET",
        credentials: "same-origin" // Include cookies in the request
      })
        .then(response => {
          if (response.ok) {
            // Logout successful, clear session-related information on the client-side
            // For example, you can clear any stored tokens, user data, or update the UI
            // Redirect the user to the login page
            window.location.href = "/";
          } else {
            // Handle logout error
            console.error("Logout failed with status:", response.status);
            // Optionally, display an error message to the user
          }
        })
        .catch(error => {
          // Handle network or fetch error
          console.error("Logout failed with error:", error);
          // Optionally, display an error message to the user
        });
    });
  }
  
  // Call the function when the page is loaded
  window.addEventListener("load", handleLogout);
  