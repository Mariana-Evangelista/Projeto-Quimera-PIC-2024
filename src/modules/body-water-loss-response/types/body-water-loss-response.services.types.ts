import { BodyWaterLossResponseTypes } from "./body-water-loss-response.schemas.types";

export interface BodyWaterLossResponseServiceTypes {
  createBodyWaterLossResponse(
    response: BodyWaterLossResponseTypes,
  ): Promise<BodyWaterLossResponseTypes>;
  getBodyWaterLossResponseByPin(pin: string): Promise<BodyWaterLossResponseTypes[] | null>;
  getBodyWaterLossResponseById(id: string): Promise<BodyWaterLossResponseTypes | null>;
  updateBodyWaterLossResponse(
    id: string,
    response: BodyWaterLossResponseTypes,
  ): Promise<BodyWaterLossResponseTypes | null>;
  deleteBodyWaterLossResponse(id: string): Promise<void>;
}