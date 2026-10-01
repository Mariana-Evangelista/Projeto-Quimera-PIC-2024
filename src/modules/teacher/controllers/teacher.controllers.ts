import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TeacherServiceTypes } from "../types/teacher.services.types";
import { TeacherTypes } from "../types/teacher.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";
import { CustomRequest } from "../../../middlewares/authMiddleware";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class TeacherController {
  constructor(
    @inject("TeacherService") private teacherService: TeacherServiceTypes,
  ) {}

  createTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacher: TeacherTypes = req.body;
    const newTeacher = await this.teacherService.createTeacher(teacher);
    res.status(201).json(newTeacher);
  });

  getTeacherById = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;

    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    if (requesterId !== id)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.TEACHER_FORBIDDEN,
      );

    const teacher = await this.teacherService.getTeacherById(id);
    res.status(200).json(teacher);
  });

  updateTeacher = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    if (requesterId !== id)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.TEACHER_FORBIDDEN,
      );

    const teacher: TeacherTypes = req.body;
    const updateTeacher = await this.teacherService.updateTeacher(id, teacher);
    res.status(200).json(updateTeacher);
  });

  deleteTeacher = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    if (requesterId !== id)
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.TEACHER_FORBIDDEN,
      );

    await this.teacherService.deleteTeacher(id);
    res.status(204).send();
  });
}
