import "reflect-metadata";
import { container } from "tsyringe";
import { GlycemicControlResponseRepository } from "./repositories/glycemic-control-response.repositories";
import { GlycemicControlResponseService } from "./services/glycemic-control-response.services";

container.registerSingleton("GlycemicControlResponseRepository", GlycemicControlResponseRepository);
container.registerSingleton("GlycemicControlResponseService", GlycemicControlResponseService);