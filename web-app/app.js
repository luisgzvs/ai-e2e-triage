/**
 * E2E Testing Playground - Application Logic
 * Implements interactive modules for E2E validation challenges.
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize all playground challenges
  initLoginChallenge();
  initDynamicLoadingChallenge();
  initRegistrationChallenge();
  initTableChallenge();

});

/**
 * Challenge 1: Login Form controller
 * Simulates authentication logic with loading states.
 */
function initLoginChallenge() {
  const loginForm = document.getElementById('login-form');
  const loginSubmit = document.getElementById('login-submit');
  const loginSpinner = loginForm.querySelector('[data-testid="login-spinner"]');
  const loginSuccessState = document.getElementById('login-success-state');
  const loginErrorMessage = document.getElementById('login-error-message');
  const logoutBtn = document.getElementById('logout-btn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  // Hardcoded test credentials
  const VALID_USER = 'admin';
  const VALID_PASS = 'admin123';

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Clear previous error and activate loading state
    loginErrorMessage.classList.add('hidden');
    loginSubmit.disabled = true;
    loginSpinner.classList.remove('hidden');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Simulate API request latency (1.5 seconds)
    setTimeout(() => {
      loginSpinner.classList.add('hidden');
      loginSubmit.disabled = false;

      if (username === VALID_USER && password === VALID_PASS) {
        loginForm.classList.add('hidden');
        loginSuccessState.classList.remove('hidden');
      } else {
        loginErrorMessage.classList.remove('hidden');
      }
    }, 1500);
  });

  logoutBtn.addEventListener('click', () => {
    loginForm.reset();
    loginSuccessState.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });
}

/**
 * Challenge 2: Dynamic Element Loading controller
 * Simulates network loading latency for async assertions in test runs.
 */
function initDynamicLoadingChallenge() {
  const triggerDynamicBtn = document.getElementById('trigger-dynamic');
  const dynamicLoaderWrapper = document.getElementById('dynamic-loader-wrapper');
  const dynamicContent = document.getElementById('dynamic-content');

  triggerDynamicBtn.addEventListener('click', () => {
    // Reset view to loading state
    dynamicContent.classList.add('hidden');
    dynamicLoaderWrapper.classList.remove('hidden');
    triggerDynamicBtn.disabled = true;

    // Simulate 3-second network loading delay
    setTimeout(() => {
      dynamicLoaderWrapper.classList.add('hidden');
      dynamicContent.classList.remove('hidden');
      triggerDynamicBtn.disabled = false;
    }, 3000);
  });
}

/**
 * Challenge 3: Registration Form controller
 * Checks input validation rules and outputs summary feedback.
 */
function initRegistrationChallenge() {
  const registerForm = document.getElementById('register-form');
  const registerSuccess = document.getElementById('register-success');
  const registerSummaryText = document.getElementById('register-summary-text');
  const resetRegisterBtn = document.getElementById('reset-register-btn');

  const emailInput = document.getElementById('reg-email');
  const roleSelect = document.getElementById('reg-role');
  const termsCheckbox = document.getElementById('reg-terms');

  const emailError = document.getElementById('email-error-text');
  const roleError = document.getElementById('role-error-text');
  const termsError = document.getElementById('terms-error-text');

  // RFC 5322 Standard email validation regex
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let isFormValid = true;

    // Validate Email field
    if (!EMAIL_REGEX.test(emailInput.value.trim())) {
      emailError.classList.remove('hidden');
      emailInput.style.borderColor = 'var(--error-color)';
      emailInput.setAttribute('aria-invalid', 'true');
      isFormValid = false;
    } else {
      emailError.classList.add('hidden');
      emailInput.style.borderColor = '';
      emailInput.setAttribute('aria-invalid', 'false');
    }

    // Validate Role selection
    if (!roleSelect.value) {
      roleError.classList.remove('hidden');
      roleSelect.style.borderColor = 'var(--error-color)';
      roleSelect.setAttribute('aria-invalid', 'true');
      isFormValid = false;
    } else {
      roleError.classList.add('hidden');
      roleSelect.style.borderColor = '';
      roleSelect.setAttribute('aria-invalid', 'false');
    }

    // Validate Terms checkbox agreement
    if (!termsCheckbox.checked) {
      termsError.classList.remove('hidden');
      termsCheckbox.setAttribute('aria-invalid', 'true');
      isFormValid = false;
    } else {
      termsError.classList.add('hidden');
      termsCheckbox.setAttribute('aria-invalid', 'false');
    }

    // Display success summary if all validation passes
    if (isFormValid) {
      const selectedPlan = document.querySelector('input[name="plan"]:checked').value;
      const planLabel = selectedPlan === 'premium' ? 'Premium (Pro)' : 'Free Tier';
      const roleLabel = roleSelect.options[roleSelect.selectedIndex].text;

      registerSummaryText.innerHTML = `Registration complete for <strong>${escapeHtml(emailInput.value)}</strong>. Assigned role: <strong>${roleLabel}</strong> on the <strong>${planLabel}</strong> subscription.`;
      
      registerForm.classList.add('hidden');
      registerSuccess.classList.remove('hidden');
    }
  });

  resetRegisterBtn.addEventListener('click', () => {
    registerForm.reset();
    
    // Clear validation borders and aria tags
    [emailInput, roleSelect].forEach(element => {
      element.style.borderColor = '';
      element.removeAttribute('aria-invalid');
    });
    termsCheckbox.removeAttribute('aria-invalid');

    // Hide error alerts
    [emailError, roleError, termsError].forEach(errorSpan => {
      errorSpan.classList.add('hidden');
    });

    registerSuccess.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });
}

/**
 * Challenge 4: User Directory Live Table controller
 * Handles client-side dataset searching and filtering.
 */
function initTableChallenge() {
  const INITIAL_USERS = [
    { name: 'Alice Smith', role: 'Developer', status: 'active', date: '2026-01-10' },
    { name: 'Bob Jones', role: 'QA Specialist', status: 'active', date: '2026-02-15' },
    { name: 'Charlie Brown', role: 'Product Owner', status: 'inactive', date: '2025-11-20' },
    { name: 'Diana Prince', role: 'Developer', status: 'inactive', date: '2026-03-01' },
    { name: 'Ethan Hunt', role: 'QA Specialist', status: 'active', date: '2026-05-12' },
    { name: 'Fiona Gallagher', role: 'Developer', status: 'active', date: '2026-06-18' }
  ];

  const tableBody = document.getElementById('table-body');
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const tableEmptyMessage = document.getElementById('table-empty-message');

  function renderTable(users) {
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
      tableEmptyMessage.classList.remove('hidden');
      return;
    }
    
    tableEmptyMessage.classList.add('hidden');

    users.forEach((user, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-testid', `user-row-${index}`);
      
      const statusText = user.status === 'active' ? 'Active' : 'Inactive';
      const statusBadge = `
        <span class="badge-status ${user.status}" data-testid="user-status-${index}">
          ${statusText}
        </span>
      `;

      row.innerHTML = `
        <td data-testid="user-name-${index}">${escapeHtml(user.name)}</td>
        <td data-testid="user-role-${index}">${user.role}</td>
        <td>${statusBadge}</td>
        <td>${user.date}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  function handleFilterChange() {
    const query = searchInput.value.toLowerCase().trim();
    const statusFilter = filterStatus.value;

    const filteredUsers = INITIAL_USERS.filter(user => {
      const matchesQuery = user.name.toLowerCase().includes(query) || user.role.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    renderTable(filteredUsers);
  }

  searchInput.addEventListener('input', handleFilterChange);
  filterStatus.addEventListener('change', handleFilterChange);

  // Initial table render execution
  renderTable(INITIAL_USERS);
}

/**
 * Escapes characters to prevent XSS injection attacks in tabular summaries.
 */
function escapeHtml(unsafeText) {
  return unsafeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
