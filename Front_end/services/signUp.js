//=========== SIGN-UP FORM FUNCTIONALITY ===========

// Get form elements
const signUpForm = document.getElementById('signUpForm');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// API Base URL
const API_URL = 'http://localhost:3000/api';

// ========== PASSWORD TOGGLE ==========
const passwordInput = document.getElementById('password');
const togglePasswordIcon = document.getElementById('togglePassword');

togglePasswordIcon.addEventListener('click', () => {
    const icon = togglePasswordIcon.querySelector('i');
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

const confirmPasswordInput = document.getElementById('confirmPassword');
const toggleConfirmPasswordIcon = document.getElementById('toggleConfirmPassword');

toggleConfirmPasswordIcon.addEventListener('click', () => {
    const icon = toggleConfirmPasswordIcon.querySelector('i');
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        confirmPasswordInput.type = 'password';
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
    document.getElementById('confirmPasswordError').textContent = '';
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

// ========== FORM SUBMISSION ==========
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const address = document.getElementById('address')?.value.trim() || null;
    const phone = document.getElementById('phone')?.value.trim() || null;

    let isValid = true;

    // ========== VALIDACIONES CLIENTE ==========
    if (!username) {
        showError('usernameError', 'El username es requerido');
        isValid = false;
    } else if (username.length < 3) {
        showError('usernameError', 'El username debe tener mínimo 3 caracteres');
        isValid = false;
    }

    if (!validateEmail(email)) {
        showError('emailError', 'Por favor ingresa un email válido');
        isValid = false;
    }

    if (!validatePassword(password)) {
        showError('passwordError', 'La contraseña debe tener mínimo 6 caracteres');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Las contraseñas no coinciden');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // ========== PETICIÓN AL BACKEND ==========
    const signUpBtn = signUpForm.querySelector('button[type="submit"]');
    signUpBtn.disabled = true;
    signUpBtn.textContent = 'Registrando...';

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                address: address,
                phone: phone
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // ========== GUARDAR DATOS ==========
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            showToast('¡Registro exitoso! Redirigiendo...', 'success');
            signUpForm.reset();

            // Redirigir a inicio después de 2 segundos
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);
        } else {
            // ========== MANEJAR ERRORES DEL BACKEND ==========
            showToast(data.message || 'Error en el registro. Intenta de nuevo.', 'error');

            // Mostrar errores específicos
            if (data.message && data.message.includes('username')) {
                showError('usernameError', data.message);
            } else if (data.message && data.message.includes('email')) {
                showError('emailError', data.message);
            } else if (data.message && data.message.includes('contraseña')) {
                showError('passwordError', data.message);
            }
        }
    } catch (error) {
        console.error('Error de registro:', error);
        showToast('Error de conexión. Verifique su conexión a internet.', 'error');
    } finally {
        // ========== RE-HABILITAR BOTÓN ==========
        signUpBtn.disabled = false;
        signUpBtn.textContent = 'Sign Up';
    }
});