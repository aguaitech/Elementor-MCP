// Test script to get a specific page by slug
// import 'dotenv/config'; // Don't use this if calling config() manually
const dotenv = require("dotenv"); // Import the dotenv object
const path = require("path"); // Import path using require
// No need for fileURLToPath in CommonJS
const { initializeApiClient } = require("../src/auth"); // Use require, no .js
const { updatePage } = require("../src/wp-api"); // Use require, no .js
const fs = require("fs");

dotenv.config({ path: path.resolve(__dirname, ".test.env") });

const TARGET_PAGE_ID = process.env.TARGET_ID;
const ELEMENTOR_DATA = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `${TARGET_FILE}`), "utf8")
).meta._elementor_data;

async function runTest() {
  await initializeApiClient();
  const updatedPage = await updatePage(TARGET_PAGE_ID, {
    elementor_data: ELEMENTOR_DATA,
  });
  console.log(updatedPage);
}

runTest();
