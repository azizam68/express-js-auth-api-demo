import { Router } from "express"
import { ROLES } from "../constants/roles.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import { requireRole } from "../middlewares/role.middleware.js"

const router = Router()

router.get(
  "/",
  authenticate,
  requireRole(ROLES.ADMIN),
  (_req, res) => {
    res.json({
      message: "Welcome admin"
    })
  }
)

export default router