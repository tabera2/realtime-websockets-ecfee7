// A discriminated union: every message has a "type" we can switch on.
export type ServerMessage =
  | { type: 'telemetry'; robotId: string; battery: number; x: number; y: number; ts: number }
  | { type: 'status'; robotId: string; state: 'idle' | 'moving' | 'charging' | 'error' };

export type ClientMessage =
  | { type: 'command'; robotId: string; action: 'stop' | 'home' }
  | { type: 'subscribe'; robotId: string };

// A type guard narrows an unknown message to a concrete variant.
export function isTelemetry(m: ServerMessage): m is Extract<ServerMessage, { type: 'telemetry' }> {
  return m.type === 'telemetry';
}
