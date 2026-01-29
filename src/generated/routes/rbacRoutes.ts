import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/PermissionService.js';
import User from '../models/User.js';

const router = Router();

router.post('/users/:userId/roles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roles } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { roles },
            { new: true, runValidators: true }
        ).populate('roles');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

router.get('/users/:userId/permissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const permissions = await PermissionService.getUserPermissions(req.params.userId);
        res.json({ permissions });
    } catch (error) {
        next(error);
    }
});

router.post('/users/:userId/permissions/check', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { permission } = req.body;
        const hasPermission = await PermissionService.hasPermission(req.params.userId, permission);
        res.json({ hasPermission });
    } catch (error) {
        next(error);
    }
});

router.get('/users/:userId/assignable-permissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const permissions = await PermissionService.getUserPermissions(req.params.userId);
        res.json({ permissions });
    } catch (error) {
        next(error);
    }
});

export default router;
