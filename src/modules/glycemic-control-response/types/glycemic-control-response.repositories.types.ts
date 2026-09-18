import { GlycemicControlResponseTypes } from "./glycemic-control-response.schemas.types";

export interface GlycemicControlResponseRepositoryTypes {
  create(response: GlycemicControlResponseTypes): Promise<GlycemicControlResponseTypes>;
  findByPin(pin: string): Promise<GlycemicControlResponseTypes[] | null>;
  findById(id: string): Promise<GlycemicControlResponseTypes | null>;
  update(id: string, response: GlycemicControlResponseTypes): Promise<GlycemicControlResponseTypes | null>;
  delete(id: string): Promise<void>;
}