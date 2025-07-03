// Subject Page JavaScript for EduDriveHub

const API_BASE_URL = 'https://your-backend-url.render.com'; // Replace with your Render backend URL
let currentSubject = null;
let currentChapters = [];
let currentPDF = null;

// Initialize subject page
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectCode = urlParams.get('code');
    
    if (!subjectCode) {
        showError('No subject specified');
        return;
    }
    
    loadSubjectAndChapters(subjectCode);
});

// Load subject and chapters
async function loadSubjectAndChapters(subjectCode) {
    try {
        // Load subject info
        await loadSubject(subjectCode);
        
        // Check if premium access is required and granted
        if (currentSubject && currentSubject.isPremium) {
            const hasAccess = localStorage.getItem(`premiumAccess_${subjectCode}`);
            if (!hasAccess) {
                showPremiumRequired();
                return;
            }
        }
        
        // Load chapters
        await loadChapters(subjectCode);
        
    } catch (error) {
        console.error('Error loading subject:', error);
        showError('Failed to load subject information');
    }
}

// Load subject information
async function loadSubject(subjectCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects`);
        
        if (!response.ok) {
            throw new Error('Failed to load subjects');
        }
        
        const subjects = await response.json();
        currentSubject = subjects.find(s => s.code === subjectCode);
        
        if (!currentSubject) {
            throw new Error('Subject not found');
        }
        
        displaySubjectHeader(currentSubject);
        
    } catch (error) {
        console.error('Error loading subject:', error);
        throw error;
    }
}

// Load chapters for subject
async function loadChapters(subjectCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subjects/${subjectCode}/chapters`);
        
        if (!response.ok) {
            throw new Error('Failed to load chapters');
        }
        
        currentChapters = await response.json();
        displayChapters(currentChapters);
        
    } catch (error) {
        console.error('Error loading chapters:', error);
        displayChapters([]);
    }
}

// Display subject header
function displaySubjectHeader(subject) {
    const header = document.getElementById('subjectHeader');
    header.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <div class="flex items-center mb-2">
                    <h1 class="text-3xl font-bold text-gray-900 mr-4">${subject.name}</h1>
                    <span class="${subject.isPremium ? 'premium-badge' : 'free-badge'}">
                        <i class="fas ${subject.isPremium ? 'fa-crown' : 'fa-unlock'} mr-1"></i>
                        ${subject.isPremium ? 'PREMIUM' : 'FREE'}
                    </span>
                </div>
                <p class="text-lg text-gray-600">${subject.description}</p>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500">Total Chapters</div>
                <div class="text-2xl font-bold text-blue-600" id="chapterCount">-</div>
            </div>
        </div>
    `;
}

// Display chapters
function displayChapters(chapters) {
    const container = document.getElementById('chaptersContainer');
    
    // Update chapter count
    document.getElementById('chapterCount').textContent = chapters.length;
    
    if (!chapters || chapters.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-file-pdf text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No chapters available</h3>
                <p class="text-gray-500">Chapters will appear here once they are uploaded by administrators.</p>
            </div>
        `;
        return;
    }
    
    // Sort chapters by chapter number
    chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    container.innerHTML = chapters.map(chapter => `
        <div class="chapter-item mb-4">
            <div class="flex items-center">
                <div class="chapter-icon">
                    <i class="fas fa-file-pdf text-blue-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${chapter.title}</h4>
                    <p class="text-sm text-gray-500">${chapter.description || 'No description'}</p>
                    <div class="flex items-center mt-1 text-xs text-gray-400">
                        <span>Chapter ${chapter.chapterNumber}</span>
                        <span class="mx-2">•</span>
                        <span>${formatFileSize(chapter.fileSize)}</span>
                        <span class="mx-2">•</span>
                        <span>${formatDate(chapter.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div class="chapter-actions">
                <button onclick="viewChapter(${chapter.id})" 
                        class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye mr-1"></i>View
                </button>
                <button onclick="downloadChapter(${chapter.id})" 
                        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    <i class="fas fa-download mr-1"></i>Download
                </button>
            </div>
        </div>
    `).join('');
}

// Show premium access required message
function showPremiumRequired() {
    const container = document.getElementById('chaptersContainer');
    container.innerHTML = `
        <div class="text-center py-12">
            <div class="bg-orange-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                <i class="fas fa-crown text-orange-600 text-3xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Premium Access Required</h3>
            <p class="text-gray-500 mb-6">You need to enter the subject password to access this content.</p>
            <a href="index.html" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
                <i class="fas fa-arrow-left mr-2"></i>Go Back and Enter Password
            </a>
        </div>
    `;
}

// View chapter in modal
function viewChapter(chapterId) {
    const chapter = currentChapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    currentPDF = chapter;
    document.getElementById('pdfTitle').textContent = chapter.title;
    document.getElementById('pdfModal').classList.remove('hidden');
    document.getElementById('pdfModal').classList.add('modal-enter');
}

// Close PDF modal
function closePDFModal() {
    document.getElementById('pdfModal').classList.add('hidden');
    currentPDF = null;
}

// Download chapter
function downloadChapter(chapterId) {
    const chapter = currentChapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = chapter.fileUrl;
    link.download = chapter.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Downloading ${chapter.title}...`, 'info');
}

// Download current PDF from modal
function downloadCurrentPDF() {
    if (currentPDF) {
        downloadChapter(currentPDF.id);
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('chaptersContainer');
    container.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p class="text-gray-500 mb-6">${message}</p>
            <a href="index.html" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <i class="fas fa-arrow-left mr-2"></i>Back to Subjects
            </a>
        </div>
    `;
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
    
    if (diffDays === 1) return 'Uploaded 1 day ago';
    if (diffDays < 7) return `Uploaded ${diffDays} days ago`;
    return `Uploaded on ${date.toLocaleDateString()}`;
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

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.id === 'pdfModal') {
        closePDFModal();
    }
});

// ESC key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePDFModal();
    }
});