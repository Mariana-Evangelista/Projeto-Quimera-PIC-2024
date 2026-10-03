import { GlycemicControlResponseTypes } from "./glycemic-control-response.schemas.types";
import { GlycemicControlChartDataTypes } from "./glycemic-control-response.schemas.types";
import { GlycemicControlResponseInput } from "./glycemic-control-response.schemas.types";
import { GlycemicControlAnalyticsResponse } from "./glycemic-control-response.schemas.types";

export interface GlycemicControlResponseServiceTypes {
  createGlycemicControlResponse(
    response: GlycemicControlResponseInput,
  ): Promise<GlycemicControlResponseTypes>;
  getGlycemicControlResponseByPin(pin: string, requesterId: string): Promise<GlycemicControlResponseTypes[] | null>;
  deleteGlycemicControlResponse(id: string, requesterId: string): Promise<void>;
  getGlycemicControlChartByPin(pin: string): Promise<GlycemicControlAnalyticsResponse>;
}