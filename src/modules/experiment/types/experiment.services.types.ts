import { ExperimentTypes, UpdateExperimentTypes, ExperimentStatus } from "./experiment.schemas.types";

export interface ExperimentServiceTypes {
  createExperiment(experiment: ExperimentTypes): Promise<ExperimentTypes>;
  getExperimentById(id: string, requesterId: string): Promise<ExperimentTypes>;
  getExperimentByPin(pin: string, slug: string, requesterId: string): Promise<ExperimentTypes>;
  getExperimentByPinForParticipant(pin: string, slug: string): Promise<ExperimentTypes>;
  getExperimentsByTeacher(teacherId: string): Promise<ExperimentTypes[]>;
  updateExperiment(id: string, experiment: UpdateExperimentTypes, requesterId: string): Promise<ExperimentTypes | null>;
  deleteExperiment(id: string, requesterId: string): Promise<void>;
  getExperimentStatus(liberateSend: boolean, liberateResult: boolean): ExperimentStatus;
}