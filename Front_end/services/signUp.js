//=========== SIGN-UP FORM FUNCTIONALITY ===========

// Get form elements
const signUpForm = document.getElementById('signUpForm');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

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
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let isValid = true;

    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email or username.');
        isValid = false;
    }

    if (!validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters long.');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match.');
        isValid = false;
    }

    if (isValid) {
        // Here you would typically send the data to the server
        showToast('Sign-up successful!', 'success');
        signUpForm.reset();
    } else {
        showToast('Please fix the errors in the form.', 'error');
    }
});