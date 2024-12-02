// Combined script for sign-up, sign-in, and form toggle functionality

document.addEventListener('DOMContentLoaded', () => {
    // Toggle between register and login forms
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
  
    if (registerBtn && loginBtn) {
      registerBtn.addEventListener('click', () => {
        container.classList.add('active');
      });
  
      loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
      });
    }
  
    // Handle sign-up functionality
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
  
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
  
          const data = await response.json();
  
          if (response.status === 201) {
            // Store JWT token in localStorage or sessionStorage
            localStorage.setItem('authToken', data.token);
            // alert('Sign-up successful! Redirecting to home page...');
            window.location.href = 'homeee.html'; // Redirect to homeee page
          } else {
            alert(data.message); // Show error message
          }
        } catch (error) {
          console.error('Error during sign-up:', error);
          alert('An error occurred. Please try again.');
        }
      });
    }
  
    // Handle sign-in functionality
    const signinForm = document.getElementById('signinForm');
    if (signinForm) {
      signinForm.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
  
        try {
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
  
          const data = await response.json();
  
          if (response.status === 200) {
            // Store JWT token in localStorage or sessionStorage
            localStorage.setItem('authToken', data.token);

            // alert('Sign-in successful! Redirecting to the home page...');
            window.location.href = 'homeee.html'; // Redirect to home page
          } else {
            alert(data.message); // Show error message
          }
        } catch (error) {
          console.error('Error during sign-in:', error);
          alert('An error occurred. Please try again.');
        }
      });
    }
  });
  