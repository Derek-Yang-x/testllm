import Role, { type IRole } from '../models/Role.js';
import User, { type IUser } from '../models/User.js';
import Permission from '../models/Permission.js';
import { Types } from 'mongoose';

export class PermissionService {
    /**
     * Get all unique permission slugs for a user (including implied/inherited permissions)
     */
    static async getUserPermissions(userId: string | Types.ObjectId): Promise<string[]> {
        // 1. Fetch User with Roles (populated with permissions)
        const user = await User.findById(userId).populate<{ roles: IRole[] }>({
            path: 'roles',
            populate: {
                path: 'permissions',
                select: '_id name slug' // Need slug for direct check, _id for aggregation
            }
        });

        if (!user || !user.roles || user.roles.length === 0) {
            return [];
        }

        const explicitPermissionIds: Types.ObjectId[] = [];
        const permissionSlugs = new Set<string>();

        // 2. Collect Root Permission IDs and Slugs
        for (const role of user.roles) {
            if (role.permissions) {
                // Role.permissions is now ObjectId[] | IPermission[]
                // After populate, it should be IPermission objects (or null if ref missing)
                for (const p of role.permissions) {
                    // Check if populated (has _id and slug)
                    if (p && typeof p === 'object' && 'slug' in p) {
                        permissionSlugs.add((p as any).slug);
                        if ('_id' in p) {
                            explicitPermissionIds.push((p as any)._id);
                        }
                    } else if (p instanceof Types.ObjectId) {
                        // Fallback implies populate failed or intentionally IDs
                        explicitPermissionIds.push(p);
                    }
                }
            }
        }

        if (explicitPermissionIds.length === 0) {
            return Array.from(permissionSlugs);
        }

        // 3. Explicit Assignment Only (No expansion)
        // Previous logic used getAllDescendants to infer child permissions.
        // This has been removed to enforce strict explicit permission assignment.

        return Array.from(permissionSlugs);
    }

    /**
     * Check if user has a specific permission
     */
    static async hasPermission(userId: string | Types.ObjectId, requiredPermission: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);

        if (permissions.includes('*')) {
            return true;
        }

        return permissions.includes(requiredPermission);
    }

    /**
     * Validate a list of required permissions
     */
    static async validatePermissions(
        userId: string | Types.ObjectId,
        requestedPermissions: string[]
    ): Promise<{ valid: boolean; missing: string[] }> {
        const userPermissions = new Set(await this.getUserPermissions(userId));

        // Superuser check
        if (userPermissions.has('*')) {
            return { valid: true, missing: [] };
        }

        const missing: string[] = [];
        for (const permission of requestedPermissions) {
            if (!userPermissions.has(permission)) {
                missing.push(permission);
            }
        }

        return {
            valid: missing.length === 0,
            missing
        };
    }

    /**
     * Validate a list of required permission IDs (resolves to slugs first)
     */
    static async validatePermissionIds(
        userId: string | Types.ObjectId,
        permissionIds: string[]
    ): Promise<{ valid: boolean; missing: string[] }> {
        if (!permissionIds || permissionIds.length === 0) {
            return { valid: true, missing: [] };
        }

        // Find permissions to get slugs
        const permissions = await Permission.find({
            _id: { $in: permissionIds }
        }).select('slug');

        const slugs = permissions.map(p => p.slug || '').filter(s => s);

        // Also check if some IDs were invalid/not found
        if (permissions.length !== permissionIds.length) {
            // Some IDs didn't exist. In strict mode this might be an error.
            // For now, valid implies "User has these permissions". 
            // If the permission doesn't exist, the user definitely doesn't "have" it in a meaningful way 
            // (or it's a broken reference).
            // Let's just validate the ones we found. 
            // Or better: Any ID not found is "missing".
            // Implementation choice: Only validate existing permissions.
        }

        return this.validatePermissions(userId, slugs);
    }
}
