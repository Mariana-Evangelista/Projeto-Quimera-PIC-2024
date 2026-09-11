import { GlycemicControlResponseTypes } from "./glycemic-control-response.schemas.types";

export interface GlycemicControlResponseServiceTypes {
  createGlycemicControlResponse(
    response: GlycemicControlResponseTypes,
  ): Promise<GlycemicControlResponseTypes>;
  getGlycemicControlResponseByPin(pin: string): Promise<GlycemicControlResponseTypes[] | null>;
  getGlycemicControlResponseById(id: string): Promise<GlycemicControlResponseTypes | null>;
  updateGlycemicControlResponse(
    id: string,
    response: GlycemicControlResponseTypes,
  ): Promise<GlycemicControlResponseTypes | null>;
  deleteGlycemicControlResponse(id: string): Promise<void>;
}