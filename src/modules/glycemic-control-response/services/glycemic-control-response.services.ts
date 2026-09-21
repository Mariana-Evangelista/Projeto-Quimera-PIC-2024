import { inject, injectable } from "tsyringe";
import { GlycemicControlResponseServiceTypes } from "../types/glycemic-control-response.services.types";
import { GlycemicControlResponseRepositoryTypes } from "../types/glycemic-control-response.repositories.types";
import { GlycemicControlResponseTypes, GlycemicControlChartDataTypes } from "../types/glycemic-control-response.schemas.types";
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

  async getGlycemicControlChartByPin(pin: string): Promise<GlycemicControlChartDataTypes[]> {
    const responses = await this.glycemicControlResponseRepository.findByPin(pin);
    const responseList = responses || [];

    const questionCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const response of responseList) {
      const answeredQuestions = new Set<number>();
      for (const answer of response.answers) {
        if (answer.weight === 20 && answer.question >= 1 && answer.question <= 5) {
          answeredQuestions.add(answer.question);
        }
      }
      for (const question of answeredQuestions) {
        questionCounts[question] += 1;
      }
    }

    return [
      { students: questionCounts[1], question: 1 },
      { students: questionCounts[2], question: 2 },
      { students: questionCounts[3], question: 3 },
      { students: questionCounts[4], question: 4 },
      { students: questionCounts[5], question: 5 },
    ];
  }
}