import { inject, injectable } from "tsyringe";
import { GlycemicControlResponseServiceTypes } from "../types/glycemic-control-response.services.types";
import { GlycemicControlResponseRepositoryTypes } from "../types/glycemic-control-response.repositories.types";
import { GlycemicControlResponseTypes } from "../types/glycemic-control-response.schemas.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";
import { Experiment } from "../../experiment/schemas/experiment.schemas";

@injectable()
export class GlycemicControlResponseService implements GlycemicControlResponseServiceTypes {
  constructor(
    @inject("GlycemicControlResponseRepository")
    private glycemicControlResponseRepository: GlycemicControlResponseRepositoryTypes,
  ) {}

  async createGlycemicControlResponse(response: GlycemicControlResponseTypes) {
    if (!response.pin) {
      throw new ServiceError(
        "PIN do experimento é obrigatório",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.RESPONSE_PIN_REQUIRED,
      );
    }

    const experiment = await Experiment.findOne({
      pin: response.pin,
      type: "glycemic-control",
    });
    if (!experiment) {
      throw new ServiceError(
        "Experimento não encontrado.",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );
    }

    const score = response.answers
      ? response.answers.reduce((sum, ans) => sum + Number(ans?.weight || 0), 0)
      : 0;
    const toSave: GlycemicControlResponseTypes = { ...response, score };

    return this.glycemicControlResponseRepository.create(toSave);
  }
  async getGlycemicControlResponseByPin(pin: string) {
    return this.glycemicControlResponseRepository.findByPin(pin);
  }
  async getGlycemicControlResponseById(id: string) {
    return this.glycemicControlResponseRepository.findById(id);
  }
  async updateGlycemicControlResponse(
    id: string,
    response: GlycemicControlResponseTypes,
  ) {
    const score = response.answers
      ? response.answers.reduce((sum, ans) => sum + Number(ans?.weight || 0), 0)
      : 0;
    const toSave: GlycemicControlResponseTypes = { ...response, score };
    return this.glycemicControlResponseRepository.update(id, toSave);
  }
  async deleteGlycemicControlResponse(id: string) {
    return this.glycemicControlResponseRepository.delete(id);
  }
}