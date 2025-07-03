// Admin Panel JavaScript for EduDriveHub

const API_BASE_URL = 'https://your-backend-url.render.com'; // Replace with your Render backend URL
let adminAuth = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupEventListeners();
    loadStats();
    loadRecentUploads();
});

// Check if admin is authenticated
function checkAdminAuth() {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
        showNotification('Please login to access admin panel', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    try {
        adminAuth = JSON.parse(auth);
        document.getElementById('adminName').textContent = adminAuth.username || 'Admin';
    } catch (error) {
        console.error('Invalid auth data:', error);
        logout();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
    }

    // File input change
    const fileInput = document.getElementById('pdfFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
}

// Load dashboard statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${adminAuth?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        const stats = await response.json();
        displayStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
        displayStats({
            totalSubjects: 0,
            totalPDFs: 0,
            storageUsed: '0 MB',
            lastUpload: 'Never'
        });
    }
}

// Display statistics
function displayStats(stats) {
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Total Subjects</p>
                    <p class="text-2xl font-bold text-gray-900">${stats.totalSubjects || 0}</p>
                </div>
                <div class="stat-icon bg-blue-100">
                    <i class="fas fa-book text-blue-600"></i>
                </div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Total PDFs</p>
                    <p class="text-2xl font-bold text-gray-900">${stats.totalPDFs || 0}</p>
                </div>
                <div class="stat-icon bg-green-100">
                    <i class="fas fa-file-pdf text-green-600"></i>
                </div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Storage Used</p>
                    <p class="text-2xl font-bold text-gray-900">${stats.storageUsed || '0 MB'}</p>
                </div>
                <div class="stat-icon bg-orange-100">
                    <i class="fas fa-cloud text-orange-600"></i>
                </div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Last Upload</p>
                    <p class="text-2xl font-bold text-gray-900">${stats.lastUpload || 'Never'}</p>
                </div>
                <div class="stat-icon bg-purple-100">
                    <i class="fas fa-clock text-purple-600"></i>
                </div>
            </div>
        </div>
    `;
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndDisplayFile(file);
    }
}

// Validate and display selected file
function validateAndDisplayFile(file) {
    const selectedFileEl = document.getElementById('selectedFile');
    
    // Validate file type
    if (file.type !== 'application/pdf') {
        showNotification('Only PDF files are allowed', 'error');
        return false;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return false;
    }
    
    // Display selected file
    selectedFileEl.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    selectedFileEl.classList.remove('hidden');
    
    return true;
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateAndDisplayFile(file)) {
            document.getElementById('pdfFile').files = files;
        }
    }
}

// Handle file upload
async function handleFileUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData();
    
    // Get form values
    const subjectCode = document.getElementById('subjectCode').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const chapterNumber = document.getElementById('chapterNumber').value;
    const file = document.getElementById('pdfFile').files[0];
    
    // Validate required fields
    if (!subjectCode || !title || !chapterNumber || !file) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Append form data
    formData.append('file', file);
    formData.append('subjectCode', subjectCode);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('chapterNumber', chapterNumber);
    
    const uploadBtn = document.getElementById('uploadBtn');
    setButtonLoading(uploadBtn, true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminAuth?.token || ''}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        showNotification('Chapter uploaded successfully!', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('selectedFile').classList.add('hidden');
        
        // Reload stats and recent uploads
        loadStats();
        loadRecentUploads();
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(error.message || 'Upload failed', 'error');
    } finally {
        setButtonLoading(uploadBtn, false);
    }
}

// Load recent uploads
async function loadRecentUploads() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/recent-uploads`, {
            headers: {
                'Authorization': `Bearer ${adminAuth?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load recent uploads');
        }
        
        const uploads = await response.json();
        displayRecentUploads(uploads);
    } catch (error) {
        console.error('Error loading recent uploads:', error);
        displayRecentUploads([]);
    }
}

// Display recent uploads
function displayRecentUploads(uploads) {
    const container = document.getElementById('recentUploads');
    
    if (!uploads || uploads.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-upload text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">No recent uploads</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = uploads.map(upload => `
        <div class="chapter-item">
            <div class="flex items-center">
                <div class="chapter-icon">
                    <i class="fas fa-file-pdf text-blue-600"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${upload.title}</h4>
                    <p class="text-sm text-gray-500">${upload.subjectName} - Chapter ${upload.chapterNumber}</p>
                    <p class="text-xs text-gray-400">${formatFileSize(upload.fileSize)} • ${formatDate(upload.createdAt)}</p>
                </div>
            </div>
            <div class="chapter-actions">
                <button onclick="deleteChapter(${upload.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete chapter
async function deleteChapter(chapterId) {
    if (!confirm('Are you sure you want to delete this chapter?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/chapters/${chapterId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminAuth?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete chapter');
        }
        
        showNotification('Chapter deleted successfully', 'success');
        loadStats();
        loadRecentUploads();
        
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete chapter', 'error');
    }
}

// Utility functions
function formatFileSize(bytes) {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.upload-text');
    const spinnerSpan = button.querySelector('.upload-spinner');
    
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

// Logout function
function logout() {
    localStorage.removeItem('adminAuth');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}