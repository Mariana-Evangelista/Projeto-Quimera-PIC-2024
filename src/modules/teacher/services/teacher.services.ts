import { inject, injectable } from "tsyringe";
import { TeacherServiceTypes } from "../types/teacher.services.types";
import { TeacherRepositoryTypes } from "../types/teacher.repositories.types";
import { TeacherTypes } from "../types/teacher.schemas.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[^!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

@injectable()
export class TeacherService implements TeacherServiceTypes {
  constructor(
    @inject("TeacherRepository")
    private teacherRepository: TeacherRepositoryTypes,
  ) {}

  private validatePassword(password: string) {
    if (password.length < 8 || !passwordRegex.test(password)) {
      throw new ServiceError(
        "A senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiúscula, uma minúscula e um número, e não pode conter caracteres especiais",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.TEACHER_PASSWORD_INVALID,
      );
    }
  }

  private sanitizeTeacher(teacher: any) {
    const teacherObj = teacher.toObject ? teacher.toObject() : teacher;
    const { password, ...teacherWithoutPassword } = teacherObj;
    return teacherWithoutPassword;
  }

  async createTeacher(teacher: TeacherTypes) {
    if (!teacher.email || !teacher.password || !teacher.name) {
      throw new ServiceError(
        "Campos obrigatórios do professor ausentes",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.TEACHER_MISSING_FIELDS,
      );
    }

    this.validatePassword(teacher.password);

    const existing = await this.teacherRepository.findByEmail(teacher.email);
    if (existing) {
      throw new ServiceError(
        "Conflito: email já está em uso",
        ServiceErrorType.Conflict,
        undefined,
        ErrorCode.TEACHER_EMAIL_CONFLICT,
      );
    }

    const createdTeacher = await this.teacherRepository.create(teacher);
    return this.sanitizeTeacher(createdTeacher);
  }
  async getTeacherById(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new ServiceError(
        "Professor não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.TEACHER_NOT_FOUND,
      );
    return this.sanitizeTeacher(teacher);
  }
  async getAllTeacher() {
    const teachers = await this.teacherRepository.findAll();
    return teachers.map((teacher) => this.sanitizeTeacher(teacher));
  }
  async updateTeacher(id: string, teacher: TeacherTypes) {
    const existing = await this.teacherRepository.findById(id);
    if (!existing)
      throw new ServiceError(
        "Professor não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.TEACHER_NOT_FOUND,
      );

    if (teacher.email && teacher.email !== (existing as any).email) {
      const byEmail = await this.teacherRepository.findByEmail(teacher.email);
      if (byEmail)
        throw new ServiceError(
          "Conflito: e-mail já está em uso",
          ServiceErrorType.Conflict,
          undefined,
          ErrorCode.TEACHER_EMAIL_CONFLICT,
        );
    }

    if (teacher.password) {
      this.validatePassword(teacher.password);
    }

    const updatedTeacher = await this.teacherRepository.update(id, teacher);
    return this.sanitizeTeacher(updatedTeacher);
  }
  async deleteTeacher(id: string) {
    const existing = await this.teacherRepository.findById(id);
    if (!existing)
      throw new ServiceError(
        "Professor não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.TEACHER_NOT_FOUND,
      );
    return this.teacherRepository.delete(id);
  }
}
