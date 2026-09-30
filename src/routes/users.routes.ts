import { Router } from "express"
import * as userController from "../controllers/users.controller.js"
import {authenticate} from "../middlewares/auth.middleware.js"

const router = Router()

router.get("/", userController.getUsers)
router.get("/:id", userController.getUserById)
router.post("/", userController.createUser)
router.patch("/:id", userController.updateUser)
router.put("/:id", userController.replaceUser)
router.delete("/:id", userController.deleteUser)

// requireRole(ROLES.ADMIN),
router.get("/:id/roles", userController.getRoles)
router.post("/:id/roles", userController.assignRole)
router.delete("/:id/roles/:roleId", userController.removeRole)


export default router