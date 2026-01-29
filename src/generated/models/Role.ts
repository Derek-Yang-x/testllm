import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    description?: string;
    permissions: string[];
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);
