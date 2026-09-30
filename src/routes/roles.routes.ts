// roles.routes.ts
import { Router } from 'express'
import { getRoles } from '../controllers/roles.controller.js'

const router = Router();
// requireRole(ROLES.ADMIN),
router.get('/', getRoles );

export default router;