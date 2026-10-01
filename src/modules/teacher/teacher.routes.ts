import { Router } from "express";

import { container } from "tsyringe";
import { TeacherController } from "./controllers/teacher.controllers";
import { authMiddleware } from "../../middlewares/authMiddleware";

export function TeacherRoutes() {
  const router = Router();

  const teacherController = container.resolve(TeacherController);

  router.post("/", teacherController.createTeacher.bind(teacherController));
  router.get(
    "/:id",
    authMiddleware,
    teacherController.getTeacherById.bind(teacherController),
  );
  router.put(
    "/:id",
    authMiddleware,
    teacherController.updateTeacher.bind(teacherController),
  );
  router.delete(
    "/:id",
    authMiddleware,
    teacherController.deleteTeacher.bind(teacherController),
  );

  return router;
}
