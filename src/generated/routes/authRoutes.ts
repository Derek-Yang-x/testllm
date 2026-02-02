
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);

// Protected routes
// Note: We need a middleware to verify JWT and populate req.user
// For now, I will assume we might need to create one or reuse existing if appropriate
// The current project seems to rely on some generated/custom auth. 
// I'll create a simple middleware if needed in AuthService or use a placeholder.
// Looking at `src/llm.ts`, it might not have what we need. 
// I'll implement a middleware in a new file `src/generated/middleware/auth.ts` later or inline it.

// verifyToken imported at top

router.post('/change-password', verifyToken, AuthController.changePassword);
router.post('/logout', verifyToken, AuthController.logout);

export default router;
