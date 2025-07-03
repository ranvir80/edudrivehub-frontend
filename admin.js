// Global variables
let currentSubjects = [];
let adminToken = localStorage.getItem('adminToken');
let selectedFile = null;

// API Configuration
const API_BASE_URL = window.location.origin;
    ? 'http://localhost:5000'
    : 'https://edudrivehub-backend-att2.onrender.com';
// Check authentication on page load
if (!adminToken) {
    window.location.href = '/';
}

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
        headers: {},
    };

    // Add auth header if not uploading file
    if (adminToken && !options.body instanceof FormData) {
        defaultOptions.headers['Authorization'] = `Bearer ${adminToken}`;
    }

    // Add content type for JSON requests
    if (options.body && typeof options.body === 'string') {
        defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/';
        return;
    }

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
        updateStats();
        updateSubjectsList();
        updateUploadSubjectOptions();
    } catch (error) {
        console.error('Failed to load subjects:', error);
        showAlert('Failed to load subjects. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const totalSubjects = currentSubjects.length;
    const freeSubjects = currentSubjects.filter(s => s.type === 'free').length;
    const premiumSubjects = currentSubjects.filter(s => s.type === 'premium').length;
    const totalChapters = currentSubjects.reduce((total, subject) => total + (subject.chapters ? subject.chapters.length : 0), 0);

    document.getElementById('totalSubjects').textContent = totalSubjects;
    document.getElementById('freeSubjects').textContent = freeSubjects;
    document.getElementById('premiumSubjects').textContent = premiumSubjects;
    document.getElementById('totalChapters').textContent = totalChapters;
}

// Update subjects list
function updateSubjectsList() {
    const subjectsList = document.getElementById('subjectsList');
    
    if (currentSubjects.length === 0) {
        subjectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No subjects available. Create your first subject to get started.</p>
            </div>
        `;
        return;
    }

    subjectsList.innerHTML = currentSubjects.map(subject => {
        const chaptersList = subject.chapters && subject.chapters.length > 0 
            ? subject.chapters.map(chapter => `
                <div class="chapter-item-admin">
                    <div>
                        <strong>${chapter.title}</strong>
                        <small style="color: #718096; display: block;">
                            Uploaded: ${new Date(chapter.uploadedAt).toLocaleDateString()}
                        </small>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteChapter(${chapter.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')
            : '<p style="color: #718096; font-style: italic;">No chapters uploaded yet.</p>';

        return `
            <div class="subject-item">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${subject.name}</h4>
                        <span class="badge ${subject.type}">
                            <i class="fas fa-${subject.type === 'free' ? 'unlock' : 'crown'}"></i>
                            ${subject.type === 'free' ? 'Free' : 'Premium'}
                        </span>
                    </div>
                    <p style="color: #718096; margin: 0; font-size: 0.875rem;">
                        ${subject.description || 'No description available'}
                    </p>
                    <p style="color: #718096; margin: 0.25rem 0 0; font-size: 0.75rem;">
                        ${subject.chapters ? subject.chapters.length : 0} chapters
                    </p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm" onclick="editSubject(${subject.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSubject(${subject.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${subject.chapters && subject.chapters.length > 0 ? `
                <div class="chapters-list">
                    ${chaptersList}
                </div>
            ` : ''}
        `;
    }).join('');
}

// Update upload subject options
function updateUploadSubjectOptions() {
    const select = document.getElementById('uploadSubject');
    select.innerHTML = '<option value="">Choose a subject...</option>';
    
    currentSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        select.appendChild(option);
    });
}

// Tab management
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Create subject
async function createSubject(formData) {
    try {
        showLoading();
        await apiCall('/api/admin/subjects', {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        showAlert('Subject created successfully!', 'success');
        closeModal('addSubjectModal');
        document.getElementById('addSubjectForm').reset();
        loadSubjects();
    } catch (error) {
        showAlert(error.message || 'Failed to create subject.');
    } finally {
        hideLoading();
    }
}

// Delete subject
async function deleteSubject(subjectId) {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all chapters.')) {
        return;
    }

    try {
        showLoading();
        await apiCall(`/api/admin/subjects/${subjectId}`, {
            method: 'DELETE',
        });

        showAlert('Subject deleted successfully!', 'success');
        loadSubjects();
    } catch (error) {
        showAlert(error.message || 'Failed to delete subject.');
    } finally {
        hideLoading();
    }
}

// Delete chapter
async function deleteChapter(chapterId) {
    if (!confirm('Are you sure you want to delete this chapter?')) {
        return;
    }

    try {
        showLoading();
        await apiCall(`/api/admin/chapters/${chapterId}`, {
            method: 'DELETE',
        });

        showAlert('Chapter deleted successfully!', 'success');
        loadSubjects();
    } catch (error) {
        showAlert(error.message || 'Failed to delete chapter.');
    } finally {
        hideLoading();
    }
}

// Upload chapter
async function uploadChapter(formData) {
    try {
        showLoading();
        
        // First upload file to get URL (in real app, this would be Cloudinary)
        const fileUrl = `https://example.com/pdfs/${Date.now()}-${selectedFile.name}`;
        
        const chapterData = {
            subjectId: parseInt(formData.get('subjectId')),
            title: formData.get('title'),
            pdfUrl: fileUrl,
            encrypted: false
        };

        await apiCall('/api/admin/chapters', {
            method: 'POST',
            body: JSON.stringify(chapterData),
        });

        showAlert('Chapter uploaded successfully!', 'success');
        document.getElementById('uploadForm').reset();
        clearFile();
        loadSubjects();
    } catch (error) {
        showAlert(error.message || 'Failed to upload chapter.');
    } finally {
        hideLoading();
    }
}

// File handling
function clearFile() {
    selectedFile = null;
    document.getElementById('pdfFile').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadArea').style.borderColor = '#e2e8f0';
    document.getElementById('uploadArea').style.backgroundColor = '';
}

function handleFileSelect(file) {
    if (file && file.type === 'application/pdf') {
        selectedFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('uploadArea').style.borderColor = '#38a169';
        document.getElementById('uploadArea').style.backgroundColor = '#c6f6d5';
    } else {
        showAlert('Please select a valid PDF file.');
        clearFile();
    }
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
}

// Edit subject (placeholder)
function editSubject(subjectId) {
    showAlert('Edit functionality will be implemented in the next version.');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadSubjects();

    // Add subject form
    document.getElementById('addSubjectForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        createSubject(data);
    });

    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (!selectedFile) {
            showAlert('Please select a PDF file.');
            return;
        }
        const formData = new FormData(this);
        uploadChapter(formData);
    });

    // Subject type change handler
    document.getElementById('subjectType').addEventListener('change', function() {
        const passwordGroup = document.getElementById('passwordGroup');
        if (this.value === 'premium') {
            passwordGroup.style.display = 'block';
            document.getElementById('subjectPassword').required = true;
        } else {
            passwordGroup.style.display = 'none';
            document.getElementById('subjectPassword').required = false;
        }
    });

    // File input handler
    document.getElementById('pdfFile').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Upload area drag and drop
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    uploadArea.addEventListener('click', function() {
        document.getElementById('pdfFile').click();
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// Global functions for HTML onclick handlers
window.showTab = showTab;
window.closeModal = closeModal;
window.deleteSubject = deleteSubject;
window.deleteChapter = deleteChapter;
window.editSubject = editSubject;
window.clearFile = clearFile;
window.logout = logout;