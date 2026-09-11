import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { CustomRequest } from "../../../middlewares/authMiddleware";
import { ExperimentServiceTypes } from "../types/experiment.services.types";
import { ExperimentTypes } from "../types/experiment.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";
import ServiceError, { ServiceErrorType } from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class ExperimentController {
  constructor(
    @inject("ExperimentService")
    private experimentService: ExperimentServiceTypes,
  ) {}

  createExperiment = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const teacherId = req.user?.id;
      const { type, university, class: className } = req.body;

      if (!teacherId)
        throw new ServiceError(
          "ID do professor não encontrado",
          ServiceErrorType.Unauthorized,
        );

      const experimentData: ExperimentTypes = {
        pin: randomBytes(8).toString("hex").slice(0, 6),
        teacher: teacherId,
        type,
        university,
        class: className,
        liberateSend: false,
        liberateResult: false,
        responsesNumber: 0,
        createdAt: new Date(),
      };

      const newExperiment =
        await this.experimentService.createExperiment(experimentData);
      res.status(201).json(newExperiment);
    },
  );

  getExperimentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const experiment =
      await this.experimentService.getExperimentById(id);
    res.status(200).json(experiment);
  });

  getExperimentByPin = asyncHandler(
    async (req: Request, res: Response) => {
      const { pin } = req.params;
      const experiment =
        await this.experimentService.getExperimentByPin(pin);
      res.status(200).json(experiment);
    },
  );

  getExperimentsByTeacher = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const teacherId = req.user?.id;
      if (!teacherId)
        throw new ServiceError(
          "ID do professor não encontrado",
          ServiceErrorType.Unauthorized,
        );
      const experiments =
        await this.experimentService.getExperimentsByTeacher(teacherId);
      res.status(200).json(experiments);
    },
  );
  updateExperiment = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "ID do professor não encontrado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    const { liberateSend, liberateResult } = req.body;

    const existingExperiment =
      await this.experimentService.getExperimentById(id);

    if (!existingExperiment)
      throw new ServiceError(
        "Experimento não encontrado",
        ServiceErrorType.NotFound,
      );

    const updatedData = {
      pin: existingExperiment.pin,
      teacher: existingExperiment.teacher,
      type: existingExperiment.type,
      university: existingExperiment.university,
      class: existingExperiment.class,
      liberateSend:
        liberateSend !== undefined
          ? liberateSend
          : existingExperiment.liberateSend,
      liberateResult:
        liberateResult !== undefined
          ? liberateResult
          : existingExperiment.liberateResult,
      responsesNumber: existingExperiment.responsesNumber,
      createdAt: existingExperiment.createdAt,
    };

    const updatedExperiment =
      await this.experimentService.updateExperiment(id, updatedData, requesterId);
    res.status(200).json(updatedExperiment);
  });

  deleteExperiment = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "ID do professor não encontrado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );

    await this.experimentService.deleteExperiment(id, requesterId);
    res.status(200).send();
  });
}