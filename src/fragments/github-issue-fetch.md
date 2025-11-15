Try to fetch the issue using GitHub MCP (mcp__github__issue_read tool).

If GitHub MCP is not configured, show:
```
GitHub MCP not configured!
See: https://github.com/modelcontextprotocol/servers/tree/main/src/github
Trying GitHub CLI fallback...
```

Then try using `gh issue view [ISSUE_NUMBER] --json` as fallback.
