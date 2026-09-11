import { BodyWaterLossResponseTypes } from "./body-water-loss-response.schemas.types";

export interface BodyWaterLossResponseRepositoryTypes {
  create(response: BodyWaterLossResponseTypes): Promise<BodyWaterLossResponseTypes>;
  findByPin(pin: string): Promise<BodyWaterLossResponseTypes[] | null>;
  findById(id: string): Promise<BodyWaterLossResponseTypes | null>;
  update(id: string, response: BodyWaterLossResponseTypes): Promise<BodyWaterLossResponseTypes | null>;
  delete(id: string): Promise<void>;
}