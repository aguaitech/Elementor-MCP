const { getApiClient } = require('./auth.js'); // Use CommonJS require

// --- CREATE ---
async function createPage(pageData) {
    const client = getApiClient();
    // Ensure Elementor data is properly nested under meta
    const payload = {
        title: pageData.title,
        status: pageData.status || 'draft', // Default to draft
        content: pageData.content || '', // Optional standard content
        meta: {
            _elementor_data: pageData.elementor_data // MUST be a JSON string
        }
        // Add other WP fields as needed (e.g., template, author, etc.)
    };

    // Validate elementor_data is a string
    if (typeof payload.meta._elementor_data !== 'string') {
        throw new Error('elementor_data must be provided as a JSON string.');
    }
    try {
        JSON.parse(payload.meta._elementor_data); // Basic validation it's parsable JSON
    } catch (e) {
        throw new Error('elementor_data is not valid JSON string.');
    }


    const response = await client.post('/wp-json/wp/v2/pages', payload);
    return response.data; // Return the created page object
}

// --- READ ---
async function getPage(pageId) {
    const client = getApiClient();
    // Use context=edit to potentially get more fields like meta
    const response = await client.get(`/wp-json/wp/v2/pages/${pageId}?context=edit`);
    return response.data;
}

// --- UPDATE ---
async function updatePage(pageId, pageData) {
    const client = getApiClient();

    const payload = {};
    if (pageData.title) payload.title = pageData.title;
    if (pageData.status) payload.status = pageData.status;
    if (pageData.content) payload.content = pageData.content; // Use !== undefined to allow setting empty content

    if (pageData.elementor_data) {
        if (typeof pageData.elementor_data !== 'string') {
             throw new Error('elementor_data must be provided as a JSON string.');
        }
         try {
            JSON.parse(pageData.elementor_data); // Basic validation
        } catch (e) {
            throw new Error('elementor_data is not valid JSON string.');
        }
        payload.meta = { _elementor_data: pageData.elementor_data };
    }

    if (Object.keys(payload).length === 0) {
        throw new Error("No update data provided.");
    }

    // WP uses POST for updates via ID route
    const response = await client.post(`/wp-json/wp/v2/pages/${pageId}`, payload);
    return response.data;
}

// --- DELETE ---
async function deletePage(pageId, force = true) {
    const client = getApiClient();
    const response = await client.delete(`/wp-json/wp/v2/pages/${pageId}?force=${force}`);
    // WP delete usually returns the object before deletion or a specific structure
    return response.data;
}

// --- NEW FUNCTION: Get Page ID by Slug ---
async function getPageIdBySlug(slug) {
    const client = getApiClient();
    let pageId = null;

    try {
        const response = await client.get(`/wp-json/wp/v2/pages`, {
            params: {
                slug: slug,
                _fields: 'id', // Only need the ID
            }
        });

        if (response.data && response.data.length > 0) {
            pageId = response.data[0].id;
            return pageId; // Return the ID directly
        } else {
            // Throw an error if not found, to be caught by the caller
            throw new Error(`Page with slug '${slug}' not found.`);
        }
    } catch (error) {
        // Re-throw the error for the caller to handle
        throw error; // Propagate the error (could be Axios error or the 'not found' error)
    }
}

// --- Export using CommonJS ---
module.exports = {
    createPage,
    getPage,
    updatePage,
    deletePage,
    getPageIdBySlug
}; 