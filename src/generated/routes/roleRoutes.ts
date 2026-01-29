import { Router } from 'express';
import { RoleController } from '../controllers/RoleController.js';

const router = Router();

router.post('/', RoleController.create);
router.get('/', RoleController.findAll);
router.get('/:id', RoleController.findOne);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.delete);
router.post('/:id/permissions', RoleController.assignPermissions);

export default router;
