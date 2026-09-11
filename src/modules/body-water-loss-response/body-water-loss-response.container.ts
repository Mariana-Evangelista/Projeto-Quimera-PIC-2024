import "reflect-metadata";
import { container } from "tsyringe";
import { BodyWaterLossResponseRepository } from "./repositories/body-water-loss-response.repositories";
import { BodyWaterLossResponseService } from "./services/body-water-loss-response.services";

container.registerSingleton("BodyWaterLossResponseRepository", BodyWaterLossResponseRepository);
container.registerSingleton("BodyWaterLossResponseService", BodyWaterLossResponseService);