import { model, Schema } from "mongoose";
import { ExperimentTypes, ExperimentType, ExperimentStatus } from "../types/experiment.schemas.types";

const ExperimentSchema = new Schema<ExperimentTypes>({
  pin: { type: String, required: true, index: { unique: true } },
  teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  type: { type: String, enum: ["body-water-loss", "glycemic-control"], required: true },
  university: { type: String, required: true },
  class: { type: String, required: true },
  liberateSend: { type: Boolean, default: false },
  liberateResult: { type: Boolean, default: false },
  responsesNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Não iniciado", "Em Progresso", "Finalizado"], required: true, default: "Não iniciado" },
});

export const Experiment = model<ExperimentTypes>("Experiment", ExperimentSchema);
export { ExperimentType, ExperimentStatus };