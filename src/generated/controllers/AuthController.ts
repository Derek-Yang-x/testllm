
import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { AuthService } from '../services/AuthService.js';
import { EmailService } from '../services/EmailService.js';

export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // We need to select password and tempPassword explicitly as they are select: false
            const user = await User.findOne({ email, isValid: true }).select('+password +tempPassword');
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check lock
            if (user.lockUntil && user.lockUntil > new Date()) {
                return res.status(403).json({ message: 'Account locked due to too many failed attempts' });
            }

            let isValidPassword = false;
            let isTempPassword = false;

            // Check permanent password first
            if (user.password) {
                isValidPassword = await AuthService.comparePassword(password, user.password);
            }

            // If not valid permanent, check temp password
            if (!isValidPassword && user.tempPassword && user.tempPasswordExpiresAt) {
                if (user.tempPasswordExpiresAt > new Date()) {
                    isValidPassword = await AuthService.comparePassword(password, user.tempPassword);
                    if (isValidPassword) isTempPassword = true;
                }
            }

            if (!isValidPassword) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                // Simple lock policy: 5 attempts
                if (user.loginAttempts >= 5) {
                    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
                }
                await user.save();
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Reset login attempts
            user.loginAttempts = 0;
            // user.lockUntil = undefined; // Causing lint error with exactOptionalPropertyTypes
            user.set('lockUntil', undefined);

            // Generate token
            const token = AuthService.generateToken(user._id.toString());

            // If temp password used, clear it or ensure client knows they MUST change password
            // For now, we allow login but maybe client should check `lastPasswordChangeAt`
            // Requirement says: "強制行為：使用臨時密碼登入成功後，系統須強制跳轉到「更改密碼」介面。"
            // We can return a flag in response

            if (isTempPassword) {
                // We don't clear it yet, we clear it when they change password
            }

            await user.save();

            res.json({
                token,
                user: { id: user._id, name: user.name, email: user.email },
                mustChangePassword: isTempPassword
            });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, name } = req.body; // Req says "帳戶、郵箱（Email）". Checking both. name as username.

            if (!name || !email) {
                return res.status(400).json({ message: 'Username and Email are required' });
            }

            const user = await User.findOne({ email, name, isValid: true });
            if (!user) {
                // Return generic message
                return res.status(400).json({ message: 'Account or Email error' }); // "帳號或郵箱錯誤"
            }

            // Rate Limit: 3 mins
            if (user.forgotPasswordLastRequestedAt) {
                const diff = Date.now() - user.forgotPasswordLastRequestedAt.getTime();
                if (diff < 3 * 60 * 1000) {
                    return res.status(429).json({ message: 'Function limit: Try again later' }); // "操作過於頻繁，請稍後再試"
                }
            }

            // Generate Temp Password
            const tempPass = AuthService.generateTempPassword();
            const tempHash = await AuthService.hashPassword(tempPass);

            user.tempPassword = tempHash;
            user.tempPasswordExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
            user.forgotPasswordLastRequestedAt = new Date();
            await user.save();

            // Send Email using EmailService
            await EmailService.sendTempPassword(email, tempPass);

            res.json({ message: 'Temporary password sent to email' });
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const userId = (req as any).user?._id;

            if (!userId) return res.status(401).json({ message: 'Unauthorized' });
            if (!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({ message: 'All fields required' });

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' }); // "兩次輸入的密碼不一致"
            }

            // Regex validation
            if (!AuthService.validatePasswordComplexity(newPassword)) {
                return res.status(400).json({ message: 'Password complexity requirements not met' }); // "新密碼格式錯誤"
            }

            const user = await User.findOne({ _id: userId, isValid: true }).select('+password +tempPassword');
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Verify old password (check both normal and temp)
            // If they logged in with temp, oldPassword should match temp
            let validOld = false;
            if (user.password && await AuthService.comparePassword(oldPassword, user.password)) validOld = true;
            if (!validOld && user.tempPassword && user.tempPasswordExpiresAt && user.tempPasswordExpiresAt > new Date()) {
                if (await AuthService.comparePassword(oldPassword, user.tempPassword)) validOld = true;
            }

            if (!validOld) {
                return res.status(400).json({ message: 'Incorrect old password' });
            }

            // Set new password
            user.password = await AuthService.hashPassword(newPassword);
            user.lastPasswordChangeAt = new Date();

            // Clear temp password
            user.set('tempPassword', undefined);
            user.set('tempPasswordExpiresAt', undefined);

            await user.save();

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        // Since we verify JWT statelessly, logout is mostly client-side.
        // We can just return success using existing auth middleware to ensure they were logged in.
        res.json({ message: 'Logged out successfully' });
    }
}
