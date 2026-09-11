import { injectable } from "tsyringe";
import { GlycemicControlResponse } from "../schemas/glycemic-control-response.schemas";
import { GlycemicControlResponseRepositoryTypes } from "../types/glycemic-control-response.repositories.types";
import { GlycemicControlResponseTypes } from "../types/glycemic-control-response.schemas.types";

@injectable()
export class GlycemicControlResponseRepository implements GlycemicControlResponseRepositoryTypes {
  async create(response: GlycemicControlResponseTypes) {
    const newResponse = new GlycemicControlResponse(response);
    return await newResponse.save();
  }
  async findByPin(pin: string) {
    return await GlycemicControlResponse.find({ pin });
  }
  async findById(id: string) {
    return await GlycemicControlResponse.findById(id);
  }
  async update(id: string, response: GlycemicControlResponseTypes) {
    return await GlycemicControlResponse.findByIdAndUpdate(id, response, {
      new: true,
    });
  }
  async delete(id: string) {
    await GlycemicControlResponse.findByIdAndDelete(id);
  }
}