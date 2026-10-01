import { inject, injectable } from "tsyringe";
import { ExperimentServiceTypes } from "../types/experiment.services.types";
import { ExperimentTypes, UpdateExperimentTypes, ExperimentStatus } from "../types/experiment.schemas.types";
import { ExperimentRepositoryTypes } from "../types/experiment.repositories.types";
import ServiceError, {
  ServiceErrorType,
} from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class ExperimentService implements ExperimentServiceTypes {
  constructor(
    @inject("ExperimentRepository")
    private experimentRepository: ExperimentRepositoryTypes,
  ) {}

  getExperimentStatus(liberateSend: boolean, liberateResult: boolean): ExperimentStatus {
    if (liberateResult === true) return "Finalizado";
    if (liberateSend === true) return "Em Progresso";
    return "Não iniciado";
  }

  async createExperiment(experiment: ExperimentTypes) {
    if (
      !experiment.type ||
      !experiment.teacher ||
      !experiment.university ||
      !experiment.class
    ) {
      throw new ServiceError(
        "Campos obrigatórios do experimento ausentes",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.EXPERIMENT_MISSING_FIELDS,
      );
    }

    const validTypes: ExperimentTypes["type"][] = [
      "body-water-loss",
      "glycemic-control",
    ];
    if (!validTypes.includes(experiment.type)) {
      throw new ServiceError(
        "Tipo de experimento inválido",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.EXPERIMENT_MISSING_FIELDS,
      );
    }

    const experimentWithDefaults = {
      ...experiment,
      liberateSend: false,
      liberateResult: false,
      responsesNumber: 0,
      status: "Não iniciado" as ExperimentStatus,
    };

    const MAX_RETRIES = 5;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.experimentRepository.create(experimentWithDefaults);
      } catch (err: any) {
        if (err?.code === 11000 && err.message?.includes("pin")) {
          if (attempt === MAX_RETRIES - 1) {
            throw new ServiceError(
              "Conflito: PIN do experimento não pôde ser gerado",
              ServiceErrorType.Conflict,
              undefined,
              ErrorCode.EXPERIMENT_PIN_CONFLICT,
            );
          }

          const { randomBytes } = require("crypto");
          experimentWithDefaults.pin = randomBytes(8).toString("hex").slice(0, 6);
          continue;
        }
        throw err;
      }
    }

    throw new ServiceError(
      "Conflito: PIN do experimento não pôde ser gerado",
      ServiceErrorType.Conflict,
      undefined,
      ErrorCode.EXPERIMENT_PIN_CONFLICT,
    );
  }

  async getExperimentById(id: string, requesterId: string) {
    const exp = await this.experimentRepository.findById(id);
    if (!exp)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );

    const ownerId = String((exp as any).teacher);
    if (ownerId !== requesterId) {
      throw new ServiceError(
        "Operação não autorizada",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.EXPERIMENT_FORBIDDEN,
      );
    }

    return exp;
  }

  async getExperimentByPin(pin: string, slug: string, requesterId: string) {
    const exp = await this.experimentRepository.findByPin(pin);
    if (!exp)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );

    if (exp.type !== slug) {
      throw new ServiceError(
        "O Pin não corresponde ao experimento acessado",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.EXPERIMENT_TYPE_MISMATCH,
      );
    }

    const ownerId = String((exp as any).teacher);
    if (ownerId !== requesterId) {
      throw new ServiceError(
        "Operação não autorizada",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.EXPERIMENT_FORBIDDEN,
      );
    }

    return exp;
  }

  async getExperimentByPinForParticipant(pin: string, slug: string) {
    const exp = await this.experimentRepository.findByPin(pin);
    if (!exp)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );

    if (exp.type !== slug) {
      throw new ServiceError(
        "O Pin não corresponde ao experimento acessado",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.EXPERIMENT_TYPE_MISMATCH,
      );
    }

    return exp;
  }

  async getExperimentsByTeacher(teacherId: string) {
    return this.experimentRepository.findByTeacher(teacherId);
  }

  async updateExperiment(
    id: string,
    experiment: UpdateExperimentTypes,
    requesterId: string,
  ) {
    const existing = await this.experimentRepository.findById(id);
    if (!existing)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );

    const ownerId = String((existing as any).teacher);
    if (ownerId !== requesterId) {
      throw new ServiceError(
        "Operação não autorizada",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.EXPERIMENT_FORBIDDEN,
      );
    }

    const currentStatus = this.getExperimentStatus(
      existing.liberateSend,
      existing.liberateResult
    );

    if (currentStatus === "Finalizado" && (experiment.liberateSend !== undefined || experiment.liberateResult !== undefined)) {
      throw new ServiceError(
        "Experimento finalizado não pode ter flags alteradas",
        ServiceErrorType.Conflict,
        undefined,
        ErrorCode.EXPERIMENT_FINALIZED,
      );
    }

    const updated: ExperimentTypes = {
      pin: existing.pin,
      teacher: existing.teacher,
      type: existing.type,
      university: experiment.university ?? existing.university,
      class: experiment.class ?? existing.class,
      liberateSend: experiment.liberateSend ?? existing.liberateSend,
      liberateResult: experiment.liberateResult ?? existing.liberateResult,
      responsesNumber: existing.responsesNumber,
      createdAt: existing.createdAt,
      status: this.getExperimentStatus(
        experiment.liberateSend ?? existing.liberateSend,
        experiment.liberateResult ?? existing.liberateResult
      ),
    };

    return this.experimentRepository.update(id, updated);
  }

  async deleteExperiment(id: string, requesterId: string) {
    const existing = await this.experimentRepository.findById(id);
    if (!existing)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
        undefined,
        ErrorCode.EXPERIMENT_NOT_FOUND,
      );

    const ownerId = String((existing as any).teacher);
    if (ownerId !== requesterId) {
      throw new ServiceError(
        "Operação não autorizada",
        ServiceErrorType.Forbidden,
        undefined,
        ErrorCode.EXPERIMENT_FORBIDDEN,
      );
    }

    return this.experimentRepository.delete(id);
  }
}