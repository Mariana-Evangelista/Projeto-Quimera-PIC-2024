import { TeacherTypes } from "./teacher.schemas.types";

export interface TeacherRepositoryTypes {
  create(teacher: TeacherTypes): Promise<TeacherTypes>;
  findById(id: string): Promise<TeacherTypes | null>;
  findByEmail(email: string): Promise<TeacherTypes | null>;
  update(id: string, teacher: TeacherTypes): Promise<TeacherTypes | null>;
  delete(id: string): Promise<void>;
}
