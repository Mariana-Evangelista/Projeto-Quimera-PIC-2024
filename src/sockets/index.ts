import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Namespace } from "socket.io";
import {
  registerExperimentNamespace,
  emitExperimentUpdate,
} from "./experiment.socket";

export interface SocketsInitResult {
  io: SocketIOServer;
  experimentsNamespace: Namespace;
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
  });

  const experimentsNamespace = registerExperimentNamespace(io);

  return { io, experimentsNamespace };
}

export { emitExperimentUpdate };
