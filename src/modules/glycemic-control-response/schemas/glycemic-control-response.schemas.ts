import { model, Schema } from "mongoose";
import { GlycemicControlResponseTypes } from "../types/glycemic-control-response.schemas.types";
import { Experiment } from "../../experiment/schemas/experiment.schemas";

const GlycemicControlAnswerSchema = new Schema(
  {
    question: { type: Number, required: true },
    answer: { type: String, required: true },
    weight: { type: Number, required: true },
  },
  { _id: false },
);

const GlycemicControlResponseSchema = new Schema<GlycemicControlResponseTypes>({
  studentName: { type: String, required: true },
  pin: { type: String, required: true },
  answers: { type: [GlycemicControlAnswerSchema], required: true },
  score: { type: Number, required: true },
});

GlycemicControlResponseSchema.post("save", async function (doc) {
  await Experiment.updateOne(
    { pin: doc.pin, type: "glycemic-control" },
    { $inc: { responsesNumber: 1 } },
  );
});

GlycemicControlResponseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Experiment.updateOne(
      { pin: doc.pin, type: "glycemic-control" },
      { $inc: { responsesNumber: -1 } },
    );
  }
});

export const GlycemicControlResponse = model<GlycemicControlResponseTypes>(
  "GlycemicControlResponse",
  GlycemicControlResponseSchema,
);