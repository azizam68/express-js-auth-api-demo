import { Router } from "express"
import { getUsers, createUser, getUserById, updateUser, deleteUser, replaceUser } from "../controllers/users.controller.js"

const router = Router()

router.get("/", getUsers)
router.get("/:id", getUserById)
router.post("/", createUser)
router.patch("/:id", updateUser)
router.put("/:id", replaceUser)
router.delete("/:id", deleteUser)

export default router