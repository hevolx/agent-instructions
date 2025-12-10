<detect_provider>
  <check_remote_url>git remote get-url origin</check_remote_url>
  <identify_host>
    - github.com → GitHub
    - gitlab.com → GitLab
    - bitbucket.org → Bitbucket
    - Other → Ask user
  </identify_host>
</detect_provider>
<check_available_tools>
  <list_mcp_servers>Check which git-hosting MCP servers are available (github, gitlab, etc.)</list_mcp_servers>
  <check_cli>Check if gh/glab CLI is available as fallback</check_cli>
</check_available_tools>
<select_tool>
  <if_single_mcp>If only one relevant MCP available, confirm with user</if_single_mcp>
  <if_multiple>Let user choose which tool to use</if_multiple>
  <if_told_earlier>If user specified tool earlier in conversation, use that without asking again</if_told_earlier>
  <store_as>$GIT_HOST_TOOL (e.g., "github_mcp", "gitlab_mcp", "gh_cli")</store_as>
</select_tool>
