// Admin Login Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorBox = document.getElementById('errorBox');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!email || !password) {
                showError("Email and Password fields are required.");
                return;
            }
            
            errorBox.style.display = 'none';
            
            // Sign in via Firebase Auth
            auth.signInWithEmailAndPassword(email, password)
                .then(cred => {
                    // Check if role is admin (bypass DB read for the new admin if rules block it)
                    if (cred.user.email === '8197074812@gmail.com') {
                        return { val: () => 'admin' };
                    }
                    return db.ref('users').child(cred.user.uid).child('role').once('value');
                })
                .then(snapshot => {
                    const role = typeof snapshot.val === 'function' ? snapshot.val() : snapshot;
                    if (role === 'admin') {
                        // Redirect to index dashboard
                        window.location.href = 'index.html';
                    } else {
                        // Account does not have admin permissions
                        showError("Access Denied. User account does not hold administrative role.");
                        auth.signOut();
                    }
                })
                .catch(error => {
                    console.error("Authentication Error: ", error);
                    showError(error.message || "Login failed. Verify credentials.");
                });
        });
    }

    function showError(message) {
        if (errorBox) {
            errorBox.textContent = message;
            errorBox.style.display = 'block';
        }
    }
});
