
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = '1d';

export class AuthService {
    // Hashes a password or temp password
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    // Compares a plain text password with a hash
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    // Generates a JWT token
    static generateToken(userId: string): string {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    // Generates a random temporary password
    static generateTempPassword(): string {
        // Simple random string generation for demo purposes
        // In production, consider a more robust crypto random generator
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `!Tmp${result}`; // Ensure it meets minimal complexity just in case, or prefix it
    }

    // Validates password complexity
    static validatePasswordComplexity(password: string): boolean {
        // Regex: 8-16 chars, at least one lowercase, one uppercase, one number, one special char
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        return regex.test(password);
    }
}
