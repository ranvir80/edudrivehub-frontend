// Global variables
let currentSubjects = [];
let adminToken = localStorage.getItem('adminToken');

// API Configuration with CORS support
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://edudrivehub-backend-att2.onrender.com';

// CORS-aware fetch wrapper
const apiRequest = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include', // Include cookies/auth headers
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

// Utility functions
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

function showAlert(message, type = 'error') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (adminToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Load subjects data
async function loadSubjects() {
    try {
        const subjects = await apiCall('/api/subjects');
        currentSubjects = subjects;
        updateSubjectCards();
    } catch (error) {
        console.error('Failed to load subjects:', error);
        showAlert('Failed to load subjects. Please try again.');
    }
}

// Update subject cards with current data
function updateSubjectCards() {
    const msCitCard = document.querySelector('[data-subject="ms-cit"]');
    const klicCard = document.querySelector('[data-subject="klic-hardware"]');

    // Find subjects from data
    const msCit = currentSubjects.find(s => s.name === 'MS-CIT');
    const klic = currentSubjects.find(s => s.name === 'KLiC Hardware');

    // Update chapter counts
    if (msCit) {
        msCitCard.querySelector('.chapter-count').textContent = `${msCit.chapters.length} Chapters`;
    }
    if (klic) {
        klicCard.querySelector('.chapter-count').textContent = `${klic.chapters.length} Chapters`;
    }
}

// View subject chapters
function viewSubject(subjectKey) {
    const subjectName = subjectKey === 'ms-cit' ? 'MS-CIT' : 'KLiC Hardware';
    const subject = currentSubjects.find(s => s.name === subjectName);

    if (!subject) {
        showAlert('Subject not found.');
        return;
    }

    showChapters(subject);
}

// Request access to premium subject
function requestAccess(subjectKey) {
    const subjectName = subjectKey === 'klic-hardware' ? 'KLiC Hardware' : 'MS-CIT';
    document.getElementById('accessSubjectName').textContent = subjectName;
    document.getElementById('subjectPassword').value = '';
    openModal('accessModal');
}

// Show chapters modal
function showChapters(subject) {
    document.getElementById('chaptersSubjectName').textContent = subject.name;
    const chaptersList = document.getElementById('chaptersList');

    if (!subject.chapters || subject.chapters.length === 0) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>No chapters available for this subject yet.</p>
            </div>
        `;
    } else {
        chaptersList.innerHTML = subject.chapters.map(chapter => `
            <div class="chapter-item">
                <div class="chapter-info">
                    <div class="chapter-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="chapter-details">
                        <h5>${chapter.title}</h5>
                        <p>Uploaded on ${new Date(chapter.uploadedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="chapter-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewPDF('${chapter.pdfUrl}', '${chapter.title}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-success btn-sm" onclick="downloadPDF('${chapter.pdfUrl}', '${chapter.title}')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        `).join('');
    }

    openModal('chaptersModal');
}

// View PDF in new tab
function viewPDF(pdfUrl, title) {
    window.open(pdfUrl, '_blank');
}

// Download PDF
function downloadPDF(pdfUrl, title) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Admin login
async function adminLogin(username, password) {
    try {
        showLoading();
        const response = await apiCall('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (response.token) {
            adminToken = response.token;
            localStorage.setItem('adminToken', adminToken);
            showAlert('Login successful! Redirecting to admin panel...', 'success');
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1500);
        }
    } catch (error) {
        showAlert(error.message || 'Login failed. Please check your credentials.');
    } finally {
        hideLoading();
    }
}

// Verify subject access
async function verifySubjectAccess(subjectName, password) {
    try {
        showLoading();
        const subject = currentSubjects.find(s => s.name === subjectName);

        if (!subject) {
            throw new Error('Subject not found');
        }

        const response = await apiCall(`/api/subjects/${subject.id}/access`, {
            method: 'POST',
            body: JSON.stringify({ password }),
        });

        // Update the subject with full chapter data
        const subjectIndex = currentSubjects.findIndex(s => s.id === subject.id);
        if (subjectIndex !== -1) {
            currentSubjects[subjectIndex] = response;
        }

        closeModal('accessModal');
        showAlert('Access granted! Loading content...', 'success');
        setTimeout(() => {
            showChapters(response);
        }, 1000);
    } catch (error) {
        showAlert(error.message || 'Invalid password. Please try again.');
    } finally {
        hideLoading();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadSubjects();

    // Admin login button
    document.getElementById('adminLoginBtn').addEventListener('click', function() {
        openModal('adminModal');
    });

    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        adminLogin(username, password);
    });

    // Subject access form
    document.getElementById('accessForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const subjectName = document.getElementById('accessSubjectName').textContent;
        const password = document.getElementById('subjectPassword').value;
        verifySubjectAccess(subjectName, password);
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
});

// Global functions for HTML onclick handlers
window.viewSubject = viewSubject;
window.requestAccess = requestAccess;
window.closeModal = closeModal;
window.viewPDF = viewPDF;
window.downloadPDF = downloadPDF;