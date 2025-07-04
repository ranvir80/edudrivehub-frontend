
// Development configuration
const DEV_CONFIG = {
    // Backend API URL - Updated for Render deployment
    API_BASE_URL: 'https://edudrivehub-backend-r9p2.onrender.com',
    
    // Enable debug mode in development
    DEBUG: window.location.hostname === 'localhost' || window.location.hostname.includes('replit'),
    
    // Request timeout
    REQUEST_TIMEOUT: 10000,
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
};

// Debug logging function
function debugLog(message, data = null) {
    if (DEV_CONFIG.DEBUG) {
        console.log(`[EduDriveHub Debug] ${message}`, data || '');
    }
}

// Enhanced fetch with retry logic
async function enhancedFetch(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEV_CONFIG.REQUEST_TIMEOUT);
    
    let lastError;
    
    for (let attempt = 1; attempt <= DEV_CONFIG.MAX_RETRIES; attempt++) {
        try {
            debugLog(`Fetch attempt ${attempt} to: ${url}`);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            debugLog(`Response received: ${response.status}`, response);
            
            return response;
        } catch (error) {
            lastError = error;
            debugLog(`Fetch attempt ${attempt} failed:`, error);
            
            if (attempt < DEV_CONFIG.MAX_RETRIES && !error.name === 'AbortError') {
                await new Promise(resolve => setTimeout(resolve, DEV_CONFIG.RETRY_DELAY * attempt));
            }
        }
    }
    
    clearTimeout(timeoutId);
    throw lastError;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.DEV_CONFIG = DEV_CONFIG;
    window.debugLog = debugLog;
    window.enhancedFetch = enhancedFetch;
}
