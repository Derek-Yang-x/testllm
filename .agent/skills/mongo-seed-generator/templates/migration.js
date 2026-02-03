/**
 * MongoDB Script: Data Migration
 * Changes: [Description of Change, e.g., Rename field 'foo' to 'bar']
 * Collection: [Collection Name]
 * Usage: npm run db:exec src/generated/scripts/db/[filename].js
 */

use('[Database Name]');

print("Starting migration: [Description] in '[Collection Name]' collection...");

// 1. Check if any documents need migration
// Ideally, target documents that have the OLD state but NOT the NEW state
const queryFilter = {
    // Example: { oldField: { $exists: true } }
    // [Query Filter]
};

const countToMigrate = db.getCollection('[Collection Name]').countDocuments(queryFilter);

if (countToMigrate > 0) {
    print("Found " + countToMigrate + " documents to migrate.");

    // 2. Perform Migration
    const result = db.getCollection('[Collection Name]').updateMany(
        queryFilter,
        {
            // Example: { $rename: { "oldField": "newField" } }
            // Example: { $set: { "newField": "defaultValue" }, $unset: { "oldField": "" } }
            // [Update Operation]
        }
    );

    print("Migration completed.");
    print("Matched: " + result.matchedCount);
    print("Modified: " + result.modifiedCount);

} else {
    print("No documents found needing migration. Skipped or already applied.");
}

// 3. Verification
// Run the query again to ensure count is 0
const countRemaining = db.getCollection('[Collection Name]').countDocuments(queryFilter);

if (countRemaining === 0) {
    print("Verification SUCCESS: No documents remain to be migrated.");
} else {
    print("Verification WARNING: " + countRemaining + " documents still match the old criteria.");
}
