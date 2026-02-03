/**
 * MongoDB Script: Create Collection with Strict Schema Validation
 * Collection: [Collection Name]
 * Usage: mongosh "mongodb://..." scripts/[filename].js
 */

use('[Database Name]');

// Create collection with strict validation
// This ensures that all documents MUST follow the schema
// and no unknown fields ('additionalProperties: false') are allowed.

db.createCollection("[Collection Name]", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            additionalProperties: false, // Strict mode: rejects unknown fields
            required: ['_id', /* ... Add required fields here ... */ 'createdAt', 'updatedAt'],
            properties: {
                _id: { bsonType: "objectId" },

                // Define your fields here:
                // [Field Name]: { 
                //   bsonType: "[Type]", // string, int, double, bool, date, object, array, etc.
                //   description: "[Description]"
                // },

                createdAt: {
                    bsonType: "date",
                    description: "Created Date"
                },
                isValid: {
                    bsonType: "bool",
                    description: "Is Valid (Active)"
                },
                updatedAt: {
                    bsonType: "date",
                    description: "Updated Date"
                },
                __v: { bsonType: "int" } // Mongoose version key (Required for strict mode)
            }
        }
    }
});

print("Collection '[Collection Name]' created with strict validator.");
