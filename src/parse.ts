import { ClientMessage, ServerMessage } from './protocol';

// A safe JSON.parse that returns null instead of throwing.
function tryJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Validate an inbound CLIENT message at the trust boundary.
export function parseClientMessage(raw: string): ClientMessage | null {
  const v = tryJson(raw);
  if (typeof v !== 'object' || v === null) return null;
  const m = v as Record<string, unknown>;

  if (m.type === 'command' && typeof m.robotId === 'string' &&
      (m.action === 'stop' || m.action === 'home')) {
    return { type: 'command', robotId: m.robotId, action: m.action };
  }
  if (m.type === 'subscribe' && typeof m.robotId === 'string') {
    return { type: 'subscribe', robotId: m.robotId };
  }
  return null;
}

// Validate an inbound SERVER message (used by the client).
export function parseServerMessage(raw: string): ServerMessage | null {
  const v = tryJson(raw);
  if (typeof v !== 'object' || v === null) return null;
  const m = v as Record<string, unknown>;
  if (m.type === 'telemetry' || m.type === 'status') {
    return m as unknown as ServerMessage;
  }
  return null;
}
