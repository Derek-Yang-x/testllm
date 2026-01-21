---
description: Get details of a specific Jira issue (requires ISSUE_KEY env var)
---

1. Check environment variables
   ```bash
   if [ -z "$JIRA_URL" ] || [ -z "$JIRA_API_TOKEN" ]; then
       echo "Error: JIRA_URL and JIRA_API_TOKEN must be set."
       exit 1
   fi
   
   if [ -z "$ISSUE_KEY" ]; then
       echo "Error: ISSUE_KEY environment variable is not set."
       echo "Usage: export ISSUE_KEY=TCG-123; /get-jira-issue"
       exit 1
   fi
   ```

2. Fetch and display issue details
   ```bash
   # Queries the Jira API via the local MCP server
   mcp run project-server custom_jira_get_issue "{\"issueKey\": \"$ISSUE_KEY\"}" \
   | python3 -c "
   import sys, json
   
   try:
       data = json.load(sys.stdin)
       # MCP output: {'content': [{'type': 'text', 'text': '...'}]}
       
       if 'content' in data and len(data['content']) > 0:
           inner_text = data['content'][0]['text']
           try:
               simple_issue = json.loads(inner_text)
               
               key = simple_issue.get('key', 'Unknown')
               summary = simple_issue.get('summary', 'No Summary')
               status = simple_issue.get('status', 'Unknown')
               description = simple_issue.get('description', 'No Description')
               assignee_name = simple_issue.get('assignee', 'Unassigned')
               
               print(f'\n{'='*80}')
               print(f'[{key}] {summary}')
               print(f'{'='*80}')
               print(f'Status:   {status}')
               print(f'Assignee: {assignee_name}')
               print(f'{'-'*80}')
               print('Description:')
               print(description if description else 'No Description')
               print(f'{'='*80}\n')
               
               comments = simple_issue.get('comments', [])
               if comments:
                   print(f'Latest Comments ({len(comments)} total):')
                   print(f'{'-'*80}')
                   for comment in comments:
                       author = comment.get('author', 'Unknown')
                       body = comment.get('body', '')
                       created = comment.get('created', '')
                       print(f'[{created}] {author}:')
                       print(body)
                       print(f'{'-'*40}')
                       
           except json.JSONDecodeError as e:
               print(f'Error decoding issue details from MCP response: {e}')
               print(inner_text)
       else:
           print('No content received from MCP server.')
           print(data)
           
   except Exception as e:
       print(f'Error processing response: {e}')
   "
   ```
