import { Types } from "mongoose";

export type ExperimentType = "body-water-loss" | "glycemic-control";

export type ExperimentStatus = "Não iniciado" | "Em Progresso" | "Finalizado";

export interface ExperimentTypes {
  pin: string;
  teacher: Types.ObjectId | string;
  type: ExperimentType;
  university: string;
  class: string;
  liberateSend: boolean;
  liberateResult: boolean;
  responsesNumber: number;
  createdAt: Date;
  status: ExperimentStatus;
}

export interface UpdateExperimentTypes {
  university?: string;
  class?: string;
  liberateSend?: boolean;
  liberateResult?: boolean;
}