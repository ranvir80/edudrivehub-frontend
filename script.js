// EduDriveHub Frontend JavaScript

// Configuration - Updated for Render deployment
const API_BASE_URL = 'https://edudrivehub-backend-r9p2.onrender.com';
let isAuthenticated = false;
let currentSubjectCode = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Premium access form
    const premiumAccessForm = document.getElementById('premiumAccessForm');
    if (premiumAccessForm) {
        premiumAccessForm.addEventListener('submit', handlePremiumAccess);
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fixed')) {
            closeAllModals();
        }
    });

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Load subjects from API
async function loadSubjects() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/api/subjects`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const subjects = await response.json();
        displaySubjects(subjects);
    } catch (error) {
        console.error('Error loading subjects:', error);
        if (error.message.includes('fetch')) {
            showError('Cannot connect to backend server. Please ensure the backend is running on port 5000.');
        } else {
            showError('Failed to load subjects. Please check if the backend is running.');
        }
    } finally {
        hideLoading();
    }
}

// Display subjects in the grid
function displaySubjects(subjects) {
    const grid = document.getElementById('subjects-grid');
    
    if (!subjects || subjects.length === 0) {
        grid.innerHTML = `
            <div class="col-span-2 text-center py-12">
                <i class="fas fa-book text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No subjects available</h3>
                <p class="text-gray-500">Subjects will appear here once they are added by administrators.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = subjects.map(subject => `
        <div class="subject-card bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-12 h-12 rounded-full ${subject.isPremium ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center">
                        <i class="fas ${getSubjectIcon(subject.code)} text-2xl ${subject.isPremium ? 'text-orange-600' : 'text-green-600'}"></i>
                    </div>
                </div>
                <span class="${subject.isPremium ? 'premium-badge' : 'free-badge'}">
                    <i class="fas ${subject.isPremium ? 'fa-crown' : 'fa-unlock'} mr-1"></i>
                    ${subject.isPremium ? 'PREMIUM' : 'FREE'}
                </span>
            </div>
            
            <h4 class="text-xl font-bold text-gray-900 mb-2">${subject.name}</h4>
            <p class="text-gray-600 mb-4">${subject.description}</p>
            
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                    <i class="fas fa-file-pdf mr-1"></i>
                    Chapters Available
                </div>
                <button 
                    onclick="handleSubjectAccess('${subject.code}', ${subject.isPremium})"
                    class="px-4 py-2 rounded-lg font-medium transition-colors ${
                        subject.isPremium 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }"
                >
                    ${subject.isPremium ? 'Access Premium' : 'Access Now'}
                </button>
            </div>
        </div>
    `).join('');
}

// Get icon for subject
function getSubjectIcon(code) {
    switch (code) {
        case 'mscit':
            return 'fa-desktop';
        case 'klic':
            return 'fa-microchip';
        default:
            return 'fa-book';
    }
}

// Handle subject access
function handleSubjectAccess(subjectCode, isPremium) {
    if (isPremium) {
        currentSubjectCode = subjectCode;
        openPremiumModal();
    } else {
        window.location.href = `subject.html?code=${subjectCode}`;
    }
}

// Modal functions
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
    document.getElementById('adminModal').classList.add('modal-enter');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    document.getElementById('adminLoginForm').reset();
    clearFormStates('adminLoginForm');
}

function openPremiumModal() {
    document.getElementById('premiumModal').classList.remove('hidden');
    document.getElementById('premiumModal').classList.add('modal-enter');
    document.getElementById('premiumSubjectCode').value = currentSubjectCode;
}

function closePremiumModal() {
    document.getElementById('premiumModal').classList.add('hidden');
    document.getElementById('premiumAccessForm').reset();
    clearFormStates('premiumAccessForm');
    currentSubjectCode = '';
}

function closeAllModals() {
    closeAdminModal();
    closePremiumModal();
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const button = document.getElementById('adminLoginBtn');
    
    setButtonLoading(button, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store authentication state with token
        const authData = {
            ...data.admin,
            token: data.token
        };
        localStorage.setItem('adminAuth', JSON.stringify(authData));
        isAuthenticated = true;
        
        showNotification('Login successful! Redirecting to admin panel...', 'success');
        
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

// Handle premium access
async function handlePremiumAccess(e) {
    e.preventDefault();
    
    const password = document.getElementById('premiumPassword').value;
    const subjectCode = document.getElementById('premiumSubjectCode').value;
    const button = document.getElementById('premiumAccessBtn');
    
    setButtonLoading(button, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                subjectCode, 
                password 
            }),
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Invalid password');
        }

        // Store premium access
        localStorage.setItem(`premiumAccess_${subjectCode}`, 'true');

        showNotification('Access granted! Redirecting...', 'success');

        setTimeout(async () => {
            // For subjects with direct drive links, get secure link from backend
            if (data.hasDirectLink && data.accessToken) {
                try {
                    const driveResponse = await fetch(`${API_BASE_URL}/api/subjects/get-drive-link`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subjectCode: subjectCode,
                            accessToken: data.accessToken
                        }),
                    });

                    const driveData = await driveResponse.json();

                    if (driveResponse.ok && driveData.driveLink) {
                        // Store temporary access token for this session
                        sessionStorage.setItem(`driveAccess_${subjectCode}`, data.accessToken);

                        // Redirect to secure drive link
                        window.location.href = driveData.driveLink;
                    } else {
                        throw new Error('Failed to get secure drive link');
                    }
                } catch (error) {
                    console.error('Error getting drive link:', error);
                    showNotification('Error accessing drive link. Please try again.', 'error');
                    // Fallback to subject page
                    window.location.href = `subject.html?code=${subjectCode}`;
                }
            } else {
                // Regular subject access
                window.location.href = `subject.html?code=${subjectCode}`;
            }
        }, 1500);
        
    } catch (error) {
        console.error('Premium access error:', error);
        showNotification(error.message || 'Access denied', 'error');
    } finally {
        setButtonLoading(button, false);
    }
}

// Utility functions
function showLoading() {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = `
        <div class="col-span-2 text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p class="text-gray-600">Loading subjects...</p>
        </div>
    `;
}

function hideLoading() {
    // Loading will be replaced by displaySubjects
}

function showError(message) {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = `
        <div class="col-span-2 text-center py-12">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Subjects</h3>
            <p class="text-gray-600 mb-4">${message}</p>
            <button onclick="loadSubjects()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-redo mr-2"></i>Try Again
            </button>
        </div>
    `;
}

function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.login-text, .access-text');
    const spinnerSpan = button.querySelector('.login-spinner, .access-spinner');
    
    if (isLoading) {
        button.disabled = true;
        if (textSpan) textSpan.classList.add('hidden');
        if (spinnerSpan) spinnerSpan.classList.remove('hidden');
    } else {
        button.disabled = false;
        if (textSpan) textSpan.classList.remove('hidden');
        if (spinnerSpan) spinnerSpan.classList.add('hidden');
    }
}

function clearFormStates(formId) {
    const form = document.getElementById(formId);
    const buttons = form.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => setButtonLoading(button, false));
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getNotificationIcon(type)} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

// Check authentication status on page load
function checkAuthStatus() {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
        isAuthenticated = true;
        // Update UI to show authenticated state
        updateAuthenticatedUI();
    }
}

function updateAuthenticatedUI() {
    // This function can be used to update the UI when user is authenticated
    // For example, show different navigation items or admin-specific content
}

// Initialize auth check
checkAuthStatus();