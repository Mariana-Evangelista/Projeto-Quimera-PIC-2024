import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Namespace } from "socket.io";
import {
  registerExperimentNamespace,
  emitExperimentUpdate,
} from "./experiment.socket";
import {
  registerChartNamespace,
  emitChartUpdate,
} from "./chart.socket";

export interface SocketsInitResult {
  io: SocketIOServer;
  experimentsNamespace: Namespace;
  bodyWaterLossChartNamespace: Namespace;
  glycemicControlChartNamespace: Namespace;
}

export function initSockets(httpServer: HttpServer): SocketsInitResult {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.CORS_ORIGIN === "true"
          ? true
          : process.env.CORS_ORIGIN || true,
      credentials: true,
    },
    maxHttpBufferSize: 10_000,
  });

  const experimentsNamespace = registerExperimentNamespace(io);

  const bodyWaterLossChartNamespace = registerChartNamespace(
    io,
    "/body-water-loss-chart",
    "body-water-loss",
  );

  const glycemicControlChartNamespace = registerChartNamespace(
    io,
    "/glycemic-control-chart",
    "glycemic-control",
  );

  return {
    io,
    experimentsNamespace,
    bodyWaterLossChartNamespace,
    glycemicControlChartNamespace,
  };
}

export { emitExperimentUpdate };
export { emitChartUpdate };
