// ========================================
// FITTRACK — Login
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Simple mock authentication
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Setup simple logic for button state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Simulate network request delay
            setTimeout(() => {
                // Set mock auth token
                localStorage.setItem('isAuthenticated', 'true');
                // Redirect to dashboard
                window.location.href = 'index.html';
            }, 800);
        });
    }

    // Toggle logic for signup purely for visual completeness
    const signupLink = document.querySelector('.signup-link');
    const authHeaderTitle = document.querySelector('.auth-header h2');
    const authHeaderSub = document.querySelector('.auth-header p');
    const authSubmitText = document.querySelector('.btn-auth');
    const authFooterText = document.querySelector('.auth-footer p');
    
    let isSignup = false;

    if (signupLink) {
        authFooterText.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('signup-link')) {
                e.preventDefault();
                isSignup = !isSignup;
                
                if (isSignup) {
                    authHeaderTitle.textContent = 'Create Account';
                    authHeaderSub.textContent = 'Start your fitness journey today';
                    authSubmitText.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
                    authFooterText.innerHTML = 'Already have an account? <a href="#" class="signup-link">Sign in</a>';
                } else {
                    authHeaderTitle.textContent = 'Welcome Back';
                    authHeaderSub.textContent = 'Sign in to continue your fitness journey';
                    authSubmitText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                    authFooterText.innerHTML = 'Don\'t have an account? <a href="#" class="signup-link">Create one</a>';
                }
            }
        });
    }

    // Redirect if already logged in
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'index.html';
    }
});
