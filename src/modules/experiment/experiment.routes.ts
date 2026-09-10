import { Router } from "express";
import { container } from "tsyringe";
import { ExperimentController } from "./controllers/experiment.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";

export function ExperimentRoutes() {
  const router = Router();

  const experimentController = container.resolve(ExperimentController);

  router.post(
    "/",
    authMiddleware,
    experimentController.createExperiment.bind(experimentController),
  );
  router.get(
    "/id/:id",
    authMiddleware,
    experimentController.getExperimentById.bind(experimentController),
  );
  router.get(
    "/pin/:pin",
    experimentController.getExperimentByPin.bind(experimentController),
  );

  router.get(
    "/me",
    authMiddleware,
    experimentController.getExperimentsByTeacher.bind(experimentController),
  );
  router.put(
    "/:id",
    authMiddleware,
    experimentController.updateExperiment.bind(experimentController),
  );
  router.delete(
    "/:id",
    authMiddleware,
    experimentController.deleteExperiment.bind(experimentController),
  );

  return router;
}