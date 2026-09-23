import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"
const authRouter = Router();
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);
export default authRouter;