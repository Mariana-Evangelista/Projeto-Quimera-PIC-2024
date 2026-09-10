import "reflect-metadata";
import { container } from "tsyringe";
import { ExperimentRepository } from "./repositories/experiment.repositories";
import { ExperimentService } from "./services/experiment.services";

container.registerSingleton("ExperimentRepository", ExperimentRepository);
container.registerSingleton("ExperimentService", ExperimentService);