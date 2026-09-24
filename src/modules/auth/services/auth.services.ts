import { inject, injectable } from "tsyringe";

import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

import { Document } from "mongoose";
import { AuthServiceTypes } from "../types/auth.services.types";
import { TeacherRepositoryTypes } from "../../teacher/types/teacher.repositories.types";
import { TeacherTypes } from "../../teacher/types/teacher.schemas.types";
import ServiceError, { ServiceErrorType } from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class AuthService implements AuthServiceTypes {
  constructor(
    @inject("TeacherRepository")
    private teacherRepository: TeacherRepositoryTypes,
  ) {}

  async login(email: string, password: string) {
    const teacher = (await this.teacherRepository.findByEmail(
      email,
    )) as TeacherTypes & Document;

    if (!teacher) {
      throw new ServiceError(
        "E-mail ou senha incorretos",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_INVALID_CREDENTIALS,
      );
    }

    const passwordMatch = await compare(password, teacher.password);
    if (!passwordMatch) {
      throw new ServiceError(
        "E-mail ou senha incorretos",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_INVALID_CREDENTIALS,
      );
    }

    const token = sign({ id: teacher._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    const teacherObj = teacher.toObject ? teacher.toObject() : teacher;
    const { password: _, ...teacherWithoutPassword } = teacherObj;

    return {
      teacher: teacherWithoutPassword,
      token,
    };
  }
}
