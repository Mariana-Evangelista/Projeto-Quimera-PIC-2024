import { injectable } from "tsyringe";
import { ExperimentRepositoryTypes } from "../types/experiment.repositories.types";
import { ExperimentTypes } from "../types/experiment.schemas.types";
import { Experiment } from "../schemas/experiment.schemas";
import { BodyWaterLossResponse } from "../../body-water-loss-response/schemas/body-water-loss-response.schemas";
import { GlycemicControlResponse } from "../../glycemic-control-response/schemas/glycemic-control-response.schemas";

@injectable()
export class ExperimentRepository implements ExperimentRepositoryTypes {
  async create(experiment: ExperimentTypes) {
    const newExperiment = new Experiment(experiment);
    return await newExperiment.save();
  }
  async findById(id: string) {
    return await Experiment.findById(id);
  }
  async findByPin(pin: string) {
    return await Experiment.findOne({ pin });
  }
  async findByTeacher(teacherId: string): Promise<ExperimentTypes[]> {
    return await Experiment.find({ teacher: teacherId });
  }
  async update(id: string, experiment: ExperimentTypes) {
    return await Experiment.findByIdAndUpdate(id, experiment, {
      new: true,
      runValidators: true,
    });
  }
  async delete(id: string) {
    const experiment = await Experiment.findById(id);
    if (!experiment) return;

    // Apaga as respostas associadas ao PIN do experimento (filhos primeiro, pai por último)
    // Ordem: respostas primeiro, experimento por último.
    // Se falhar no meio, sobra experimento vazio e repetir o DELETE resolve, mas nunca ficam respostas órfãs.
    if (experiment.type === "body-water-loss") {
      await BodyWaterLossResponse.deleteMany({ pin: experiment.pin });
    } else if (experiment.type === "glycemic-control") {
      await GlycemicControlResponse.deleteMany({ pin: experiment.pin });
    }

    await Experiment.findByIdAndDelete(id);
  }
}