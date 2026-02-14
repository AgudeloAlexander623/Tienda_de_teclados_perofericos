// ========== LOGIN FORM FUNCTIONALITY ==========

// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');
const googleBtn = document.getElementById('googleBtn');
const githubBtn = document.getElementById('githubBtn');

// API Base URL
const API_URL = 'http://localhost:3000/api';

// ========== PASSWORD VISIBILITY TOGGLE ==========
togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const icon = togglePasswordBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// ========== FORM VALIDATION ==========
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || email.length >= 3; // Allow username or email
}

function validatePassword(password) {
    return password.length >= 6;
}

function clearErrors() {
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
}

function showError(fieldId, message) {
    document.getElementById(fieldId).textContent = message;
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'error') {
    toastMessage.textContent = message;
    toastNotification.className = `toast-notification show ${type}`;
    
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 4000);
}

// ========== LOCAL STORAGE MANAGEMENT ==========
function saveLoginData(email, rememberMe) {
    if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
    }
}

function loadSavedEmail() {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedEmail && rememberMe === 'true') {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
}

// ========== LOGIN REQUEST ==========
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Client-side validation
    let isValid = true;
    
    if (!email) {
        showError('emailError', 'Email or username is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email or username');
        isValid = false;
    }
    
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Disable button during request
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';
    
    try {
        // ========== PETICIÓN AL BACKEND ==========
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // ========== GUARDAR DATOS ==========
            // Guardar email si "Recuérdame" está activo
            saveLoginData(email, rememberMeCheckbox.checked);
            
            // Guardar token JWT
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            showToast('¡Login exitoso! Redirigiendo...', 'success');
            
            // Redirigir a inicio después de 1.5 segundos
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            // ========== MANEJAR ERRORES DEL BACKEND ==========
            showToast(data.message || 'Error en el login. Intenta de nuevo.', 'error');
            
            // Mostrar errores específicos si existen
            if (data.message && data.message.includes('Email')) {
                showError('emailError', data.message);
            } else if (data.message && data.message.includes('contraseña')) {
                showError('passwordError', data.message);
            }
        }
    } catch (error) {
        console.error('Error de login:', error);
        showToast('Error de conexión. Verifique su conexión a internet.', 'error');
    } finally {
        // ========== RE-HABILITAR BOTÓN ==========
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

// ========== FORM SUBMISSION ==========
loginForm.addEventListener('submit', handleLogin);

// ========== REAL-TIME VALIDATION ==========
emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !validateEmail(email)) {
        showError('emailError', 'Please enter a valid email or username');
    } else {
        document.getElementById('emailError').textContent = '';
    }
});

passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;
    if (password && !validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters');
    } else {
        document.getElementById('passwordError').textContent = '';
    }
});

// Clear errors on input
emailInput.addEventListener('input', () => {
    document.getElementById('emailError').textContent = '';
});

passwordInput.addEventListener('input', () => {
    document.getElementById('passwordError').textContent = '';
});

// ========== SOCIAL LOGIN HANDLERS ==========
googleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Google login will be implemented soon!', 'error');
    // TODO: Implement Google OAuth
});

githubBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('GitHub login will be implemented soon!', 'error');
    // TODO: Implement GitHub OAuth
});

// ========== LOAD SAVED DATA ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    loadSavedEmail();
});
