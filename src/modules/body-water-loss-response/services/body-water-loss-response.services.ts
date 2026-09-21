import { inject, injectable } from "tsyringe";
import { BodyWaterLossResponseServiceTypes } from "../types/body-water-loss-response.services.types";
import { BodyWaterLossResponseRepositoryTypes } from "../types/body-water-loss-response.repositories.types";
import { BodyWaterLossResponseTypes, BodyWaterLossChartDataTypes, BodyWaterLossChartScore } from "../types/body-water-loss-response.schemas.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";
import { Experiment } from "../../experiment/schemas/experiment.schemas";

@injectable()
export class BodyWaterLossResponseService implements BodyWaterLossResponseServiceTypes {
  constructor(
    @inject("BodyWaterLossResponseRepository")
    private bodyWaterLossResponseRepository: BodyWaterLossResponseRepositoryTypes,
  ) {}

  async createBodyWaterLossResponse(response: BodyWaterLossResponseTypes) {
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
      type: "body-water-loss",
    });
    if (!experiment) {
      throw new ServiceError(
        "Experimento não encontrado.",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );
    }

    const score =
      Number(response.answerOne?.weight || 0) +
      Number(response.answerTwo?.weight || 0);
    const toSave: BodyWaterLossResponseTypes = { ...response, score };

    return this.bodyWaterLossResponseRepository.create(toSave);
  }
  async getBodyWaterLossResponseByPin(pin: string) {
    return this.bodyWaterLossResponseRepository.findByPin(pin);
  }
  async getBodyWaterLossResponseById(id: string) {
    return this.bodyWaterLossResponseRepository.findById(id);
  }
  async updateBodyWaterLossResponse(
    id: string,
    response: BodyWaterLossResponseTypes,
  ) {
    const score =
      Number(response.answerOne?.weight || 0) +
      Number(response.answerTwo?.weight || 0);
    const toSave: BodyWaterLossResponseTypes = { ...response, score };
    return this.bodyWaterLossResponseRepository.update(id, toSave);
  }
  async deleteBodyWaterLossResponse(id: string) {
    return this.bodyWaterLossResponseRepository.delete(id);
  }

  async getBodyWaterLossChartByPin(pin: string): Promise<BodyWaterLossChartDataTypes[]> {
    const responses = await this.bodyWaterLossResponseRepository.findByPin(pin);
    const responseList = responses || [];

    const scoreBuckets: Record<BodyWaterLossChartScore, { label: string; students: number }> = {
      0: { label: "Errou as duas opções", students: 0 },
      20: { label: "Acertou a primeira opção", students: 0 },
      80: { label: "Acertou a segunda opção", students: 0 },
      100: { label: "Acertou as duas opções", students: 0 },
    };

    for (const response of responseList) {
      const score = response.score as BodyWaterLossChartScore;
      if (scoreBuckets[score]) {
        scoreBuckets[score].students += 1;
      }
    }

    return [
      { students: scoreBuckets[0].students, score: 0, label: scoreBuckets[0].label },
      { students: scoreBuckets[20].students, score: 20, label: scoreBuckets[20].label },
      { students: scoreBuckets[80].students, score: 80, label: scoreBuckets[80].label },
      { students: scoreBuckets[100].students, score: 100, label: scoreBuckets[100].label },
    ];
  }
}
