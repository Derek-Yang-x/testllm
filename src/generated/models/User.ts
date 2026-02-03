import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IRole } from './Role.js';

export interface IUserModel extends Model<IUser> {
    getAllDescendants(userId: string | mongoose.Types.ObjectId): Promise<IUser[]>;
}

export interface IUser extends Document {
    email: string;
    name: string;
    roles?: mongoose.Types.ObjectId[] | IRole[];
    parentId?: mongoose.Types.ObjectId | IUser;
    password?: string;
    tempPassword?: string;
    tempPasswordExpiresAt?: Date;
    forgotPasswordLastRequestedAt?: Date;
    loginAttempts?: number;
    lockUntil?: Date;
    lastPasswordChangeAt?: Date;
    creatorId?: mongoose.Types.ObjectId | IUser;
    isValid: boolean;
    children?: IUser[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    parentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    password: { type: String, select: false },
    tempPassword: { type: String, select: false },
    tempPasswordExpiresAt: { type: Date },
    forgotPasswordLastRequestedAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastPasswordChangeAt: { type: Date },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.pre('save', function (this: IUser, next) {
    if (this.parentId && this.parentId.toString() === this._id.toString()) {
        const error: any = new Error('User cannot be their own parent');
        error.errors = { parentId: { message: 'User cannot be their own parent' } };
        return next(error);
    }
    next();
});

UserSchema.virtual('children', {
    ref: 'User',
    localField: '_id',
    foreignField: 'parentId'
});

UserSchema.statics.getAllDescendants = async function (
    userId: string | mongoose.Types.ObjectId
): Promise<IUser[]> {
    const User = this as IUserModel;
    const objectId = new mongoose.Types.ObjectId(userId);

    const results = await User.aggregate([
        {
            $match: {
                _id: objectId
            }
        },
        {
            $graphLookup: {
                from: 'users',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parentId',
                as: 'descendants',
                restrictSearchWithMatch: { isValid: true }
            }
        },
        {
            $project: {
                descendants: 1
            }
        }
    ]);

    if (!results || results.length === 0 || !results[0].descendants) {
        return [];
    }

    return results[0].descendants;
};

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default mongoose.model<IUser, IUserModel>('User', UserSchema);
