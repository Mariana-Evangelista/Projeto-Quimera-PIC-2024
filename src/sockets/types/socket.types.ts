export interface ExperimentUpdatedPayload {
  experimentId: string;
  liberateSend: boolean;
  liberateResult: boolean;
  status: "Não iniciado" | "Em Progresso" | "Finalizado";
}

export interface JoinPayload {
  pin: string;
  slug: string;
}

export interface JoinRejectedPayload {
  message: string;
}

export interface JoinAckResponse {
  success: boolean;
  experimentId?: string;
  error?: string;
}

export const SOCKET_EVENTS = {
  JOIN: "join",
  LEAVE: "leave",
  JOIN_REJECTED: "join-rejected",
  UPDATED: "update",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_NAMESPACE = "/experiment";

export const getExperimentRoom = (experimentId: string): string =>
  `experiment:${experimentId}`;

export interface ChartJoinPayload {
  pin: string;
}

export interface ExperimentChartUpdatedPayload<TChart = unknown> {
  experimentId: string;
  chart: TChart[];
}

export const CHART_SOCKET_EVENTS = {
  JOIN: "join",
  LEAVE: "leave",
  JOIN_REJECTED: "join-rejected",
  UPDATED: "update",
} as const;

export interface ChartSocketEventPayloadMap {
  join: ChartJoinPayload;
  "join-rejected": JoinRejectedPayload;
  update: ExperimentChartUpdatedPayload;
}
