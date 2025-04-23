#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { initializeApiClient } = require("./auth");
const {
  createPage,
  getPage,
  updatePage,
  deletePage,
  getPageIdBySlug,
} = require("./wp-api");
const fs = require("fs");

// Wrap server start in an async function to allow await for initialization
async function main() {
  try {
    // --- Initialize Server ---
    const server = new McpServer({
      name: "WordPressElementorMCP",
      version: "1.0.0",
      description:
        "Provides tools to interact with WordPress pages and Elementor data.", // Optional description
    });

    // Initialize the API client (handles authentication)
    await initializeApiClient();

    // --- Define Tools ---

    server.tool(
      "create_page",
      "Creates a new page in WordPress with Elementor data, it will return the created page ID.",
      {
        // Input Schema: Use plain object with Zod types
        title: z.string().describe("The title for the new page (required)."),
        status: z
          .enum(["publish", "future", "draft", "pending", "private"])
          .optional()
          .describe(
            "The status for the page (e.g., 'publish', 'draft'). Defaults to 'draft' on create."
          ),
        content: z
          .string()
          .optional()
          .describe("The standard WordPress content for the page (optional)."),
        elementor_data: z
          .string()
          .describe(
            "The Elementor page data as a JSON string (required for create)."
          ),
      },
      async (input) => {
        // Handler function
        const newPage = await createPage(input);
        // Return the result object directly
        return {
          content: [
            {
              type: "text",
              text: `${newPage.id}`,
            },
          ],
        };
        // Errors thrown here will be handled by McpServer
      }
    );

    server.tool(
      "get_page",
      "Retrieves a specific page from WordPress by its ID, including meta fields like _elementor_data.",
      {
        // Input Schema
        pageId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the page to retrieve."),
      },
      async (input) => {
        // Handler
        const pageData = await getPage(input.pageId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(pageData),
            },
          ],
        };
      }
    );

    server.tool(
      "download_page_to_file",
      "Downloads a specific page from WordPress by its ID, including meta fields like _elementor_data, and saves it to a file.",
      {
        pageId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the page to download."),
        filePath: z
          .string()
          .describe(
            "The path to save the file to, have to be the absolute path."
          ),
        onlyElementorData: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Whether to only save the _elementor_data field to the file, defaults to false."
          ),
      },
      async (input) => {
        const pageData = await getPage(input.pageId);
        if (input.onlyElementorData) {
          fs.writeFileSync(
            input.filePath,
            JSON.stringify(pageData.meta._elementor_data, null, 0)
          );
        } else {
          fs.writeFileSync(input.filePath, JSON.stringify(pageData, null, 0));
        }
        return {
          content: [{ type: "text", text: "true" }],
        };
      }
    );

    server.tool(
      "update_page",
      "Updates an existing page in WordPress with Elementor data, it will return a boolean value to indicate if the update was successful.",
      {
        // Input Schema: Use plain object with Zod types
        pageId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the page to update."),
        title: z.string().optional().describe("The title for the page."),
        status: z
          .enum(["publish", "future", "draft", "pending", "private"])
          .optional()
          .describe("The status for the page (e.g., 'publish', 'draft')."),
        content: z
          .string()
          .optional()
          .describe("The standard WordPress content for the page (optional)."),
        elementor_data: z
          .string()
          .optional()
          .describe(
            "The Elementor page data as a JSON string. Optional for update."
          ),
      },
      async (input) => {
        // Handler
        const { pageId, ...updateData } = input;
        // Basic validation, although schema handles optionality
        if (Object.keys(updateData).length === 0) {
          throw new Error(
            "No update data provided (title, status, content, or elementor_data)."
          );
        }
        await updatePage(pageId, updateData);
        return {
          content: [
            {
              type: "text",
              text: "true",
            },
          ],
        };
      }
    );

    server.tool(
      "update_page_from_file",
      "Updates an existing page in WordPress with Elementor data from a file, it will return a boolean value to indicate if the update was successful.",
      {
        pageId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the page to update."),
        title: z.string().optional().describe("The title for the page."),
        status: z
          .enum(["publish", "future", "draft", "pending", "private"])
          .optional()
          .describe("The status for the page (e.g., 'publish', 'draft')."),
        contentFilePath: z
          .string()
          .optional()
          .describe(
            "The absolute path to the file to update the WordPress content from, optional."
          ),
        elementorFilePath: z
          .string()
          .describe("The absolute path to the file to update the Elementor data from."),
      },
      async (input) => {
        const pageData = JSON.parse(
          fs.readFileSync(input.elementorFilePath, "utf8")
        );
        let contentData = null;
        if (input.contentFilePath) {
          contentData = fs.readFileSync(input.contentFilePath, "utf8");
        }
        await updatePage(input.pageId, {
          title: input.title,
          status: input.status,
          content: contentData,
          elementor_data: JSON.stringify(pageData, null, 0),
        });
        return {
          content: [{ type: "text", text: "true" }],
        };
      }
    );

    server.tool(
      "delete_page",
      "Deletes a specific page from WordPress, it will return a boolean value to indicate if the deletion was successful.",
      {
        // Input Schema: Use plain object with Zod types
        pageId: z
          .number()
          .int()
          .positive()
          .describe("The ID of the page to delete."),
        force: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Whether to bypass the trash and force deletion. Defaults to false."
          ),
      },
      async (input) => {
        // Handler
        await deletePage(input.pageId, input.force);
        return {
          content: [
            {
              type: "text",
              text: "true",
            },
          ],
        };
      }
    );

    server.tool(
      "get_page_id_by_slug",
      "Retrieves the ID of a specific WordPress page by its slug.",
      {
        // Input Schema
        slug: z
          .string()
          .describe("The slug (URL-friendly name) of the page to find."),
      },
      async (input) => {
        // Handler
        const pageId = await getPageIdBySlug(input.slug);
        return {
          content: [
            {
              type: "text",
              text: `${pageId}`,
            },
          ],
        };
      }
    );

    // --- Connect Server to Transport ---
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    process.exit(1); // Exit if initialization fails
  }
}

// Execute the main function
main();
