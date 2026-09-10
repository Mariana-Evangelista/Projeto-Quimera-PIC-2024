import { model, Schema } from "mongoose";
import { BodyWaterLossResponseTypes } from "../types/body-water-loss-response.schemas.types";
import { Experiment } from "../../experiment/schemas/experiment.schemas";

const BodyWaterLossAnswerSchema = new Schema(
  {
    value: { type: String, required: true },
    weight: { type: Number, required: true },
  },
  { _id: false },
);

const BodyWaterLossResponseSchema = new Schema<BodyWaterLossResponseTypes>({
  studentName: { type: String, required: true },
  pin: { type: String, required: true },
  answerOne: { type: BodyWaterLossAnswerSchema, required: true },
  answerTwo: { type: BodyWaterLossAnswerSchema, required: true },
  score: { type: Number, required: true },
});

BodyWaterLossResponseSchema.post("save", async function (doc) {
  await Experiment.updateOne(
    { pin: doc.pin, type: "body-water-loss" },
    { $inc: { responsesNumber: 1 } },
  );
});

BodyWaterLossResponseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Experiment.updateOne(
      { pin: doc.pin, type: "body-water-loss" },
      { $inc: { responsesNumber: -1 } },
    );
  }
});

export const BodyWaterLossResponse = model<BodyWaterLossResponseTypes>(
  "BodyWaterLossResponse",
  BodyWaterLossResponseSchema,
);