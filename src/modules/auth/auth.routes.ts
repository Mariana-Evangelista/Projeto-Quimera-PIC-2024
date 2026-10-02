import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "./controllers/auth.controllers";
import { loginRateLimiter } from "../../middlewares/rateLimiters";

export function AuthRoutes() {
  const router = Router();

  const authController = container.resolve(AuthController);

  router.post("/login", loginRateLimiter, authController.login.bind(authController));

  return router;
}
