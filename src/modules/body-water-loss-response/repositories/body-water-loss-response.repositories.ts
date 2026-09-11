import { injectable } from "tsyringe";
import { BodyWaterLossResponse } from "../schemas/body-water-loss-response.schemas";
import { BodyWaterLossResponseRepositoryTypes } from "../types/body-water-loss-response.repositories.types";
import { BodyWaterLossResponseTypes } from "../types/body-water-loss-response.schemas.types";

@injectable()
export class BodyWaterLossResponseRepository implements BodyWaterLossResponseRepositoryTypes {
  async create(response: BodyWaterLossResponseTypes) {
    const newResponse = new BodyWaterLossResponse(response);
    return await newResponse.save();
  }
  async findByPin(pin: string) {
    return await BodyWaterLossResponse.find({ pin });
  }
  async findById(id: string) {
    return await BodyWaterLossResponse.findById(id);
  }
  async update(id: string, response: BodyWaterLossResponseTypes) {
    return await BodyWaterLossResponse.findByIdAndUpdate(id, response, {
      new: true,
    });
  }
  async delete(id: string) {
    await BodyWaterLossResponse.findByIdAndDelete(id);
  }
}