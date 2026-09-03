import { model, Schema } from "mongoose";
import { WaterResponseTypes } from "../types/water-response.schemas.types";
import { WaterExperiment } from "../../experiment/schemas/water-experiment.schemas";

const WaterAnswerSchema = new Schema({
  value: { type: String, required: true },
  weight: { type: Number, required: true },
  answerNumber: { type: Number, required: true },
}, { _id: false });

const WaterResponseSchema = new Schema<WaterResponseTypes>({
  studentName: { type: String, required: true },
  pin: { type: String, required: true },
  answerOne: { type: WaterAnswerSchema, required: true },
  answerTwo: { type: WaterAnswerSchema, required: true },
  score: { type: Number, required: true },
});

WaterResponseSchema.post("save", async function (doc) {
  await WaterExperiment.updateOne(
    { pin: doc.pin },
    { $inc: { responsesNumber: 1 } },
  );
});

WaterResponseSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await WaterExperiment.updateOne(
      { pin: doc.pin },
      { $inc: { responsesNumber: -1 } },
    );
  }
});

export const WaterResponse = model<WaterResponseTypes>(
  "WaterResponse",
  WaterResponseSchema,
);
