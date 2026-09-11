import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { BodyWaterLossResponseServiceTypes } from "../types/body-water-loss-response.services.types";
import { BodyWaterLossResponseTypes, BodyWaterLossAnswerTypes } from "../types/body-water-loss-response.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";

@injectable()
export class BodyWaterLossResponseController {
  constructor(
    @inject("BodyWaterLossResponseService")
    private bodyWaterLossResponseService: BodyWaterLossResponseServiceTypes,
  ) {}

  createBodyWaterLossResponse = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, pin, answerOne, answerTwo } = req.body;

    const response: BodyWaterLossResponseTypes = { studentName, pin, answerOne, answerTwo, score: 0 };
    const newResponse = await this.bodyWaterLossResponseService.createBodyWaterLossResponse(response);
    res.status(201).json(newResponse);
  });

  getBodyWaterLossResponseByPin = asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.params;
    const response = await this.bodyWaterLossResponseService.getBodyWaterLossResponseByPin(pin);
    res.status(200).json(response);
  });

  updateBodyWaterLossResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentName, answerOne, answerTwo } = req.body;

    const existingResponse = await this.bodyWaterLossResponseService.getBodyWaterLossResponseById(id);

    const updatedData = {
      studentName: (studentName as string) || (existingResponse ? existingResponse.studentName : ""),
      pin: existingResponse ? existingResponse.pin : "",
      answerOne: answerOne || (existingResponse ? existingResponse.answerOne : null),
      answerTwo: answerTwo || (existingResponse ? existingResponse.answerTwo : null),
      score: 0,
    } as any;

    const updatedResponse = await this.bodyWaterLossResponseService.updateBodyWaterLossResponse(id, updatedData);
    res.status(200).json(updatedResponse);
  });

  deleteBodyWaterLossResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.bodyWaterLossResponseService.deleteBodyWaterLossResponse(id);
    res.status(204).send();
  });
}