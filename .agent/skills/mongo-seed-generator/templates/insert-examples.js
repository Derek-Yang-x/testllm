/**
 * MongoDB Script: Insertion Examples (Strict Schema)
 * Collection: [Collection Name]
 * Usage: mongosh "mongodb://..." scripts/[filename].js
 */

use('[Database Name]');

// Check if running on a Replica Set (required for transactions)
const isReplicaSet = !!db.runCommand({ hello: 1 }).setName;

if (isReplicaSet) {
    print('Replica Set detected. Running with Transaction support.');
    runWithTransaction();
} else {
    print('Standalone detected. Running WITHOUT Transaction support.');
    runWithoutTransaction();
}

/**
 * Main Logic
 */
function runLogic(dbTarget) {
    const coll = dbTarget.getCollection('[Collection Name]');

    print("Attempting valid insertion...");

    // 1. Successful Insertion Example
    const validResult = coll.insertMany([
        {
            // [Field Name]: [Valid Value],
            // ...
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
    print("Valid insertion success (Pending Commit): " + validResult.insertedIds[0]);


    print("\nAttempting invalid insertion (Extra Field)...");
    print("NOTE: If this fails inside a Transaction, the valid insertion above will be ROLLED BACK.");

    // 2. Failed Example: Extra field not in schema
    // We do NOT try-catch here if we want the transaction to abort automatically.
    // Or we catch, print, and RE-THROW to trigger abort.
    try {
        coll.insertMany([
            {
                // [Field Name]: [Valid Value],
                // ...
                createdAt: new Date(),
                updatedAt: new Date(),

                // Test Strict Schema:
                extraField: "not allowed" // <--- This will cause failure
            }
        ]);
    } catch (e) {
        print("Invalid insertion failed as expected!");
        print("Error: " + e.message);
        throw e; // Rethrow to ABORT transaction
    }
}

// === Runners ===

function runWithTransaction() {
    const session = db.getMongo().startSession();
    try {
        session.withTransaction(() => {
            const dbInSession = session.getDatabase('[Database Name]');
            runLogic(dbInSession);
        });
        print('Transaction Committed Successfully!');
    } catch (e) {
        print('Transaction Aborted (Rolled Back).');
    } finally {
        session.endSession();
    }
}

function runWithoutTransaction() {
    try {
        runLogic(db);
        print('Script Completed (Partial data may remain if errors occurred).');
    } catch (e) {
        print('Script Failed.');
        print('Error Message: ' + e.message);
        print('Full Error: ' + JSON.stringify(e));
    }
}
