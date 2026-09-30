import { Router } from "express"
import { ROLES } from "../constants/roles.js"
import { requireRole } from "../middlewares/role.middleware.js"

const router = Router()

router.get(
  "/",
  requireRole(ROLES.ADMIN),
  (_req, res) => {
    res.json({
      message: "Welcome admin"
    })
  }
)

export default router