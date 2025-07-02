
// API Configuration - automatically detects environment
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : window.location.hostname.includes('vercel.app') 
        ? 'https://edudrivehub-backend-fl3g.onrender.com'  // Replace with your actual Render URL
        : 'https://edudrivehub-backend-fl3g.onrender.com';

// Global State
let currentUser = null;
let currentSubject = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    setupEventListeners();
    checkAuthStatus();
});

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Upload form
    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    
    // Password form
    document.getElementById('password-form').addEventListener('submit', handlePasswordSubmit);
    
    // Modal close events
    window.onclick = function(event) {
        const chapterModal = document.getElementById('chapter-modal');
        const passwordModal = document.getElementById('password-modal');
        if (event.target === chapterModal) {
            closeModal();
        }
        if (event.target === passwordModal) {
            closePasswordModal();
        }
    }
}

// Navigation
function showHome() {
    document.getElementById('home-page').classList.add('active');
    document.getElementById('admin-page').classList.remove('active');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('[onclick="showHome()"]').classList.add('active');
}

function showAdmin() {
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('admin-page').classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('[onclick="showAdmin()"]').classList.add('active');
    
    if (currentUser) {
        loadAdminDashboard();
    }
}

// Auth Functions
function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        currentUser = { token };
        if (document.getElementById('admin-page').classList.contains('active')) {
            loadAdminDashboard();
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        const response = await fetch(`${API_URL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            currentUser = data;
            loadAdminDashboard();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    currentUser = null;
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-form').reset();
}

// Load Data Functions
async function loadSubjects() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/subjects`);
        const subjects = await response.json();
        
        if (response.ok) {
            displaySubjects(subjects);
            populateSubjectSelect(subjects);
        } else {
            showAlert('Failed to load subjects', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please check your connection.', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySubjects(subjects) {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = '';
    
    subjects.forEach(subject => {
        const card = document.createElement('div');
        card.className = `subject-card ${subject.type}`;
        card.onclick = () => openSubject(subject);
        
        card.innerHTML = `
            <div class="subject-icon ${subject.color}">
                <i class="${subject.icon}"></i>
            </div>
            <h3 class="subject-title">${subject.name}</h3>
            <p class="subject-description">${subject.description}</p>
            <span class="subject-type ${subject.type}">${subject.type}</span>
        `;
        
        grid.appendChild(card);
    });
}

function populateSubjectSelect(subjects) {
    const select = document.getElementById('upload-subject');
    select.innerHTML = '<option value="">Select Subject</option>';
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.name;
        option.textContent = subject.name;
        select.appendChild(option);
    });
}

async function loadAdminDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Load all chapters for admin
    await loadAllChapters();
}

async function loadAllChapters() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/admin/chapters`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
            },
        });
        
        const chapters = await response.json();
        
        if (response.ok) {
            displayAdminChapters(chapters);
        } else {
            showAlert('Failed to load chapters', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

function displayAdminChapters(chapters) {
    const container = document.getElementById('chapters-list');
    container.innerHTML = '';
    
    if (chapters.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No chapters uploaded yet.</p>';
        return;
    }
    
    chapters.forEach(chapter => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        
        item.innerHTML = `
            <div class="chapter-info">
                <h4>${chapter.chapter_title}</h4>
                <p>${chapter.subject} • Uploaded: ${new Date(chapter.uploaded_at).toLocaleDateString()}</p>
            </div>
            <div class="chapter-actions">
                <button class="btn-primary btn-small" onclick="window.open('${chapter.pdf_url}', '_blank')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-danger btn-small" onclick="deleteChapter(${chapter.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Subject Functions
async function openSubject(subject) {
    currentSubject = subject;
    
    if (subject.type === 'premium' && subject.password_hash) {
        showPasswordModal(subject);
    } else {
        await loadChapters(subject.name);
    }
}

function showPasswordModal(subject) {
    document.getElementById('password-modal').style.display = 'block';
    document.getElementById('subject-password').focus();
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('password-form').reset();
}

async function handlePasswordSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    const password = document.getElementById('subject-password').value;
    
    try {
        const response = await fetch(`${API_URL}/api/subjects/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: currentSubject.name,
                password: password,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closePasswordModal();
            await loadChapters(currentSubject.name);
        } else {
            showAlert(data.error || 'Invalid password', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadChapters(subjectName) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/chapters/${encodeURIComponent(subjectName)}`);
        const chapters = await response.json();
        
        if (response.ok) {
            showChapterModal(subjectName, chapters);
        } else {
            showAlert('Failed to load chapters', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

function showChapterModal(subjectName, chapters) {
    document.getElementById('modal-subject-title').textContent = `${subjectName} - Chapters`;
    
    const container = document.getElementById('modal-chapters-list');
    container.innerHTML = '';
    
    if (chapters.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No chapters available yet.</p>';
    } else {
        chapters.forEach(chapter => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            
            item.innerHTML = `
                <div class="chapter-info">
                    <h4>${chapter.chapter_title}</h4>
                    <p>Uploaded: ${new Date(chapter.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div class="chapter-actions">
                    <button class="btn-primary btn-small" onclick="window.open('${chapter.pdf_url}', '_blank')">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    document.getElementById('chapter-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('chapter-modal').style.display = 'none';
    currentSubject = null;
}

// Upload Functions
async function handleUpload(e) {
    e.preventDefault();
    showLoading(true);
    
    const formData = new FormData();
    formData.append('subject', document.getElementById('upload-subject').value);
    formData.append('chapterTitle', document.getElementById('chapter-title').value);
    formData.append('pdf', document.getElementById('pdf-file').files[0]);
    
    try {
        const response = await fetch(`${API_URL}/api/chapters`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
            },
            body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Chapter uploaded successfully!', 'success');
            document.getElementById('upload-form').reset();
            await loadAllChapters();
        } else {
            showAlert(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteChapter(chapterId) {
    if (!confirm('Are you sure you want to delete this chapter?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}/api/chapters/${chapterId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
            },
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Chapter deleted successfully!', 'success');
            await loadAllChapters();
        } else {
            showAlert(data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showAlert(message, type) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 4000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    if (type === 'success') {
        alert.style.backgroundColor = '#10b981';
    } else {
        alert.style.backgroundColor = '#ef4444';
    }
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Show alert
    setTimeout(() => alert.style.opacity = '1', 100);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => document.body.removeChild(alert), 300);
    }, 3000);
}

