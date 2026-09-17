export interface ExperimentUpdatedPayload {
  experimentId: string;
  liberateSend: boolean;
  liberateResult: boolean;
}

export interface JoinPayload {
  pin: string;
  slug: string;
}

export const SOCKET_EVENTS = {
  JOIN: 'join',
  LEAVE: 'leave',
  JOIN_REJECTED: 'experiment:join-rejected',
  UPDATED: 'experiment:updated',
} as const;

export const SOCKET_NAMESPACE = '/experiments';

export const getExperimentRoom = (experimentId: string): string => `experiment:${experimentId}`;