---
description: Generate Backend and Frontend code based on a Jira Issue Key.
---

1. **Check Environment**: Ensure `ISSUE_KEY` is set.
   ```bash
   if [ -z "$ISSUE_KEY" ]; then
       echo "Error: ISSUE_KEY must be set."
       exit 1
   fi
   ```

3. **Fetch Issue Details**:
   - Use the `jira-assistant` skill to get the details of the issue.
   - Command: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts get "$ISSUE_KEY"`

4. **Generate Backend**:
   - Instruction: "Based *specifically* on the Jira issue details retrieved in the previous step, execute the `.agent/workflows/generate-backend.md` workflow."

5. **Generate Frontend**:
   - Instruction: "Based on the Jira issue details and the backend code just generated, execute the `.agent/workflows/generate-frontend.md` workflow."
