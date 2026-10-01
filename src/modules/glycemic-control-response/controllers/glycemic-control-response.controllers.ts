import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { CustomRequest } from "../../../middlewares/authMiddleware";
import { GlycemicControlResponseServiceTypes } from "../types/glycemic-control-response.services.types";
import { GlycemicControlResponseTypes, GlycemicControlAnswerTypes, GlycemicControlResponseInput } from "../types/glycemic-control-response.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";
import ServiceError, { ServiceErrorType } from "../../../shared/errors/ServiceError";
import { ErrorCode } from "../../../shared/errors/errorCodes";

@injectable()
export class GlycemicControlResponseController {
  constructor(
    @inject("GlycemicControlResponseService")
    private glycemicControlResponseService: GlycemicControlResponseServiceTypes,
  ) {}

  createGlycemicControlResponse = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, pin, answers } = req.body;

    const input: GlycemicControlResponseInput = { studentName, pin, answers };
    const newResponse = await this.glycemicControlResponseService.createGlycemicControlResponse(input);
    res.status(201).json(newResponse);
  });

  getGlycemicControlResponseByPin = asyncHandler(async (req: CustomRequest, res: Response) => {
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
    const response = await this.glycemicControlResponseService.getGlycemicControlResponseByPin(pin, requesterId);
    res.status(200).json(response);
  });

  getGlycemicControlAnalyticsByPin = asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.params;
    const analytics = await this.glycemicControlResponseService.getGlycemicControlChartByPin(pin);
    res.status(200).json(analytics);
  });

  deleteGlycemicControlResponse = asyncHandler(async (req: CustomRequest, res: Response) => {
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
    await this.glycemicControlResponseService.deleteGlycemicControlResponse(id, requesterId);
    res.status(204).send();
  });
}