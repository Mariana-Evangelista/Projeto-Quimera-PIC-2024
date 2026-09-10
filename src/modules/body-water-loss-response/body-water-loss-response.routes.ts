import { Router } from "express";
import { container } from "tsyringe";
import { BodyWaterLossResponseController } from "./controllers/body-water-loss-response.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";

export function BodyWaterLossResponseRoutes() {
  const router = Router();

  const controller = container.resolve(BodyWaterLossResponseController);

  router.post(
    "/",
    controller.createBodyWaterLossResponse.bind(controller),
  );

  router.get(
    "/:pin",
    controller.getBodyWaterLossResponseByPin.bind(controller),
  );

  router.put(
    "/:id",
    authMiddleware,
    controller.updateBodyWaterLossResponse.bind(controller),
  );

  router.delete(
    "/:id",
    authMiddleware,
    controller.deleteBodyWaterLossResponse.bind(controller),
  );

  return router;
}