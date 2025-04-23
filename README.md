# Elementor MCP Server

This is a simple MCP server for Elementor. It is used to perform CRUD operations on the Elementor data for a given page.

## Installation

Configure the MCP server in your `mcp.json` file. Note the environment variables are required.
* WP_URL: The URL of the target website.
* WP_APP_USER: The username of the target website. Note: it's the username to login the target website, not the application name.
* WP_APP_PASSWORD: The application password of the target website, keep the space. You can create one in the target website's WordPress dashboard, see [Generating Manually Section in this page](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/).

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