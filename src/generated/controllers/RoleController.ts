import type { Request, Response, NextFunction } from 'express';
import Role from '../models/Role.js';
import { PermissionService } from '../services/PermissionService.js';

export class RoleController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.permissions && req.body.permissions.length > 0) {
                const userId = (req as any).user?._id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                const validation = await PermissionService.validatePermissions(userId, req.body.permissions);
                if (!validation.valid) {
                    return res.status(403).json({
                        message: 'Insufficient permissions to assign the requested permissions',
                        missingPermissions: validation.missing
                    });
                }
            }

            const role = await Role.create(req.body);
            res.status(201).json(role);
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const roles = await Role.find({ isValid: true })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Role.countDocuments({ isValid: true });

            res.json({
                data: roles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async findOne(req: Request, res: Response, next: NextFunction) {
        try {
            const role = await Role.findById(req.params.id);
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.json(role);
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.permissions) {
                const userId = (req as any).user?._id;
                if (!userId) return res.status(401).json({ message: 'Unauthorized' });

                const existingRole = await Role.findById(req.params.id);
                if (!existingRole) return res.status(404).json({ message: 'Role not found' });

                const newPermissions = req.body.permissions.filter(
                    (p: string) => !existingRole.permissions.includes(p)
                );

                if (newPermissions.length > 0) {
                    const validation = await PermissionService.validatePermissions(userId, newPermissions);
                    if (!validation.valid) {
                        return res.status(403).json({
                            message: 'Insufficient permissions to assign the requested permissions',
                            missingPermissions: validation.missing
                        });
                    }
                }
            }

            const role = await Role.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.json(role);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const role = await Role.findByIdAndUpdate(
                req.params.id,
                { isValid: false },
                { new: true }
            );
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.json({ message: 'Role deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async assignPermissions(req: Request, res: Response, next: NextFunction) {
        try {
            const { permissions } = req.body;

            const userId = (req as any).user?._id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const existingRole = await Role.findById(req.params.id);
            if (!existingRole) return res.status(404).json({ message: 'Role not found' });

            const newPermissions = permissions.filter(
                (p: string) => !existingRole.permissions.includes(p)
            );

            if (newPermissions.length > 0) {
                const validation = await PermissionService.validatePermissions(userId, newPermissions);
                if (!validation.valid) {
                    return res.status(403).json({
                        message: 'Insufficient permissions to assign the requested permissions',
                        missingPermissions: validation.missing
                    });
                }
            }

            const role = await Role.findByIdAndUpdate(
                req.params.id,
                { permissions },
                { new: true, runValidators: true }
            );
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.json(role);
        } catch (error) {
            next(error);
        }
    }
}
