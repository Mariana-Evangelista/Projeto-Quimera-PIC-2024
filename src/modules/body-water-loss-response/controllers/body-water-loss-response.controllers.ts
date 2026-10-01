import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { CustomRequest } from "../../../middlewares/authMiddleware";
import { BodyWaterLossResponseServiceTypes } from "../types/body-water-loss-response.services.types";
import { BodyWaterLossResponseTypes, BodyWaterLossAnswerTypes, BodyWaterLossResponseInput } from "../types/body-water-loss-response.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";
import ServiceError, { ServiceErrorType } from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class BodyWaterLossResponseController {
  constructor(
    @inject("BodyWaterLossResponseService")
    private bodyWaterLossResponseService: BodyWaterLossResponseServiceTypes,
  ) {}

  createBodyWaterLossResponse = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, pin, answerOne, answerTwo } = req.body;

    const input: BodyWaterLossResponseInput = { studentName, pin, answerOne, answerTwo };
    const newResponse = await this.bodyWaterLossResponseService.createBodyWaterLossResponse(input);
    res.status(201).json(newResponse);
  });

  getBodyWaterLossResponseByPin = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { pin } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId) {
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    }
    const response = await this.bodyWaterLossResponseService.getBodyWaterLossResponseByPin(pin, requesterId);
    res.status(200).json(response);
  });

  getBodyWaterLossAnalyticsByPin = asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.params;
    const analytics = await this.bodyWaterLossResponseService.getBodyWaterLossChartByPin(pin);
    res.status(200).json(analytics);
  });

  deleteBodyWaterLossResponse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { id } = req.params;
    const requesterId = req.user?.id;
    if (!requesterId) {
      throw new ServiceError(
        "Acesso não autorizado",
        ServiceErrorType.Unauthorized,
        undefined,
        ErrorCode.AUTH_UNAUTHORIZED,
      );
    }
    await this.bodyWaterLossResponseService.deleteBodyWaterLossResponse(id, requesterId);
    res.status(204).send();
  });
}