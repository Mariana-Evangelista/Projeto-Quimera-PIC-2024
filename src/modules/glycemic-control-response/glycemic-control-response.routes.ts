import { Router } from "express";
import { container } from "tsyringe";
import { GlycemicControlResponseController } from "./controllers/glycemic-control-response.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { responseSubmissionRateLimiter, publicPinLookupRateLimiter } from "../../middlewares/rateLimiters";

export function GlycemicControlResponseRoutes() {
  const router = Router();

  const controller = container.resolve(GlycemicControlResponseController);

  router.post("/", responseSubmissionRateLimiter, controller.createGlycemicControlResponse.bind(controller));

  router.get(
    "/analytics/:pin",
    publicPinLookupRateLimiter,
    controller.getGlycemicControlAnalyticsByPin.bind(controller),
  );

  router.get(
    "/:pin",
    authMiddleware,
    controller.getGlycemicControlResponseByPin.bind(controller),
  );

  router.delete(
    "/:id",
    authMiddleware,
    controller.deleteGlycemicControlResponse.bind(controller),
  );

  return router;
}