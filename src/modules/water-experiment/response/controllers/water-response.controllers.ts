import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { WaterResponseServiceTypes } from "../types/water-response.services.types";
import { WaterResponseTypes, WaterAnswerTypes } from "../types/water-response.schemas.types";
import { asyncHandler } from "../../../../shared/asyncHandler";

@injectable()
export class WaterResponseController {
  constructor(
    @inject("WaterResponseService")
    private waterResponseService: WaterResponseServiceTypes,
  ) {}

  createWaterResponse = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, pin, answerOne, answerTwo } = req.body;

    const getWeight = (ans: WaterAnswerTypes | undefined) => {
      return Number(ans?.weight) || 0;
    };

    const score = getWeight(answerOne) + getWeight(answerTwo);

    const waterResponse: WaterResponseTypes = { studentName, pin, answerOne, answerTwo, score };
    const newWaterResponse = await this.waterResponseService.createWaterResponse(waterResponse);
    res.status(201).json(newWaterResponse);
  });

  getWaterResponseByPin = asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.params;
    const waterResponse = await this.waterResponseService.getWaterResponseByPin(pin);
    res.status(200).json(waterResponse);
  });

  updateWaterResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentName, answerOne, answerTwo } = req.body;

    const waterResponse = await this.waterResponseService.getWaterResponseById(id);

    const getWeight = (ans: WaterAnswerTypes | undefined) => {
      return Number(ans?.weight) || 0;
    };

    const score = getWeight(answerOne) + getWeight(answerTwo) || (waterResponse ? waterResponse.score : 0);

    const updatedData = {
      studentName: (studentName as string) || (waterResponse ? waterResponse.studentName : ""),
      pin: waterResponse ? waterResponse.pin : "",
      answerOne: answerOne || (waterResponse ? waterResponse.answerOne : null),
      answerTwo: answerTwo || (waterResponse ? waterResponse.answerTwo : null),
      score,
    } as any;

    const updatedWaterResponse = await this.waterResponseService.updateWaterResponse(id, updatedData);
    res.status(200).json(updatedWaterResponse);
  });

  deleteWaterResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.waterResponseService.deleteWaterResponse(id);
    res.status(204).send();
  });
}