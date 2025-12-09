// Authentication System
document.addEventListener('DOMContentLoaded', function () {
    // ============ DOM Elements ============
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormEl = document.getElementById('loginFormEl');
    const signupFormEl = document.getElementById('signupFormEl');
    const toSignupBtn = document.getElementById('toSignup');
    const toLoginBtn = document.getElementById('toLogin');

    // Login form elements
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginEmailError = document.getElementById('loginEmailError');
    const loginPasswordError = document.getElementById('loginPasswordError');
    const loginPasswordToggle = document.getElementById('loginPasswordToggle');

    // Signup form elements
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirm = document.getElementById('signupConfirm');
    const signupNameError = document.getElementById('signupNameError');
    const signupEmailError = document.getElementById('signupEmailError');
    const signupPasswordError = document.getElementById('signupPasswordError');
    const signupConfirmError = document.getElementById('signupConfirmError');
    const signupPasswordToggle = document.getElementById('signupPasswordToggle');
    const signupConfirmToggle = document.getElementById('signupConfirmToggle');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    // ============ Validation Rules ============
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

    function validateEmail(email) {
        return EMAIL_REGEX.test(email);
    }

    function validatePassword(password) {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        return PASSWORD_REGEX.test(password);
    }

    function getPasswordStrength(password) {
        if (password.length < 8) return 'weak';
        if (password.length < 12) return 'fair';
        return 'strong';
    }

    // ============ Display Error Messages ============
    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }

    function clearError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }

    // ============ Password Visibility Toggle ============
    function setupPasswordToggle(toggleBtn, inputEl) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const isPassword = inputEl.type === 'password';
            inputEl.type = isPassword ? 'text' : 'password';
            toggleBtn.textContent = isPassword ? '🙈' : '👁️';
            toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        });
    }

    setupPasswordToggle(loginPasswordToggle, loginPassword);
    setupPasswordToggle(signupPasswordToggle, signupPassword);
    setupPasswordToggle(signupConfirmToggle, signupConfirm);

    // ============ Password Strength Indicator ============
    signupPassword.addEventListener('input', function () {
        const strength = getPasswordStrength(this.value);
        const isValid = validatePassword(this.value);

        if (this.value.length === 0) {
            passwordStrength.classList.remove('visible');
            return;
        }

        passwordStrength.classList.add('visible');
        strengthFill.className = 'strength-fill';

        switch (strength) {
            case 'weak':
                strengthFill.classList.add('weak');
                strengthText.textContent = 'Password strength: Weak';
                break;
            case 'fair':
                strengthFill.classList.add('fair');
                strengthText.textContent = isValid ? 'Password strength: Strong' : 'Password strength: Fair';
                break;
            case 'strong':
                strengthFill.classList.add('strong');
                strengthText.textContent = 'Password strength: Strong';
                break;
        }
    });

    // ============ Real-time Login Validation ============
    loginEmail.addEventListener('blur', function () {
        if (this.value && !validateEmail(this.value)) {
            showError(loginEmailError, 'Please enter a valid email address');
        } else {
            clearError(loginEmailError);
        }
    });

    loginPassword.addEventListener('blur', function () {
        if (this.value && this.value.length < 1) {
            showError(loginPasswordError, 'Password is required');
        } else {
            clearError(loginPasswordError);
        }
    });

    // ============ Real-time Signup Validation ============
    signupName.addEventListener('blur', function () {
        if (this.value.trim().length < 2) {
            showError(signupNameError, 'Name must be at least 2 characters');
        } else {
            clearError(signupNameError);
        }
    });

    signupEmail.addEventListener('blur', function () {
        if (this.value && !validateEmail(this.value)) {
            showError(signupEmailError, 'Please enter a valid email address');
        } else {
            clearError(signupEmailError);
        }
    });

    signupPassword.addEventListener('blur', function () {
        if (this.value && !validatePassword(this.value)) {
            showError(signupPasswordError, 'Password must be at least 8 characters with uppercase, lowercase, and a number');
        } else {
            clearError(signupPasswordError);
        }
    });

    signupConfirm.addEventListener('blur', function () {
        if (this.value && this.value !== signupPassword.value) {
            showError(signupConfirmError, 'Passwords do not match');
        } else if (this.value === '') {
            showError(signupConfirmError, 'Please confirm your password');
        } else {
            clearError(signupConfirmError);
        }
    });

    // ============ Form Submission - Login ============
    loginFormEl.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        let isValid = true;

        // Validate email
        if (!email) {
            showError(loginEmailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(loginEmailError, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(loginEmailError);
        }

        // Validate password
        if (!password) {
            showError(loginPasswordError, 'Password is required');
            isValid = false;
        } else {
            clearError(loginPasswordError);
        }

        if (isValid) {
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);

            if (!user) {
                showError(loginEmailError, 'No account found with this email');
                return;
            }

            if (user.password !== password) {
                showError(loginPasswordError, 'Incorrect password');
                return;
            }

            // Successful login
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            }));

            alert(`Welcome back, ${user.name}!`);
            window.location.href = 'index.html';
        }
    });

    // ============ Form Submission - Signup ============
    signupFormEl.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = signupName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        const confirmPassword = signupConfirm.value;

        let isValid = true;

        // Validate name
        if (!name || name.length < 2) {
            showError(signupNameError, 'Name must be at least 2 characters');
            isValid = false;
        } else {
            clearError(signupNameError);
        }

        // Validate email
        if (!email) {
            showError(signupEmailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(signupEmailError, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(signupEmailError);
        }

        // Validate password
        if (!password) {
            showError(signupPasswordError, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(signupPasswordError, 'Password must be at least 8 characters with uppercase, lowercase, and a number');
            isValid = false;
        } else {
            clearError(signupPasswordError);
        }

        // Validate confirm password
        if (!confirmPassword) {
            showError(signupConfirmError, 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError(signupConfirmError, 'Passwords do not match');
            isValid = false;
        } else {
            clearError(signupConfirmError);
        }

        if (isValid) {
            // Check if email already exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                showError(signupEmailError, 'An account with this email already exists');
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Auto-login
            localStorage.setItem('currentUser', JSON.stringify({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }));

            alert(`Account created successfully, ${name}!`);
            window.location.href = 'index.html';
        }
    });

    // ============ Form Switching ============
    toSignupBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        setTimeout(() => {
            loginForm.classList.remove('active', 'hidden');
            signupForm.classList.add('active');
        }, 150);
    });

    toLoginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        signupForm.classList.add('hidden');
        setTimeout(() => {
            signupForm.classList.remove('active', 'hidden');
            loginForm.classList.add('active');
        }, 150);
    });

    // ============ Mobile Navigation ============
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');

    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function (e) {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            mainNav.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!mainNav.classList.contains('open')) return;
            const target = e.target;
            if (!mainNav.contains(target) && !hamburger.contains(target)) {
                mainNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============ Update Cart Badge with Current User (if needed) ============
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const count = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartBadge.textContent = count;
        } catch (e) {
            cartBadge.textContent = '0';
        }
    }
});
