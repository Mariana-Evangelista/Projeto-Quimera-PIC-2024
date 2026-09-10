import { Types } from "mongoose";

export type ExperimentType = "body-water-loss" | "glycemic-control";

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
}