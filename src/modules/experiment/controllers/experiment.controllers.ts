import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { CustomRequest } from "../../../middlewares/authMiddleware";
import { ExperimentServiceTypes } from "../types/experiment.services.types";
import { ExperimentTypes, UpdateExperimentTypes } from "../types/experiment.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";
import ServiceError, { ServiceErrorType } from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";
import { emitExperimentUpdate } from "../../../sockets";

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
        status: "Não iniciado",
      };

      const newExperiment =
        await this.experimentService.createExperiment(experimentData);
      res.status(201).json(newExperiment);
    },
  );

  getExperimentById = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId)
      throw new ServiceError(
        "ID do professor não encontrado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    const experiment =
      await this.experimentService.getExperimentById(id, requesterId);
    res.status(200).json(experiment);
  });

  getExperimentByPin = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const { pin, slug } = req.params;
      const requesterId = req.user?.id;
      if (!requesterId)
        throw new ServiceError(
          "ID do professor não encontrado",
          ServiceErrorType.Unauthorized,
          undefined,
          ErrorCode.AUTH_UNAUTHORIZED,
        );
      const experiment =
        await this.experimentService.getExperimentByPin(pin, slug, requesterId);
      res.status(200).json(experiment);
    },
  );

  getExperimentByPinForParticipant = asyncHandler(
    async (req: Request, res: Response) => {
      const { pin, slug } = req.params;
      const experiment =
        await this.experimentService.getExperimentByPinForParticipant(pin, slug);
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

    const body = req.body;
    if (!body || typeof body !== "object") {
      throw new ServiceError(
        "Body inválido",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }

    const allowedFields = ["university", "class", "liberateSend", "liberateResult"];
    const receivedFields = Object.keys(body);
    const invalidFields = receivedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new ServiceError(
        `Campos não permitidos: ${invalidFields.join(", ")}`,
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.EXPERIMENT_INVALID_UPDATE_FIELD,
      );
    }

    if (body.university !== undefined && typeof body.university !== "string") {
      throw new ServiceError(
        "Campo 'university' deve ser string",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.class !== undefined && typeof body.class !== "string") {
      throw new ServiceError(
        "Campo 'class' deve ser string",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.liberateSend !== undefined && typeof body.liberateSend !== "boolean") {
      throw new ServiceError(
        "Campo 'liberateSend' deve ser boolean",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }
    if (body.liberateResult !== undefined && typeof body.liberateResult !== "boolean") {
      throw new ServiceError(
        "Campo 'liberateResult' deve ser boolean",
        ServiceErrorType.BadRequest,
        undefined,
        ErrorCode.BAD_REQUEST,
      );
    }

    const updateData: UpdateExperimentTypes = {};
    if (body.university !== undefined) updateData.university = body.university;
    if (body.class !== undefined) updateData.class = body.class;
    if (body.liberateSend !== undefined) updateData.liberateSend = body.liberateSend;
    if (body.liberateResult !== undefined) updateData.liberateResult = body.liberateResult;

    const updatedExperiment =
      await this.experimentService.updateExperiment(id, updateData, requesterId);

    if (updatedExperiment) {
      const experimentId = (updatedExperiment as any)._id?.toString() || (updatedExperiment as any).id?.toString();
      if (experimentId) {
        emitExperimentUpdate(experimentId, {
          experimentId,
          liberateSend: updatedExperiment.liberateSend,
          liberateResult: updatedExperiment.liberateResult,
          status: updatedExperiment.status,
        });
      }
    }

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
    res.status(204).send();
  });
}