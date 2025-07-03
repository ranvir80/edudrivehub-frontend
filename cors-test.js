
// CORS Testing Script
const testCors = async () => {
    const baseUrl = API_BASE_URL;
    
    console.log('🧪 Testing CORS configuration...\n');
    
    const tests = [
        {
            name: 'GET /api/subjects',
            request: () => fetch(`${baseUrl}/api/subjects`)
        },
        {
            name: 'OPTIONS preflight',
            request: () => fetch(`${baseUrl}/api/admin/subjects`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': window.location.origin,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                }
            })
        },
        {
            name: 'POST with credentials',
            request: () => fetch(`${baseUrl}/api/admin/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    username: 'test',
                    password: 'test'
                })
            })
        }
    ];
    
    for (const test of tests) {
        try {
            const response = await test.request();
            console.log(`✅ ${test.name}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
        }
    }
};

// Run test function on page load (development only)
if (window.location.hostname === 'localhost') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testCors, 1000); // Wait for page to load
    });
}
