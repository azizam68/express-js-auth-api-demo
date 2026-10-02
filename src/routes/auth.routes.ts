import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js"

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/register", authController.register);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

export default authRouter;