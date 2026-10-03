import { Server as SocketIOServer, Namespace, Socket } from "socket.io";
import { container } from "tsyringe";
import { ExperimentServiceTypes } from "../modules/experiment/types/experiment.services.types";
import {
  ChartJoinPayload,
  CHART_SOCKET_EVENTS,
  ExperimentChartUpdatedPayload,
  getExperimentRoom,
  JoinAckResponse,
  JoinRejectedPayload,
} from "./types/socket.types";
import { createJoinThrottle } from "./joinThrottle";

type ChartExperimentType = "body-water-loss" | "glycemic-control";

const chartNamespaces = new Map<ChartExperimentType, Namespace>();

export function registerChartNamespace(
  io: SocketIOServer,
  namespacePath: string,
  experimentType: ChartExperimentType,
): Namespace {
  const nsp = io.of(namespacePath);
  chartNamespaces.set(experimentType, nsp);

  nsp.on("connection", (socket: Socket) => {
    let joinedExperimentId: string | null = null;
    const joinThrottle = createJoinThrottle(10, 60_000);

    socket.on(
      CHART_SOCKET_EVENTS.JOIN,
      async (
        payload: ChartJoinPayload,
        callback?: (response: JoinAckResponse) => void,
      ) => {
        const safeCallback = typeof callback === "function" ? callback : () => {};

        if (!joinThrottle()) {
          safeCallback({ success: false, error: "Muitas tentativas. Aguarde um instante." });
          socket.emit(CHART_SOCKET_EVENTS.JOIN_REJECTED, {
            message: "Muitas tentativas. Aguarde um instante.",
          } as JoinRejectedPayload);
          return;
        }

        try {
          const { pin } = payload ?? ({} as ChartJoinPayload);

          if (!pin || typeof pin !== "string" || pin.trim() === "" || pin.length !== 6) {
            safeCallback({ success: false, error: "PIN inválido" });
            socket.emit(CHART_SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido ou experimento não encontrado",
            } as JoinRejectedPayload);
            return;
          }

          const experimentService =
            container.resolve<ExperimentServiceTypes>("ExperimentService");
          const experiment = await experimentService.getExperimentByPinForParticipant(
            pin.trim(),
            experimentType,
          );

          const experimentId =
            (
              experiment as { _id?: { toString(): string }; id?: string }
            )._id?.toString() || (experiment as { id?: string }).id?.toString();
          if (!experimentId) {
            safeCallback({ success: false, error: "Experimento inválido" });
            socket.emit(CHART_SOCKET_EVENTS.JOIN_REJECTED, {
              message: "PIN inválido ou experimento não encontrado",
            } as JoinRejectedPayload);
            return;
          }

          if (joinedExperimentId) {
            const previousRoom = getExperimentRoom(joinedExperimentId);
            socket.leave(previousRoom);
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
          socket.emit(CHART_SOCKET_EVENTS.JOIN_REJECTED, {
            message: "PIN inválido ou experimento não encontrado",
          } as JoinRejectedPayload);
        }
      },
    );

    socket.on(CHART_SOCKET_EVENTS.LEAVE, () => {
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

export function emitChartUpdate<TChart, TKPIs>(
  experimentType: ChartExperimentType,
  experimentId: string,
  chart: TChart[],
  kpis: TKPIs,
): void {
  const namespace = chartNamespaces.get(experimentType);

  if (!namespace) {
    console.warn(
      "[Socket.IO] Chart namespace not initialized, skipping emit",
    );
    return;
  }

  try {
    const payload: ExperimentChartUpdatedPayload<TChart, TKPIs> = {
      experimentId,
      chart,
      kpis,
    };

    const room = getExperimentRoom(experimentId);
    namespace.to(room).emit(CHART_SOCKET_EVENTS.UPDATED, payload);
  } catch (error) {
    console.error("[Socket.IO] Failed to emit chart:updated", {
      experimentType,
      experimentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}