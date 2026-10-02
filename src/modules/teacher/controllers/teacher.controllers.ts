import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TeacherServiceTypes } from "../types/teacher.services.types";
import { TeacherTypes, UpdateTeacherTypes } from "../types/teacher.schemas.types";
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

    const body = req.body;
    if (!body || typeof body !== "object") {
      throw new ServiceError(
        "Body inválido",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }

    const allowedFields = ["name", "email", "password"];
    const receivedFields = Object.keys(body);
    const invalidFields = receivedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new ServiceError(
        `Campos não permitidos: ${invalidFields.join(", ")}`,
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.TEACHER_INVALID_UPDATE_FIELD,
      );
    }

    if (body.name !== undefined && typeof body.name !== "string") {
      throw new ServiceError(
        "Campo 'name' deve ser string",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.email !== undefined && typeof body.email !== "string") {
      throw new ServiceError(
        "Campo 'email' deve ser string",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.password !== undefined && typeof body.password !== "string") {
      throw new ServiceError(
        "Campo 'password' deve ser string",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.name !== undefined && body.name.trim() === "") {
      throw new ServiceError(
        "Campo 'name' não pode ser vazio",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.email !== undefined && body.email.trim() === "") {
      throw new ServiceError(
        "Campo 'email' não pode ser vazio",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.name !== undefined && body.name.length > 100) {
      throw new ServiceError(
        "Campo 'name' deve ter no máximo 100 caracteres",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.email !== undefined && body.email.length > 254) {
      throw new ServiceError(
        "Campo 'email' deve ter no máximo 254 caracteres",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }

    const updateData: UpdateTeacherTypes = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email;
    if (body.password !== undefined) updateData.password = body.password;

    const updatedTeacher = await this.teacherService.updateTeacher(id, updateData);
    res.status(200).json(updatedTeacher);
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
