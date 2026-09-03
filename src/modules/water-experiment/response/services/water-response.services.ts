import { inject, injectable } from "tsyringe";
import { WaterResponseServiceTypes } from "../types/water-response.services.types";
import { WaterResponseRepositoryTypes } from "../types/water-response.repositories.types";
import { WaterResponseTypes } from "../types/water-response.schemas.types";
import ServiceError, { ServiceErrorType } from "../../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../../shared/errors/errorCodes";

@injectable()
export class WaterResponseService implements WaterResponseServiceTypes {
  constructor(
    @inject("WaterResponseRepository")
    private waterResponseRepository: WaterResponseRepositoryTypes,
  ) {}

  async createWaterResponse(waterResponse: WaterResponseTypes) {
    if (!waterResponse.pin) {
      throw new ServiceError("PIN do experimento é obrigatório", ServiceErrorType.BadRequest, undefined, ErrorCode.RESPONSE_PIN_REQUIRED);
    }

    const score = Number(waterResponse.answerOne?.weight || 0) + Number(waterResponse.answerTwo?.weight || 0);
    const toSave: WaterResponseTypes = { ...waterResponse, score };

    return this.waterResponseRepository.create(toSave);
  }
  async getWaterResponseByPin(pin: string) {
    return this.waterResponseRepository.findByPin(pin);
  }
  async getWaterResponseById(id: string) {
    return this.waterResponseRepository.findById(id);
  }
  async updateWaterResponse(id: string, waterResponse: WaterResponseTypes) {
    return this.waterResponseRepository.update(id, waterResponse);
  }
  async deleteWaterResponse(id: string) {
    return this.waterResponseRepository.delete(id);
  }
}