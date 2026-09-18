import { Server as SocketIOServer, Namespace, Socket } from "socket.io";
import { container } from "tsyringe";
import { ExperimentServiceTypes } from "../modules/experiment/types/experiment.services.types";
import {
  ExperimentUpdatedPayload,
  JoinAckResponse,
  JoinPayload,
  SOCKET_EVENTS,
  SOCKET_NAMESPACE,
  getExperimentRoom,
} from "./types/socket.types";

let experimentNamespace: Namespace | null = null;

export function registerExperimentNamespace(io: SocketIOServer): Namespace {
  const nsp = io.of(SOCKET_NAMESPACE);
  experimentNamespace = nsp;

  nsp.on("connection", (socket: Socket) => {
    let joinedExperimentId: string | null = null;

    socket.on(
      SOCKET_EVENTS.JOIN,
      async (
        payload: JoinPayload,
        callback?: (response: JoinAckResponse) => void,
      ) => {
        try {
          const { pin, slug } = payload ?? ({} as JoinPayload);

          if (!pin || typeof pin !== "string" || pin.trim() === "") {
            callback?.({ success: false, error: "PIN inválido" });
            socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido",
            });
            return;
          }

          const experimentService =
            container.resolve<ExperimentServiceTypes>("ExperimentService");
          const experiment = await experimentService.getExperimentByPin(
            pin.trim(),
            slug,
          );

          const experimentId =
            (
              experiment as { _id?: { toString(): string }; id?: string }
            )._id?.toString() || (experiment as { id?: string }).id?.toString();
          if (!experimentId) {
            callback?.({ success: false, error: "Experimento inválido" });
            socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
              message: "Experimento inválido",
            });
            return;
          }

          const room = getExperimentRoom(experimentId);
          socket.join(room);
          joinedExperimentId = experimentId;

          callback?.({ success: true, experimentId });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro ao validar PIN";
          callback?.({ success: false, error: errorMessage });
          socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
            message: "PIN inválido ou experimento não encontrado",
          });
        }
      },
    );

    socket.on(SOCKET_EVENTS.LEAVE, () => {
      if (joinedExperimentId) {
        const room = getExperimentRoom(joinedExperimentId);
        socket.leave(room);
        joinedExperimentId = null;
      }
    });

    socket.on("disconnect", () => {
      if (joinedExperimentId) {
        const room = getExperimentRoom(joinedExperimentId);
        socket.leave(room);
        joinedExperimentId = null;
      }
    });
  });

  return nsp;
}

export function emitExperimentUpdate(
  experimentId: string,
  payload: ExperimentUpdatedPayload,
): void {
  if (!experimentNamespace) {
    console.warn(
      "[Socket.IO] Experiment namespace not initialized, skipping emit",
    );
    return;
  }

  try {
    const room = getExperimentRoom(experimentId);
    experimentNamespace.to(room).emit(SOCKET_EVENTS.UPDATED, payload);
  } catch (error) {
    console.error("[Socket.IO] Failed to emit experiment:updated", {
      experimentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
