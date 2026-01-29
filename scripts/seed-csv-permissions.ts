import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Permission from '../src/generated/models/Permission.js';
import Role from '../src/generated/models/Role.js';

dotenv.config();

const rawData = [
    { role: '營運人員', l1: '系統管理', l2: '貨幣管理', feature: '貨幣新增或停用', desc: '', path: '系統管理>貨幣管理' },
    { role: '營運人員', l1: '系統管理', l2: '平台管理', feature: '平台新增或停用', desc: '', path: '系統管理>平台管理' },
    { role: '營運人員', l1: '系統管理', l2: '系統用戶日誌', feature: '查詢異動紀錄', desc: '', path: '系統管理>系統用戶日誌' },
    { role: '營運人員', l1: '後台管理', l2: '總代理管理', feature: '管理總代理', desc: '建立總代\n* 設定所屬平台\n* 配置角色功能權限', path: '後台管理>總代理管理' },
    { role: '營運人員', l1: '後台管理', l2: '代理管理', feature: '代理帳號', desc: '建立代理\n* 設定所屬總代\n* 設定使用幣別\n* 錢包設定', path: '後台管理>代理管理' },
    { role: '營運人員', l1: '後台管理', l2: '角色管理', feature: '管理角色', desc: '建立角色功能, 配置給子帳號和總代', path: '後台管理>角色管理' },
    { role: '營運人員', l1: '後台管理', l2: '子帳號管理', feature: '管理平台代理帳號', desc: '設定子帳號、角色權限', path: '後台管理>子帳號管理' },
    { role: '總代理', l1: '帳號管理', l2: '代理管理', feature: '管理代理帳號', desc: '1. 查看所有代理數據', path: '帳號管理>代理管理' },
    { role: '代理', l1: '帳號管理', l2: '代理管理', feature: '管理代理帳號', desc: '1. 僅查看自己數據', path: '帳號管理>代理管理' },
    { role: '總代理,代理', l1: '帳號管理', l2: '子帳號管理', feature: '管理平台代理帳號', desc: '設定子帳號、角色權限', path: '帳號管理>子帳號管理' },
    { role: '總代理,代理', l1: '帳號管理', l2: '角色管理', feature: '管理角色', desc: '建立角色功能, 配置給子帳號', path: '帳號管理>角色管理' },
    { role: '營運人員,總代理,代理', l1: '帳號管理', l2: '玩家管理', feature: '查詢玩家資訊', desc: '', path: '帳號管理>玩家管理' },
    { role: '營運人員', l1: '遊戲管理', l2: '遊戲設置', feature: '設定遊戲開關和預設值', desc: '遊戲總開關\n預設RTP', path: '遊戲管理>遊戲設置' },
    { role: '營運人員,總代理,代理', l1: '遊戲管理', l2: '遊戲列表', feature: '查看遊戲列表', desc: '營收或當前RTP\n營運可篩選 總代、代理\n總代可篩選代理', path: '遊戲管理>遊戲列表' },
    { role: '營運人員,總代理,代理', l1: '營運管理', l2: '遊戲投注紀錄', feature: '查看遊戲數據歷程', desc: '時間區間\n代理\n遊戲\n幣別\n局號\n會員\n遊戲結果\n結算時間', path: '營運管理>遊戲投注紀錄' },
    { role: '營運人員,總代理', l1: '營運管理', l2: '白名單管理', feature: '白名單管理', desc: '設定各角色可登入白名單', path: '營運管理>白名單管理' },
];

async function seed() {
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
    console.log(`Connected to MongoDB at ${dbHost}/${dbName}`);

    try {
        // 1. Clear existing data
        // await Permission.deleteMany({});
        // await Role.deleteMany({});

        // 2. Process Permissions
        const permissionMap = new Map(); // path -> permissionDoc

        for (const row of rawData) {
            // Create L1 Permission (Module)
            if (!permissionMap.has(row.l1)) {
                const p = await Permission.findOneAndUpdate(
                    { name: row.l1 },
                    { name: row.l1, description: `Module: ${row.l1}`, isValid: true },
                    { upsert: true, new: true }
                );
                permissionMap.set(row.l1, p);
                console.log(`Synced L1: ${row.l1}`);
            }

            // Create L2 Permission (Sub-module/Feature Group)
            const l2Key = `${row.l1}:${row.l2}`;
            if (!permissionMap.has(l2Key)) {
                const parent = permissionMap.get(row.l1);
                const p = await Permission.findOneAndUpdate(
                    { name: l2Key },
                    {
                        name: l2Key,
                        description: row.desc || `Feature: ${row.l2}`,
                        parentId: parent._id,
                        isValid: true
                    },
                    { upsert: true, new: true }
                );
                permissionMap.set(l2Key, p);
                console.log(`Synced L2: ${l2Key} (Parent: ${row.l1})`);
            }

            // Create L3/Action Permission (Specific Capability)
            const featureKey = `${row.l1}:${row.l2}:${row.feature}`;
            const parentL2 = permissionMap.get(l2Key);

            await Permission.findOneAndUpdate(
                { name: featureKey },
                {
                    name: featureKey,
                    description: row.desc,
                    parentId: parentL2._id,
                    isValid: true
                },
                { upsert: true, new: true }
            );
            console.log(`Synced Feature: ${featureKey} (Parent: ${l2Key})`);
        }

        // 3. Process Roles
        const rolePermissions = new Map<string, Set<string>>();

        for (const row of rawData) {
            const roles = row.role.split(/,|、/).map(r => r.trim()).filter(r => r);
            const featureKey = `${row.l1}:${row.l2}:${row.feature}`;

            for (const roleName of roles) {
                if (!rolePermissions.has(roleName)) {
                    rolePermissions.set(roleName, new Set());
                }
                rolePermissions.get(roleName)?.add(featureKey);
            }
        }

        for (const [roleName, perms] of rolePermissions.entries()) {
            const permList = Array.from(perms);
            await Role.findOneAndUpdate(
                { name: roleName },
                {
                    name: roleName,
                    permissions: permList,
                    isValid: true
                },
                { upsert: true, new: true }
            );
            console.log(`Synced Role: ${roleName} with ${permList.length} permissions`);
        }

        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
