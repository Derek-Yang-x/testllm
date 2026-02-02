import { Router } from 'express';
import roleRoutes from './roleRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import rbacRoutes from './rbacRoutes.js';
import authRoutes from './authRoutes.js';

export const generatedRoutes = Router();

generatedRoutes.use('/roles', roleRoutes);
generatedRoutes.use('/permissions', permissionRoutes);
generatedRoutes.use('/rbac', rbacRoutes);
generatedRoutes.use('/auth', authRoutes);
