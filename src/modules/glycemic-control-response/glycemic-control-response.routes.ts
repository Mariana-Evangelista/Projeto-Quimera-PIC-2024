import { Router } from "express";
import { container } from "tsyringe";
import { GlycemicControlResponseController } from "./controllers/glycemic-control-response.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";

export function GlycemicControlResponseRoutes() {
  const router = Router();

  const controller = container.resolve(GlycemicControlResponseController);

  router.post("/", controller.createGlycemicControlResponse.bind(controller));

  router.get(
    "/:pin",
    authMiddleware,
    controller.getGlycemicControlResponseByPin.bind(controller),
  );

  router.put(
    "/:id",
    authMiddleware,
    controller.updateGlycemicControlResponse.bind(controller),
  );

  router.delete(
    "/:id",
    authMiddleware,
    controller.deleteGlycemicControlResponse.bind(controller),
  );

  return router;
}