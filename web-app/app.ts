/**
 * E2E Testing Playground - Application Logic (TypeScript)
 * Implements interactive modules for E2E validation challenges.
 */

interface User {
  name: string;
  role: string;
  status: 'active' | 'inactive';
  date: string;
}

interface Todo {
  text: string;
  completed: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all playground challenges
  initLoginChallenge();
  initDynamicLoadingChallenge();
  initRegistrationChallenge();
  initTableChallenge();
  initCalculatorChallenge();
  initPasswordStrengthChallenge();
  initTodoChallenge();
  initDateChallenge();
  initWizardChallenge();
});

/**
 * Challenge 1: Login Form controller
 * Simulates authentication logic with loading states.
 */
function initLoginChallenge(): void {
  const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
  const loginSubmit = document.getElementById('login-submit') as HTMLButtonElement | null;
  const loginSpinner = loginForm?.querySelector('[data-testid="login-spinner"]') as HTMLElement | null;
  const loginSuccessState = document.getElementById('login-success-state') as HTMLElement | null;
  const loginErrorMessage = document.getElementById('login-error-message') as HTMLElement | null;
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;
  const usernameInput = document.getElementById('username') as HTMLInputElement | null;
  const passwordInput = document.getElementById('password') as HTMLInputElement | null;

  if (!loginForm || !loginSubmit || !loginSpinner || !loginSuccessState || !loginErrorMessage || !logoutBtn || !usernameInput || !passwordInput) {
    return;
  }

  // Hardcoded test credentials
  const VALID_USER = 'admin';
  const VALID_PASS = 'admin123';

  loginForm.addEventListener('submit', (event: SubmitEvent) => {
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
function initDynamicLoadingChallenge(): void {
  const triggerDynamicBtn = document.getElementById('trigger-dynamic') as HTMLButtonElement | null;
  const dynamicLoaderWrapper = document.getElementById('dynamic-loader-wrapper') as HTMLElement | null;
  const dynamicContent = document.getElementById('dynamic-content') as HTMLElement | null;

  if (!triggerDynamicBtn || !dynamicLoaderWrapper || !dynamicContent) {
    return;
  }

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
function initRegistrationChallenge(): void {
  const registerForm = document.getElementById('register-form') as HTMLFormElement | null;
  const registerSuccess = document.getElementById('register-success') as HTMLElement | null;
  const registerSummaryText = document.getElementById('register-summary-text') as HTMLElement | null;
  const resetRegisterBtn = document.getElementById('reset-register-btn') as HTMLButtonElement | null;

  const emailInput = document.getElementById('reg-email') as HTMLInputElement | null;
  const roleSelect = document.getElementById('reg-role') as HTMLSelectElement | null;
  const termsCheckbox = document.getElementById('reg-terms') as HTMLInputElement | null;

  const emailError = document.getElementById('email-error-text') as HTMLElement | null;
  const roleError = document.getElementById('role-error-text') as HTMLElement | null;
  const termsError = document.getElementById('terms-error-text') as HTMLElement | null;

  if (!registerForm || !registerSuccess || !registerSummaryText || !resetRegisterBtn ||
      !emailInput || !roleSelect || !termsCheckbox || !emailError || !roleError || !termsError) {
    return;
  }

  // RFC 5322 Standard email validation regex
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  registerForm.addEventListener('submit', (event: SubmitEvent) => {
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
      const selectedPlanInput = document.querySelector('input[name="plan"]:checked') as HTMLInputElement | null;
      const selectedPlan = selectedPlanInput ? selectedPlanInput.value : '';
      const planLabel = selectedPlan === 'premium' ? 'Premium (Pro)' : 'Free Tier';
      const roleLabel = roleSelect.options[roleSelect.selectedIndex]?.text || '';

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
function initTableChallenge(): void {
  const INITIAL_USERS: User[] = [
    { name: 'Alice Smith', role: 'Developer', status: 'active', date: '2026-01-10' },
    { name: 'Bob Jones', role: 'QA Specialist', status: 'active', date: '2026-02-15' },
    { name: 'Charlie Brown', role: 'Product Owner', status: 'inactive', date: '2025-11-20' },
    { name: 'Diana Prince', role: 'Developer', status: 'inactive', date: '2026-03-01' },
    { name: 'Ethan Hunt', role: 'QA Specialist', status: 'active', date: '2026-05-12' },
    { name: 'Fiona Gallagher', role: 'Developer', status: 'active', date: '2026-06-18' }
  ];

  const tableBody = document.getElementById('table-body') as HTMLTableSectionElement | null;
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const filterStatus = document.getElementById('filter-status') as HTMLSelectElement | null;
  const tableEmptyMessage = document.getElementById('table-empty-message') as HTMLElement | null;

  if (!tableBody || !searchInput || !filterStatus || !tableEmptyMessage) {
    return;
  }

  function renderTable(users: User[]): void {
    if (!tableBody || !tableEmptyMessage) return;
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

  function handleFilterChange(): void {
    if (!searchInput || !filterStatus) return;
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
function escapeHtml(unsafeText: string): string {
  return unsafeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Challenge 5: Cart Price Calculator
 * Bug: Treat discount percentage as a flat dollar amount subtraction.
 */
function initCalculatorChallenge(): void {
  const form = document.getElementById('calculator-form') as HTMLFormElement | null;
  const priceInput = document.getElementById('calc-price') as HTMLInputElement | null;
  const quantityInput = document.getElementById('calc-quantity') as HTMLInputElement | null;
  const discountInput = document.getElementById('calc-discount') as HTMLInputElement | null;
  const taxInput = document.getElementById('calc-tax') as HTMLInputElement | null;
  const summary = document.getElementById('calc-summary') as HTMLElement | null;
  
  const subtotalText = document.querySelector('[data-testid="calc-subtotal"]') as HTMLElement | null;
  const discountText = document.querySelector('[data-testid="calc-discount-amount"]') as HTMLElement | null;
  const taxText = document.querySelector('[data-testid="calc-tax-amount"]') as HTMLElement | null;
  const totalText = document.querySelector('[data-testid="calc-total"]') as HTMLElement | null;

  if (!form || !priceInput || !quantityInput || !discountInput || !taxInput || !summary ||
      !subtotalText || !discountText || !taxText || !totalText) {
    return;
  }

  form.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();
    const price = parseFloat(priceInput.value) || 0;
    const qty = parseInt(quantityInput.value, 10) || 0;
    const discountVal = parseFloat(discountInput.value) || 0;
    const taxVal = parseFloat(taxInput.value) || 0;

    const subtotal = price * qty;
    // BUG: Treat discountVal as a flat rate dollar discount instead of a percentage discount!
    const discountAmount = discountVal;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * (taxVal / 100);
    const total = discountedSubtotal + taxAmount;

    subtotalText.textContent = `$${subtotal.toFixed(2)}`;
    discountText.textContent = `$${discountAmount.toFixed(2)}`;
    taxText.textContent = `$${taxAmount.toFixed(2)}`;
    totalText.textContent = `$${total.toFixed(2)}`;

    summary.classList.remove('hidden');
  });
}

/**
 * Challenge 6: Password Strength Meter
 * Bug: Checks length > 8 instead of >= 8.
 */
function initPasswordStrengthChallenge(): void {
  const passwordInput = document.getElementById('strength-password') as HTMLInputElement | null;
  const strengthBar = document.getElementById('strength-bar') as HTMLElement | null;
  const strengthText = document.getElementById('strength-text') as HTMLElement | null;

  if (!passwordInput || !strengthBar || !strengthText) {
    return;
  }

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    
    if (!password) {
      strengthBar.className = 'strength-bar';
      strengthBar.style.width = '0%';
      strengthText.textContent = 'None';
      strengthText.className = '';
      return;
    }

    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // BUG: Off-by-one boundary bug using strictly greater than 8 (> 8) instead of >= 8
    const isMinLength = password.length > 8;

    if (isMinLength && hasDigit && hasSpecial) {
      strengthBar.className = 'strength-bar strong';
      strengthText.textContent = 'Strong';
      strengthText.className = 'strong-text';
    } else if (isMinLength && hasDigit) {
      strengthBar.className = 'strength-bar medium';
      strengthText.textContent = 'Medium';
      strengthText.className = 'medium-text';
    } else {
      strengthBar.className = 'strength-bar weak';
      strengthText.textContent = 'Weak';
      strengthText.className = 'weak-text';
    }
  });
}

/**
 * Challenge 7: To-Do Planner
 * Bug: "Clear Completed" filters out active tasks instead of completed ones.
 */
function initTodoChallenge(): void {
  const form = document.getElementById('todo-form') as HTMLFormElement | null;
  const input = document.getElementById('todo-input') as HTMLInputElement | null;
  const list = document.getElementById('todo-list') as HTMLUListElement | null;
  const clearBtn = document.getElementById('todo-clear-completed') as HTMLButtonElement | null;

  if (!form || !input || !list || !clearBtn) {
    return;
  }

  let todos: Todo[] = [];

  function renderTodos(): void {
    if (!list) return;
    list.innerHTML = '';
    todos.forEach((todo, idx) => {
      const li = document.createElement('li');
      if (todo.completed) li.classList.add('completed');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('data-testid', `todo-check-${idx}`);
      checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        renderTodos();
      });

      const span = document.createElement('span');
      span.textContent = todo.text;
      span.setAttribute('data-testid', `todo-text-${idx}`);

      li.appendChild(checkbox);
      li.appendChild(span);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', (e: SubmitEvent) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      todos.push({ text, completed: false });
      input.value = '';
      renderTodos();
    }
  });

  clearBtn.addEventListener('click', () => {
    // BUG: Kept completed tasks and removed active tasks!
    todos = todos.filter(t => t.completed);
    renderTodos();
  });
}

/**
 * Challenge 8: Date Range Validator
 * Bug: Checks >= instead of > on start vs end validation.
 */
function initDateChallenge(): void {
  const startInput = document.getElementById('date-start') as HTMLInputElement | null;
  const endInput = document.getElementById('date-end') as HTMLInputElement | null;
  const dateError = document.getElementById('date-error') as HTMLElement | null;
  const dateSuccess = document.getElementById('date-success') as HTMLElement | null;

  if (!startInput || !endInput || !dateError || !dateSuccess) {
    return;
  }

  function validateDates(): void {
    if (!startInput || !endInput || !dateError || !dateSuccess) return;
    const startVal = startInput.value;
    const endVal = endInput.value;

    if (!startVal || !endVal) {
      dateError.classList.add('hidden');
      dateSuccess.classList.add('hidden');
      return;
    }

    // BUG: Using >= instead of > (making equal dates trigger the error banner)
    if (startVal >= endVal) {
      dateError.classList.remove('hidden');
      dateSuccess.classList.add('hidden');
    } else {
      dateError.classList.add('hidden');
      dateSuccess.classList.remove('hidden');
    }
  }

  startInput.addEventListener('change', validateDates);
  endInput.addEventListener('change', validateDates);
}

/**
 * Challenge 9: Feedback Wizard
 * Bug: Category dropdown value is read only at initialization instead of at submit.
 */
function initWizardChallenge(): void {
  const step1 = document.getElementById('wizard-step-1') as HTMLElement | null;
  const step2 = document.getElementById('wizard-step-2') as HTMLElement | null;
  const successState = document.getElementById('wizard-success') as HTMLElement | null;
  const categorySelect = document.getElementById('wizard-category') as HTMLSelectElement | null;
  const commentsInput = document.getElementById('wizard-comments') as HTMLInputElement | null;
  const nextBtn = document.getElementById('wizard-next') as HTMLButtonElement | null;
  const backBtn = document.getElementById('wizard-back') as HTMLButtonElement | null;
  const submitBtn = document.getElementById('wizard-submit') as HTMLButtonElement | null;
  const summaryText = document.getElementById('wizard-summary') as HTMLElement | null;
  const resetBtn = document.getElementById('wizard-reset') as HTMLButtonElement | null;

  if (!step1 || !step2 || !successState || !categorySelect || !commentsInput ||
      !nextBtn || !backBtn || !submitBtn || !summaryText || !resetBtn) {
    return;
  }

  // BUG: Read the category dropdown value when the wizard is initialized (first category: Billing)
  const selectedCategory = categorySelect.options[categorySelect.selectedIndex]?.text || '';

  nextBtn.addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  });

  backBtn.addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
  });

  submitBtn.addEventListener('click', () => {
    step2.classList.add('hidden');
    
    // BUG: Summary uses the stale variable selectedCategory instead of reading categorySelect.value
    summaryText.innerHTML = `Thank you for contacting category: <strong>${selectedCategory}</strong>`;
    
    successState.classList.remove('hidden');
  });

  resetBtn.addEventListener('click', () => {
    commentsInput.value = '';
    categorySelect.selectedIndex = 0;
    successState.classList.add('hidden');
    step1.classList.remove('hidden');
  });
}
