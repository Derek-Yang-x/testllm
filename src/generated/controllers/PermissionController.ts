import type { Request, Response, NextFunction } from 'express';
import Permission from '../models/Permission.js';

export class PermissionController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const permission = await Permission.create(req.body);
            res.status(201).json(permission);
        } catch (error) {
            next(error);
        }
    }

    static async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const permissions = await Permission.find({ isValid: true })
                .populate('parentId', 'name description')
                .skip(skip)
                .limit(limit)
                .sort({ name: 1 })
                .lean();

            const total = await Permission.countDocuments({ isValid: true });

            res.json({
                data: permissions,
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
            const permission = await Permission.findById(req.params.id)
                .populate('parentId', 'name description')
                .populate('children')
                .lean();

            if (!permission) {
                return res.status(404).json({ message: 'Permission not found' });
            }
            res.json(permission);
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const permission = await Permission.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!permission) {
                return res.status(404).json({ message: 'Permission not found' });
            }
            res.json(permission);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const permission = await Permission.findByIdAndUpdate(
                req.params.id,
                { isValid: false },
                { new: true }
            );
            if (!permission) {
                return res.status(404).json({ message: 'Permission not found' });
            }
            res.json({ message: 'Permission deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async getDescendants(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params.id) {
                return res.status(400).json({ message: 'Permission ID is required' });
            }
            const descendants = await Permission.getAllDescendants(req.params.id);
            res.json({ descendants });
        } catch (error) {
            next(error);
        }
    }

    static async getHierarchy(req: Request, res: Response, next: NextFunction) {
        try {
            const rootPermissions = await Permission.find({
                parentId: null,
                isValid: true
            }).populate('children').lean();

            res.json(rootPermissions);
        } catch (error) {
            next(error);
        }
    }
}
