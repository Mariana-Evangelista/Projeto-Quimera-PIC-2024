import { inject, injectable } from "tsyringe";
import { isValidObjectId } from "mongoose";
import { BodyWaterLossResponseServiceTypes } from "../types/body-water-loss-response.services.types";
import { BodyWaterLossResponseRepositoryTypes } from "../types/body-water-loss-response.repositories.types";
import { BodyWaterLossResponseTypes, BodyWaterLossResponseInput, BodyWaterLossChartDataTypes, BodyWaterLossChartScore, BodyWaterLossAnalyticsResponse, BodyWaterLossKPIs } from "../types/body-water-loss-response.schemas.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";
import { Experiment } from "../../experiment/schemas/experiment.schemas";
import { BODY_WATER_LOSS_ANSWER_KEY } from "../constants/body-water-loss-response.answer-key";
import { emitChartUpdate } from "../../../sockets";

@injectable()
export class BodyWaterLossResponseService implements BodyWaterLossResponseServiceTypes {
  constructor(
    @inject("BodyWaterLossResponseRepository")
    private bodyWaterLossResponseRepository: BodyWaterLossResponseRepositoryTypes,
  ) {}

  private async findExperimentByPinAndType(pin: string) {
    const experiment = await Experiment.findOne({
      pin,
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
    return experiment;
  }

  private assertAcceptingResponses(experiment: { status: string }) {
    if (experiment.status === "Não iniciado") {
      throw new ServiceError(
        "O experimento ainda não foi liberado para envio",
        ServiceErrorType.Conflict,
        undefined,
        ErrorCode.EXPERIMENT_NOT_STARTED,
      );
    }
    if (experiment.status === "Finalizado") {
      throw new ServiceError(
        "Experimento finalizado não aceita novas respostas",
        ServiceErrorType.Conflict,
        undefined,
        ErrorCode.EXPERIMENT_FINALIZED,
      );
    }
  }

  private async assertExperimentOwner(pin: string, requesterId: string) {
    const experiment = await this.findExperimentByPinAndType(pin);
    if (String(experiment.teacher) !== requesterId) {
      throw new ServiceError(
        "Operação não autorizada",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.EXPERIMENT_FORBIDDEN,
      );
    }
    return experiment;
  }

  private async findResponseOrFail(id: string) {
    if (!isValidObjectId(id)) {
      throw new ServiceError("ID inválido", ServiceErrorType.BadRequest, undefined, ErrorCode.BAD_REQUEST);
    }
    const response = await this.bodyWaterLossResponseRepository.findById(id);
    if (!response) {
      throw new ServiceError("Resposta não encontrada", ServiceErrorType.NotFound, undefined, ErrorCode.RESPONSE_NOT_FOUND);
    }
    return response;
  }

  private extractValue(input: unknown): string {
    const raw = typeof input === "string" ? input : (input as { value?: unknown } | null)?.value;
    if (typeof raw !== "string" || raw.trim() === "" || raw.length > 100) {
      throw new ServiceError("Resposta inválida", ServiceErrorType.BadRequest, undefined, ErrorCode.RESPONSE_INVALID_PAYLOAD);
    }
    return raw.trim().normalize("NFC");
  }

  private buildScoredAnswers(rawOne: unknown, rawTwo: unknown) {
    const key = BODY_WATER_LOSS_ANSWER_KEY;
    const valueOne = this.extractValue(rawOne);
    const valueTwo = this.extractValue(rawTwo);
    const one = { value: valueOne, weight: valueOne === key.answerOne.value ? key.answerOne.weight : 0 };
    const two = { value: valueTwo, weight: valueTwo === key.answerTwo.value ? key.answerTwo.weight : 0 };
    return { answerOne: one, answerTwo: two, score: one.weight + two.weight };
  }

  async createBodyWaterLossResponse(input: BodyWaterLossResponseInput) {
    const pin = typeof input.pin === "string" ? input.pin.trim() : "";
    if (!pin || pin.length !== 6) {
      throw new ServiceError(
        "PIN do experimento é obrigatório",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.RESPONSE_PIN_REQUIRED,
      );
    }

    const studentName = typeof input.studentName === "string" ? input.studentName.trim() : "";
    if (!studentName || studentName.length > 100) {
      throw new ServiceError(
        "Nome do aluno inválido",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.RESPONSE_INVALID_PAYLOAD,
      );
    }

    const experiment = await this.findExperimentByPinAndType(pin);
    this.assertAcceptingResponses(experiment);

    const { answerOne, answerTwo, ...rest } = input;
    const scored = this.buildScoredAnswers(answerOne, answerTwo);
    const toSave: BodyWaterLossResponseTypes = { ...rest, studentName, pin, ...scored };

    const createdResponse =
      await this.bodyWaterLossResponseRepository.create(toSave);

    const analytics = await this.getBodyWaterLossChartByPin(pin);

    emitChartUpdate(
      "body-water-loss",
      experiment._id.toString(),
      analytics.chart,
      analytics.kpis,
    );

    return createdResponse;
  }

  async getBodyWaterLossResponseByPin(pin: string, requesterId: string) {
    await this.assertExperimentOwner(pin, requesterId);
    return this.bodyWaterLossResponseRepository.findByPin(pin);
  }

  async deleteBodyWaterLossResponse(id: string, requesterId: string) {
    const response = await this.findResponseOrFail(id);
    await this.assertExperimentOwner(response.pin, requesterId);
    return this.bodyWaterLossResponseRepository.delete(id);
  }

  async getBodyWaterLossChartByPin(pin: string): Promise<BodyWaterLossAnalyticsResponse> {
    await this.findExperimentByPinAndType(pin);

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

    const chart: BodyWaterLossChartDataTypes[] = [
      { students: scoreBuckets[0].students, score: 0 as BodyWaterLossChartScore, label: scoreBuckets[0].label },
      { students: scoreBuckets[20].students, score: 20 as BodyWaterLossChartScore, label: scoreBuckets[20].label },
      { students: scoreBuckets[80].students, score: 80 as BodyWaterLossChartScore, label: scoreBuckets[80].label },
      { students: scoreBuckets[100].students, score: 100 as BodyWaterLossChartScore, label: scoreBuckets[100].label },
    ];

    const totalResponses = responseList.length;
    const averageScore = totalResponses > 0
      ? responseList.reduce((sum, r) => sum + r.score, 0) / totalResponses
      : 0;

    const kpis: BodyWaterLossKPIs = {
      totalResponses,
      averageScore: Math.round(averageScore),
    };

    return { chart, kpis };
  }
}