import Role, { type IRole } from '../models/Role.js';
import User, { type IUser } from '../models/User.js';
import { Types } from 'mongoose';

export class PermissionService {
    static async getUserPermissions(userId: string | Types.ObjectId): Promise<string[]> {
        const user = await User.findById(userId).populate<{ roles: IRole[] }>('roles');

        if (!user || !user.roles) {
            return [];
        }

        const explicitPermissions = new Set<string>();

        for (const role of user.roles) {
            if (role.permissions) {
                role.permissions.forEach(p => explicitPermissions.add(p));
            }
        }

        return this.expandPermissions(Array.from(explicitPermissions));
    }

    private static async expandPermissions(rootNames: string[]): Promise<string[]> {
        const { default: Permission } = await import('../models/Permission.js');

        if (rootNames.length === 0) return [];

        const allPermissions = await Permission.find({ isValid: true }).select('name parentId');

        const childrenMap = new Map<string, typeof allPermissions>();
        const permByName = new Map<string, typeof allPermissions[0]>();

        for (const p of allPermissions) {
            permByName.set(p.name, p);
            if (p.parentId) {
                const pid = p.parentId.toString();
                if (!childrenMap.has(pid)) {
                    childrenMap.set(pid, []);
                }
                childrenMap.get(pid)?.push(p);
            }
        }

        const resultSet = new Set<string>(rootNames);
        const stack: typeof allPermissions = [];

        for (const name of rootNames) {
            const p = permByName.get(name);
            if (p) stack.push(p);
        }

        const visitedIds = new Set<string>();

        while (stack.length > 0) {
            const current = stack.pop()!;
            const currentId = current._id.toString();

            if (visitedIds.has(currentId)) continue;
            visitedIds.add(currentId);

            resultSet.add(current.name);

            const children = childrenMap.get(currentId);
            if (children) {
                for (const child of children) {
                    stack.push(child);
                }
            }
        }

        return Array.from(resultSet);
    }

    static async hasPermission(userId: string | Types.ObjectId, requiredPermission: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);

        if (permissions.includes('*')) {
            return true;
        }

        return permissions.includes(requiredPermission);
    }

    static async validatePermissions(
        userId: string | Types.ObjectId,
        requestedPermissions: string[]
    ): Promise<{ valid: boolean; missing: string[] }> {
        const userPermissions = await this.getUserPermissions(userId);

        if (userPermissions.includes('*')) {
            return { valid: true, missing: [] };
        }

        const missing: string[] = [];
        for (const permission of requestedPermissions) {
            if (!userPermissions.includes(permission)) {
                missing.push(permission);
            }
        }

        return {
            valid: missing.length === 0,
            missing
        };
    }
}
