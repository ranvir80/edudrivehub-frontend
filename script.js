// Global variables
let currentCourse = null;

// DOM Elements
const passwordModal = document.getElementById('passwordModal');
const passwordForm = document.getElementById('passwordForm');
const coursePasswordInput = document.getElementById('coursePassword');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const toggleIcon = document.getElementById('toggleIcon');

// API Base URL - will be set based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://nakshatra-edudrivehub-backend.onrender.com';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll effects for navigation
function initializeScrollEffects() {
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Open password modal for premium courses
function openPasswordModal(courseId) {
    currentCourse = courseId;
    passwordModal.style.display = 'block';
    coursePasswordInput.focus();
    
    // Reset form state
    passwordForm.reset();
    hideError();
    hideLoading();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close password modal
function closePasswordModal() {
    passwordModal.style.display = 'none';
    currentCourse = null;
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Reset form state
    passwordForm.reset();
    hideError();
    hideLoading();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = coursePasswordInput;
    const icon = toggleIcon;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Verify password for premium course access
async function verifyPassword(event) {
    event.preventDefault();
    
    const password = coursePasswordInput.value.trim();
    
    if (!password) {
        showError('Please enter the course password.');
        return;
    }
    
    if (!currentCourse) {
        showError('Course information not found. Please try again.');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseId: currentCourse,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Password is correct, redirect to course materials
            hideLoading();
            closePasswordModal();
            
            // Show success message
            showSuccessMessage('Password verified! Redirecting to course materials...');
            
            // Redirect to Google Drive folder after a short delay
            setTimeout(() => {
                window.open(data.driveUrl, '_blank');
            }, 1500);
            
        } else {
            hideLoading();
            showError(data.message || 'Invalid password. Please try again.');
            coursePasswordInput.select();
        }
        
    } catch (error) {
        hideLoading();
        console.error('Password verification error:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

// Access open course (MS-CIT)
function accessOpenCourse() {
    // Show loading state
    const button = event.target.closest('.course-button');
    const originalContent = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
    button.disabled = true;
    
    // Redirect to MKCL MS-CIT page
    setTimeout(() => {
        window.open('https://mkcl.org/mscit', '_blank');
        
        // Restore button state
        button.innerHTML = originalContent;
        button.disabled = false;
    }, 1000);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
    
    // Disable form submission
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    submitButton.classList.add('btn-loading');
    submitButton.disabled = true;
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
    
    // Enable form submission
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    submitButton.classList.remove('btn-loading');
    submitButton.disabled = false;
}

// Show success message
function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Handle modal click outside to close
passwordModal.addEventListener('click', function(event) {
    if (event.target === passwordModal) {
        closePasswordModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && passwordModal.style.display === 'block') {
        closePasswordModal();
    }
});

// Handle enter key in password input
coursePasswordInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        verifyPassword(event);
    }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Error handling for network issues
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});
