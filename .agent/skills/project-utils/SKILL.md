---
name: project-utils
description: Utilities for project configuration and setup.
---
# Project Utils Skill

This skill provides utility scripts for checking project configuration and setting up environments.

## Instructions

- **Check Environment**:
  Run the environment check script to get project configuration (like DB_TYPE):
  ```bash
  node -r dotenv/config -e 'console.log(JSON.stringify({ DB_TYPE: process.env.DB_TYPE || "mysql" }))'
  ```

- **Ensure Directories**:
  Run the directory setup script to ensure standard generated paths exist:
  ```bash
  npx tsx .agent/skills/project-utils/scripts/ensure-dirs.ts
  ```
