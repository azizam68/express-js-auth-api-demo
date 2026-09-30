import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"
const authRouter = Router();
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me", authenticate, me);
export default authRouter;