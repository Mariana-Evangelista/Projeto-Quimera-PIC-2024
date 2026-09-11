import { ExperimentTypes } from "./experiment.schemas.types";

export interface ExperimentServiceTypes {
  createExperiment(experiment: ExperimentTypes): Promise<ExperimentTypes>;
  getExperimentById(id: string): Promise<ExperimentTypes>;
  getExperimentByPin(pin: string): Promise<ExperimentTypes>;
  getExperimentsByTeacher(teacherId: string): Promise<ExperimentTypes[]>;
  updateExperiment(id: string, experiment: Partial<ExperimentTypes>, requesterId: string): Promise<ExperimentTypes | null>;
  deleteExperiment(id: string, requesterId: string): Promise<void>;
}