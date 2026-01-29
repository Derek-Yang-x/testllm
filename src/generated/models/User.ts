import mongoose, { Schema, Document } from 'mongoose';
import type { IRole } from './Role.js';

export interface IUser extends Document {
    email: string;
    name: string;
    roles?: mongoose.Types.ObjectId[] | IRole[];
    manager?: mongoose.Types.ObjectId | IUser;
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', function (this: IUser, next) {
    if (this.manager && this.manager.toString() === this._id.toString()) {
        const error: any = new Error('User cannot be their own manager');
        error.errors = { manager: { message: 'User cannot be their own manager' } };
        return next(error);
    }
    next();
});

export default mongoose.model<IUser>('User', UserSchema);
