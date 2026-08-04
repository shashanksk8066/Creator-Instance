// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_gRIKX3rJDb5kqRlMs4uc-cBIf-HD5aA",
    authDomain: "master-d2e36.firebaseapp.com",
    databaseURL: "https://master-d2e36-default-rtdb.firebaseio.com",
    projectId: "master-d2e36",
    storageBucket: "master-d2e36.appspot.com",
    messagingSenderId: "287194115395",
    appId: "1:287194115395:android:471ba7bd6b16f46cc793f6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Check Session & Access Restrictions
function checkAdminSession() {
    auth.onAuthStateChanged(user => {
        const isLoginPage = window.location.pathname.endsWith('login.html');
        
        if (!user) {
            if (!isLoginPage) {
                window.location.href = 'login.html';
            }
        } else {
            // Verify if user role is Admin in Realtime Database
            if (user.email === '8197074812@gmail.com') {
                if (isLoginPage) {
                    window.location.href = 'index.html';
                }
                return;
            }

            db.ref('users').child(user.uid).child('role').once('value')
                .then(snapshot => {
                    const role = snapshot.val();
                    if (role !== 'admin') {
                        // User logged in is not an admin, logout
                        alert("Unauthorized access. Admin privileges required.");
                        auth.signOut().then(() => {
                            window.location.href = 'login.html';
                        });
                    } else if (isLoginPage) {
                        window.location.href = 'index.html';
                    }
                })
                .catch(error => {
                    console.error("Error checking role:", error);
                    if (!isLoginPage) {
                        window.location.href = 'login.html';
                    }
                });
        }
    });
}

// Global UI bindings
document.addEventListener('DOMContentLoaded', () => {
    // Run session checks
    checkAdminSession();

    // Bind navigation active class depending on pathname
    const activePath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu .nav-item a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (activePath.endsWith(href)) {
            link.parentElement.classList.add('active');
        } else {
            link.parentElement.classList.remove('active');
        }
    });

    // Bind logout button click
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch(err => {
                console.error("Signout error:", err);
            });
        });
    }
});
