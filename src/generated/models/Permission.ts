import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IRole } from './Role.js';

export interface IPermission extends Document {
    name: string;
    slug: string;
    description?: string;
    parentId?: string | IPermission;
    children?: IPermission[];
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPermissionModel extends Model<IPermission> {
    getAllDescendants(permissionId: string | mongoose.Types.ObjectId | (string | mongoose.Types.ObjectId)[]): Promise<IPermission[]>;
}

const PermissionSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: 'Permission', default: null },
    isValid: { type: Boolean, default: true },
}, { timestamps: true });

PermissionSchema.virtual('children', {
    ref: 'Permission',
    localField: '_id',
    foreignField: 'parentId'
});

PermissionSchema.statics.getAllDescendants = async function (
    permissionIds: string | mongoose.Types.ObjectId | (string | mongoose.Types.ObjectId)[]
): Promise<IPermission[]> {
    const Permission = this as IPermissionModel;

    // Normalize input to array of ObjectIds
    const ids = (Array.isArray(permissionIds) ? permissionIds : [permissionIds])
        .map(id => new mongoose.Types.ObjectId(id));

    if (ids.length === 0) return [];

    const results = await Permission.aggregate([
        {
            $match: {
                _id: { $in: ids }
            }
        },
        {
            $graphLookup: {
                from: 'permissions',
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parentId',
                as: 'descendants',
                restrictSearchWithMatch: { isValid: true }
            }
        },
        {
            $project: {
                descendants: 1,
                // Include self as well to ensure we have the root permissions
                _id: 1,
                name: 1,
                slug: 1,
                description: 1,
                parentId: 1,
                isValid: 1
            }
        }
    ]);

    if (!results || results.length === 0) {
        return [];
    }

    // Collect all unique permissions (roots + descendants)
    // FIX: The method name is getAllDescendants, so we should NOT return the roots themselves.
    // However, the aggregation returns roots because we needed them to access the 'descendants' array.
    const descendantPermissions = new Map<string, IPermission>();

    for (const res of results) {
        // Only add descendants
        if (res.descendants && Array.isArray(res.descendants)) {
            for (const desc of res.descendants) {
                descendantPermissions.set(desc._id.toString(), desc);
            }
        }
    }

    return Array.from(descendantPermissions.values());
};

// Cascade delete: Remove this permission from any Roles that have it
PermissionSchema.post('findOneAndDelete', async function (doc: IPermission | null) {
    if (doc) {
        await mongoose.model<IRole>('Role').updateMany(
            { permissions: doc._id },
            { $pull: { permissions: doc._id } }
        );
    }
});

PermissionSchema.set('toJSON', { virtuals: true });
PermissionSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPermission, IPermissionModel>('Permission', PermissionSchema);
