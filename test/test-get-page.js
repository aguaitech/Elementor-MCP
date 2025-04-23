// Test script to get a specific page by slug
// import 'dotenv/config'; // Don't use this if calling config() manually
const dotenv = require('dotenv'); // Import the dotenv object
const path = require('path'); // Import path using require
// No need for fileURLToPath in CommonJS
const { initializeApiClient } = require('../src/auth'); // Use require, no .js
const { getPage, getPageIdBySlug } = require('../src/wp-api'); // Use require, no .js

// Standard CommonJS __dirname works directly
dotenv.config({ path: path.resolve(__dirname, '.test.env') });

const TARGET_SLUG = process.env.TARGET_SLUG;

async function runTest() {
    if (!TARGET_SLUG) {
        console.error("Error: TARGET_SLUG not set in .test.env file.");
        process.exit(1);
    }
    try {
        console.log("Initializing API client...");
        await initializeApiClient(); // Authenticate using .env credentials
        // No need for client directly here if only using wp-api functions
        console.log("API client initialized.");

        // 1. Find the page ID by slug using the shared function
        console.log(`Searching for page ID with slug: ${TARGET_SLUG}...`);
        let pageId = null;
        try {
            pageId = await getPageIdBySlug(TARGET_SLUG);
             // Log is already handled inside getPageIdBySlug
        } catch (error) {
             // Error logging is already handled inside getPageIdBySlug
            console.error(`Test script cannot continue: Failed to get Page ID for slug '${TARGET_SLUG}'.`);
            return; // Exit on error
        }

        // 2. Get the full page data using the found ID
        console.log(`\nFetching full page data for ID: ${pageId}...`);
        const pageData = await getPage(pageId); // Use our existing function

        console.log(`\n--- Page Data for ID ${pageId} ---`);
        console.log(`Title: ${pageData.title?.rendered}`);
        console.log(`Status: ${pageData.status}`);
        console.log(`Link: ${pageData.link}`);

        // Attempt to parse and display Elementor data
        if (pageData.meta && pageData.meta._elementor_data) {
            console.log("\n--- Elementor Data (Parsed) ---");
            try {
                const elementorJson = JSON.parse(pageData.meta._elementor_data);
                // Pretty print the JSON structure
                console.log(JSON.stringify(elementorJson, null, 2)); 
            } catch (e) {
                console.error("Could not parse Elementor JSON string:", e.message);
                console.log("Raw Elementor Data String:", pageData.meta._elementor_data);
            }
        } else {
            console.log("\nNo Elementor data found in page meta.");
        }

        // Optionally log the entire page object for debugging
        // console.log("\n--- Full Page Object ---");
        // console.log(JSON.stringify(pageData, null, 2));

    } catch (error) {
        console.error("\nTest script failed:", error.message || error);
         if (error.response) { // Log Axios error details if available
             console.error("Response Status:", error.response.status);
             console.error("Response Data:", error.response.data);
         }
        process.exit(1);
    }
}

runTest(); 