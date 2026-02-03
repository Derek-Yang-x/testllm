import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPermission extends Document {
    name: string;
    description?: string;
    parentId?: string | IPermission;
    children?: IPermission[];
    isValid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPermissionModel extends Model<IPermission> {
    getAllDescendants(permissionId: string | mongoose.Types.ObjectId): Promise<IPermission[]>;
}

const PermissionSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
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
    permissionId: string | mongoose.Types.ObjectId
): Promise<IPermission[]> {
    const Permission = this as IPermissionModel;
    const objectId = new mongoose.Types.ObjectId(permissionId);

    const results = await Permission.aggregate([
        {
            $match: {
                _id: objectId
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
                descendants: 1
            }
        }
    ]);

    if (!results || results.length === 0 || !results[0].descendants) {
        return [];
    }

    return results[0].descendants;
};

PermissionSchema.set('toJSON', { virtuals: true });
PermissionSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPermission, IPermissionModel>('Permission', PermissionSchema);
