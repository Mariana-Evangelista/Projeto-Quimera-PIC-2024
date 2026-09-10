import { ExperimentTypes } from "./experiment.schemas.types";

export interface ExperimentRepositoryTypes {
  create(experiment: ExperimentTypes): Promise<ExperimentTypes>;
  findById(id: string): Promise<ExperimentTypes | null>;
  findByPin(pin: string): Promise<ExperimentTypes | null>;
  findByTeacher(teacherId: string): Promise<ExperimentTypes[]>;
  update(id: string, experiment: ExperimentTypes): Promise<ExperimentTypes | null>;
  delete(id: string): Promise<void>;
}