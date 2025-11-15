<step_0>
  <description>Validate MCP dependencies</description>
  <check_github_mcp>
    <requirement>GitHub MCP server must be configured</requirement>
    <fallback>If unavailable, use `gh` CLI commands</fallback>
    <validation>
      - Try listing available MCP resources
      - If GitHub MCP not found, switch to CLI fallback
      - Inform user about MCP configuration if needed
    </validation>
  </check_github_mcp>
  <error_handling>
    If MCP validation fails:
    - Show clear error message
    - Provide setup instructions
    - Fallback to CLI if possible
  </error_handling>
  <purpose>Ensure required MCP dependencies are available before proceeding</purpose>
</step_0>
