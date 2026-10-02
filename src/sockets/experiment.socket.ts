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
import { createJoinThrottle } from "./joinThrottle";

let experimentNamespace: Namespace | null = null;

export function registerExperimentNamespace(io: SocketIOServer): Namespace {
  const nsp = io.of(SOCKET_NAMESPACE);
  experimentNamespace = nsp;

  nsp.on("connection", (socket: Socket) => {
    let joinedExperimentId: string | null = null;
    const joinThrottle = createJoinThrottle(10, 60_000);

    socket.on(
      SOCKET_EVENTS.JOIN,
      async (
        payload: JoinPayload,
        callback?: (response: JoinAckResponse) => void,
      ) => {
        const safeCallback = typeof callback === "function" ? callback : () => {};

        if (!joinThrottle()) {
          safeCallback({ success: false, error: "Muitas tentativas. Aguarde um instante." });
          socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
            message: "Muitas tentativas. Aguarde um instante.",
          });
          return;
        }

        try {
          const { pin, slug } = payload ?? ({} as JoinPayload);

          if (!pin || typeof pin !== "string" || pin.trim() === "" || pin.length > 32) {
            safeCallback({ success: false, error: "PIN inválido" });
            socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido ou experimento não encontrado",
            });
            return;
          }

          if (slug !== undefined && typeof slug !== "string") {
            safeCallback({ success: false, error: "Slug inválido" });
            socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido ou experimento não encontrado",
            });
            return;
          }

          const experimentService =
            container.resolve<ExperimentServiceTypes>("ExperimentService");
          const experiment = await experimentService.getExperimentByPinForParticipant(
            pin.trim(),
            slug,
          );

          const experimentId =
            (
              experiment as { _id?: { toString(): string }; id?: string }
            )._id?.toString() || (experiment as { id?: string }).id?.toString();
          if (!experimentId) {
            safeCallback({ success: false, error: "Experimento inválido" });
            socket.emit(SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido ou experimento não encontrado",
            });
            return;
          }

          const room = getExperimentRoom(experimentId);
          socket.join(room);
          joinedExperimentId = experimentId;

          safeCallback({ success: true, experimentId });
        } catch (error) {
          if (!(error instanceof Error)) {
            console.error("[Socket.IO] Unexpected error in join:", error);
          }
          safeCallback({ success: false, error: "PIN inválido ou experimento não encontrado" });
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
