import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

interface TokenPayload extends jwt.JwtPayload {
    userId: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export class AuthMiddleware {
    /**
     * Authenticate user via JWT in Authorization header
     */
    static async authenticate(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET not defined');
                return res.status(500).json({ message: 'Server error' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as TokenPayload;

            // Fetch user from DB
            const user = await User.findById(decoded.userId)
                .populate({
                    path: 'roles',
                    populate: { path: 'permissions' }
                })
                .lean();

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if user is active/valid
            if (user.isValid === false) {
                return res.status(401).json({ message: 'User account is inactive' });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            // Token expired or invalid
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    }
}
