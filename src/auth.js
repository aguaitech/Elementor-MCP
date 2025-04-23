require('dotenv').config(); // Use CommonJS configuration call
const axios = require('axios'); // Use CommonJS require

let axiosInstance = null; // Singleton instance

async function initializeApiClient() {
    // No need to call loadESMDependencies

    if (axiosInstance) {
        // Already initialized
        return;
    }

    const baseURL = process.env.WP_URL;
    if (!baseURL) {
        throw new Error('WP_URL environment variable is not set.');
    }
    const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

    const appUser = process.env.WP_APP_USER;
    const appPassword = process.env.WP_APP_PASSWORD;

    // --- Strategy 1: Application Password (Basic Auth) ---
    if (appUser && appPassword) {
        const token = Buffer.from(`${appUser}:${appPassword}`, 'utf8').toString('base64');
        axiosInstance = axios.create({
            baseURL: cleanBaseURL,
            headers: {
                'Authorization': `Basic ${token}`
            }
        });
    }
    // --- Strategy 3: No Authentication ---
    else {
        console.error('No application password credentials found (WP_APP_USER, WP_APP_PASSWORD). API requests might fail.');
        axiosInstance = axios.create({
            baseURL: cleanBaseURL
        });
    }

    if (axiosInstance) {
        axiosInstance.interceptors.response.use(
            response => response,
            error => {
                console.error("Axios Error:", error.response?.status, error.response?.data || error.message);
                let errorMessage = 'WordPress API request failed';
                if (error.response?.headers?.['content-type']?.includes('text/html') && typeof error.response?.data === 'string') {
                    if (error.response.data.includes('incorrect_password')) {
                        errorMessage = 'WordPress API Error: Incorrect password.';
                    } else if (error.response.data.includes('invalid_username')) {
                        errorMessage = 'WordPress API Error: Invalid username.';
                    } else if (error.response.data.includes('nonce') || error.response.data.includes('security check')) {
                        errorMessage = 'WordPress API Error: Nonce or security check failed.';
                    }
                } else if (error.response?.data?.message) {
                    errorMessage = `WordPress API Error: ${error.response.data.message}`;
                }
                return Promise.reject(error.response?.data || new Error(errorMessage));
            }
        );
    } else {
        throw new Error("Failed to initialize API client.");
    }
}

function getApiClient() {
    if (!axiosInstance) {
        throw new Error('API client has not been initialized. Call initializeApiClient() first.');
    }
    return axiosInstance;
}

// Export using CommonJS syntax
module.exports = { initializeApiClient, getApiClient }; 