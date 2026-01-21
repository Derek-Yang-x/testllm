---
description: Check recent Jira issues assigned to the current user
---

1. Check environment variables
   ```bash
   if [ -z "$JIRA_URL" ] || [ -z "$JIRA_API_TOKEN" ]; then
       echo "Error: JIRA_URL and JIRA_API_TOKEN must be set."
       echo "Please export them in your shell."
       exit 1
   fi
   ```

2. Query Jira API and display results
   ```bash
   # Queries the Jira API via the local MCP server
   mcp run project-server custom_jira_search '{"jql": "assignee=currentUser() ORDER BY updated DESC"}' \
   | python3 -c "
   import sys, json
   try:
       data = json.load(sys.stdin)
       # MCP output structure: {'content': [{'type': 'text', 'text': '...'}]}
       # Inside 'text' is the JSON array of issues we formatted in the server
       
       if 'content' in data and len(data['content']) > 0:
           inner_text = data['content'][0]['text']
           try:
               issues = json.loads(inner_text)
               print(f'{'KEY':<12} {'STATUS':<12} {'SUMMARY'}')
               print('-' * 80)
               for issue in issues:
                   print(f'{issue['key']:<12} {issue['status']:<12} {issue['summary']}')
           except json.JSONDecodeError:
               print('Error decoding issue list from MCP response:')
               print(inner_text)
       else:
           print('No content received from MCP server.')
           print(data)

   except Exception as e:
       print('Error parsing response from MCP server:')
       print(e)
   "
   ```
