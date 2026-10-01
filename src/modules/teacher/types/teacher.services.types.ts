import { TeacherTypes } from "./teacher.schemas.types";

export interface TeacherServiceTypes {
  createTeacher(teacher: TeacherTypes): Promise<TeacherTypes>;
  getTeacherById(id: string): Promise<TeacherTypes | null>;
  updateTeacher(
    id: string,
    teacher: TeacherTypes,
  ): Promise<TeacherTypes | null>;
  deleteTeacher(id: string): Promise<void>;
}
