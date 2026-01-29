import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Permission from '../src/generated/models/Permission.js';
import Role from '../src/generated/models/Role.js';

dotenv.config();

async function verify() {
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASS;
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbName = process.env.DB_NAME || 'test';

    let uri = process.env.MONGODB_URI;
    if (!uri) {
        if (dbUser && dbPass) {
            uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;
        } else {
            uri = `mongodb://${dbHost}:27017/${dbName}`;
        }
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    try {
        const roles = await Role.find({}).populate('permissions');
        console.log(`\nFound ${roles.length} roles:`);
        for (const r of roles) {
            console.log(`- ${r.name}: ${r.permissions.length} permissions`);
            // console.log(`  Permissions: ${r.permissions.map((p: any) => p ? p : 'UNKNOWN').join(', ')}`);
        }

        const permissions = await Permission.find({});
        console.log(`\nFound ${permissions.length} permissions total.`);

        // Check hierarchy sample
        const l1 = await Permission.findOne({ name: '系統管理' });
        if (l1) {
            const l2s = await Permission.find({ parentId: l1._id });
            console.log(`\nSample Hierarchy '系統管理' has ${l2s.length} children:`);
            for (const l2 of l2s) {
                const features = await Permission.find({ parentId: l2._id });
                console.log(`  - ${l2.name}: ${features.length} features`);
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
