import { Router } from "express";
import { register, verifyEmail } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.get('/verify-email', verifyEmail);

export default authRouter;