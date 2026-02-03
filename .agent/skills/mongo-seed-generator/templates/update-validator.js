/**
 * MongoDB Script: Update (collMod) Schema Validation
 * Collection: [Collection Name]
 * Usage: mongosh "mongodb://..." scripts/[filename].js
 */

use('[Database Name]');

// Update existing collection's validator
// Useful for adding new fields or adding constraints (min/max)

db.runCommand({
    collMod: "[Collection Name]",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            additionalProperties: false, // Strict mode
            required: ['_id', /* ... Add required fields here ... */ 'createdAt', 'updatedAt'],
            properties: {
                _id: { bsonType: "objectId" },

                // Define your fields here:
                // [Field Name]: { bsonType: "[Type]", description: "..." },

                // Example: Adding constraints
                // age: {
                //   bsonType: "int",
                //   minimum: 18,   
                //   maximum: 100,  
                //   description: "Age must be between 18 and 100"
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

print("Validator for '[Collection Name]' updated successfully.");
