import { BodyWaterLossResponseTypes } from "./body-water-loss-response.schemas.types";
import { BodyWaterLossResponseInput } from "./body-water-loss-response.schemas.types";
import { BodyWaterLossAnalyticsResponse } from "./body-water-loss-response.schemas.types";

export interface BodyWaterLossResponseServiceTypes {
  createBodyWaterLossResponse(
    response: BodyWaterLossResponseInput,
  ): Promise<BodyWaterLossResponseTypes>;
  getBodyWaterLossResponseByPin(
    pin: string,
    requesterId: string,
  ): Promise<BodyWaterLossResponseTypes[] | null>;
  deleteBodyWaterLossResponse(id: string, requesterId: string): Promise<void>;
  getBodyWaterLossChartByPin(
    pin: string,
  ): Promise<BodyWaterLossAnalyticsResponse>;
}
