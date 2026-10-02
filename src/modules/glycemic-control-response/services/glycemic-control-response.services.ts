import { inject, injectable } from "tsyringe";
import { isValidObjectId } from "mongoose";
import { GlycemicControlResponseServiceTypes } from "../types/glycemic-control-response.services.types";
import { GlycemicControlResponseRepositoryTypes } from "../types/glycemic-control-response.repositories.types";
import { GlycemicControlResponseTypes, GlycemicControlResponseInput, GlycemicControlChartDataTypes } from "../types/glycemic-control-response.schemas.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";
import { Experiment } from "../../experiment/schemas/experiment.schemas";
import { GLYCEMIC_CONTROL_ANSWER_KEY } from "../constants/glycemic-control-response.answer-key";
import { emitChartUpdate } from "../../../sockets";

@injectable()
export class GlycemicControlResponseService implements GlycemicControlResponseServiceTypes {
  constructor(
    @inject("GlycemicControlResponseRepository")
    private glycemicControlResponseRepository: GlycemicControlResponseRepositoryTypes,
  ) {}

  private async findExperimentByPinAndType(pin: string) {
    const experiment = await Experiment.findOne({
      pin,
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
    const response = await this.glycemicControlResponseRepository.findById(id);
    if (!response) {
      throw new ServiceError("Resposta não encontrada", ServiceErrorType.NotFound, undefined, ErrorCode.RESPONSE_NOT_FOUND);
    }
    return response;
  }

  private buildScoredAnswers(answers: unknown) {
    const total = Object.keys(GLYCEMIC_CONTROL_ANSWER_KEY).length;
    if (!Array.isArray(answers) || answers.length !== total) {
      throw new ServiceError(`É necessário responder as ${total} questões`, ServiceErrorType.BadRequest, undefined, ErrorCode.RESPONSE_INVALID_PAYLOAD);
    }
    const seen = new Set<number>();
    const scored = answers.map((a) => {
      const question = Number(a?.question);
      const key = Number.isInteger(question) ? GLYCEMIC_CONTROL_ANSWER_KEY[question] : undefined;
      const answer = typeof a?.answer === "string" ? a.answer.trim() : "";
      if (!key || !answer || answer.length > 100 || seen.has(question)) {
        throw new ServiceError("Respostas inválidas", ServiceErrorType.BadRequest, undefined, ErrorCode.RESPONSE_INVALID_PAYLOAD);
      }
      seen.add(question);
      return { question, answer, weight: answer === key.value ? key.weight : 0 };
    });
    return { answers: scored, score: scored.reduce((sum, a) => sum + a.weight, 0) };
  }

  async createGlycemicControlResponse(input: GlycemicControlResponseInput) {
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

    const { answers, ...rest } = input;
    const scored = this.buildScoredAnswers(answers);
    const toSave: GlycemicControlResponseTypes = { ...rest, studentName, pin, ...scored };

    const createdResponse =
      await this.glycemicControlResponseRepository.create(toSave);

    const chart = await this.getGlycemicControlChartByPin(pin);

    emitChartUpdate(
      "glycemic-control",
      experiment._id.toString(),
      chart,
    );

    return createdResponse;
  }

  async getGlycemicControlResponseByPin(pin: string, requesterId: string) {
    await this.assertExperimentOwner(pin, requesterId);
    return this.glycemicControlResponseRepository.findByPin(pin);
  }

  async deleteGlycemicControlResponse(id: string, requesterId: string) {
    const response = await this.findResponseOrFail(id);
    await this.assertExperimentOwner(response.pin, requesterId);
    return this.glycemicControlResponseRepository.delete(id);
  }

  async getGlycemicControlChartByPin(pin: string): Promise<GlycemicControlChartDataTypes[]> {
    await this.findExperimentByPinAndType(pin);

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