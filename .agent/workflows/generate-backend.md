---
description: "Generate Backend Code (Model/API) using Skills directly"
---

1. **Check Environment**:
   - Run the environment check script to determine `DB_TYPE`:
     ```bash
     node -r dotenv/config -e 'console.log(JSON.stringify({ DB_TYPE: process.env.DB_TYPE || "mysql" }))'
     ```
   - This script returns a JSON object. Parse it to find `DB_TYPE`.

3. **Execute Skill**:
   - If `DB_TYPE=mongo`: Use the `mongoose-generator` skill to fulfill the request.
   - If `DB_TYPE=mysql`: Use the `sequelize-generator` skill to fulfill the request.
