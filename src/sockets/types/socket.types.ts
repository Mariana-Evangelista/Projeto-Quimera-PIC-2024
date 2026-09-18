export interface ExperimentUpdatedPayload {
  experimentId: string;
  liberateSend: boolean;
  liberateResult: boolean;
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
