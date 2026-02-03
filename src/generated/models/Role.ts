import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from './User.js';

export interface IRole extends Document {
    name: string;
    description?: string;
    permissions: string[];
    creatorId?: mongoose.Types.ObjectId | IUser;
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);
