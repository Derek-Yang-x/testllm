---
name: jira-assistant
description: Interact with Jira to search for issues, get details, and manage tasks.
---

# Jira Assistant Skill

This skill allows you to interact with Jira using a local helper script.

## Instructions

### 1. Environment Setup

Before running commands, ensure environment variables are set.
- `JIRA_URL`: Base URL (e.g., `https://jira.tc-gaming.co`)
- `JIRA_API_TOKEN`: Bearer token

### 2. Searching for Issues

To search, use the helper script with the `search` command.

*   **My Issues**:
    *   **Command**: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts search "assignee=currentUser() ORDER BY updated DESC"`

*   **Custom Search**:
    *   **Command**: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts search "$JQL"`

### 3. Getting Issue Details

To get details, use the helper script with the `get` command.

*   **Get Issue**:
    *   **Command**: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts get "$ISSUE_KEY"`

## Examples

**User**: "Check my issues"
**Action**: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts search "assignee=currentUser() ORDER BY updated DESC"`

**User**: "What is TCG-123 about?"
**Action**: `npx tsx .agent/skills/jira-assistant/scripts/jira.ts get "TCG-123"`
