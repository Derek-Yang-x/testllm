import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController.js';

const router = Router();

router.post('/', PermissionController.create);
router.get('/', PermissionController.findAll);
router.get('/hierarchy', PermissionController.getHierarchy);
router.get('/:id', PermissionController.findOne);
router.get('/:id/descendants', PermissionController.getDescendants);
router.put('/:id', PermissionController.update);
router.delete('/:id', PermissionController.delete);

export default router;
