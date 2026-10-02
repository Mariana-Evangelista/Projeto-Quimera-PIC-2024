import { injectable } from "tsyringe";
import { TeacherRepositoryTypes } from "../types/teacher.repositories.types";
import { TeacherTypes, UpdateTeacherTypes } from "../types/teacher.schemas.types";
import { Teacher } from "../schemas/teacher.schemas";

@injectable()
export class TeacherRepository implements TeacherRepositoryTypes {
  async create(teacher: TeacherTypes) {
    const newTeacher = new Teacher(teacher);
    return await newTeacher.save();
  }
  async findById(id: string) {
    return await Teacher.findById(id);
  }
  async findByEmail(email: string) {
    return await Teacher.findOne({ email }).select("+password");
  }
  async update(id: string, teacher: UpdateTeacherTypes) {
    const doc = await Teacher.findById(id).select("+password");
    if (!doc) return null;

    if (teacher.name !== undefined) doc.name = teacher.name;
    if (teacher.email !== undefined) doc.email = teacher.email;
    if (teacher.password !== undefined) doc.password = teacher.password;

    return await doc.save();
  }
  async delete(id: string) {
    await Teacher.findByIdAndDelete(id);
  }
}
