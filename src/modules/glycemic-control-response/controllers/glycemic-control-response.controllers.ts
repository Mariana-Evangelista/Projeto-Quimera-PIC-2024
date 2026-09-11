import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { GlycemicControlResponseServiceTypes } from "../types/glycemic-control-response.services.types";
import { GlycemicControlResponseTypes, GlycemicControlAnswerTypes } from "../types/glycemic-control-response.schemas.types";
import { asyncHandler } from "../../../shared/asyncHandler";

@injectable()
export class GlycemicControlResponseController {
  constructor(
    @inject("GlycemicControlResponseService")
    private glycemicControlResponseService: GlycemicControlResponseServiceTypes,
  ) {}

  createGlycemicControlResponse = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, pin, answers } = req.body;

    const response: GlycemicControlResponseTypes = { studentName, pin, answers, score: 0 };
    const newResponse = await this.glycemicControlResponseService.createGlycemicControlResponse(response);
    res.status(201).json(newResponse);
  });

  getGlycemicControlResponseByPin = asyncHandler(async (req: Request, res: Response) => {
    const { pin } = req.params;
    const response = await this.glycemicControlResponseService.getGlycemicControlResponseByPin(pin);
    res.status(200).json(response);
  });

  updateGlycemicControlResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentName, answers } = req.body;

    const existingResponse = await this.glycemicControlResponseService.getGlycemicControlResponseById(id);

    const updatedData = {
      studentName: (studentName as string) || (existingResponse ? existingResponse.studentName : ""),
      pin: existingResponse ? existingResponse.pin : "",
      answers: answers || (existingResponse ? existingResponse.answers : []),
      score: 0,
    } as any;

    const updatedResponse = await this.glycemicControlResponseService.updateGlycemicControlResponse(id, updatedData);
    res.status(200).json(updatedResponse);
  });

  deleteGlycemicControlResponse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.glycemicControlResponseService.deleteGlycemicControlResponse(id);
    res.status(204).send();
  });
}