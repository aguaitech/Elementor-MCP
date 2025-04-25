# Elementor MCP Server

[![smithery badge](https://smithery.ai/badge/@aguaitech/Elementor-MCP)](https://smithery.ai/server/@aguaitech/Elementor-MCP)

> We recommand you to use [this template project](https://github.com/aguaitech/Elementor_Project_Workflow) to manage your Elementor project.

This is a simple MCP server for Elementor. It is used to perform CRUD operations on the Elementor data for a given page.

## Installation

### Installing via Smithery

To install Elementor MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@aguaitech/Elementor-MCP):

```bash
npx -y @smithery/cli install @aguaitech/Elementor-MCP --client claude
```

### MacOS / Linux

```json
{
  "mcpServers": {
    "Elementor MCP": {
      "command": "npx",
      "args": ["-y", "elementor-mcp"],
      "env": {
        "WP_URL": "https://url.of.target.website",
        "WP_APP_USER": "wordpress_username",
        "WP_APP_PASSWORD": "Appl icat ion_ Pass word"
      }
    }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "Elementor MCP": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "elementor-mcp"],
      "env": {
        "WP_URL": "https://url.of.target.website",
        "WP_APP_USER": "wordpress_username",
        "WP_APP_PASSWORD": "Appl icat ion_ Pass word"
      }
    }
  }
}
```

## License

This project is licensed under the MIT License
