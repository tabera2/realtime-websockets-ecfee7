import { WebSocket } from 'ws';

// Track which sockets care about which robot. A socket with no entry
// is treated as "subscribed to everything".
export class SubscriptionRegistry {
  private byRobot = new Map<string, Set<WebSocket>>();
  private explicit = new Set<WebSocket>();

  subscribe(socket: WebSocket, robotId: string) {
    this.explicit.add(socket);
    let set = this.byRobot.get(robotId);
    if (!set) {
      set = new Set();
      this.byRobot.set(robotId, set);
    }
    set.add(socket);
  }

  remove(socket: WebSocket) {
    this.explicit.delete(socket);
    for (const set of this.byRobot.values()) set.delete(socket);
  }

  // Who should receive a message for this robot?
  recipients(robotId: string, all: Set<WebSocket>): Set<WebSocket> {
    const targeted = this.byRobot.get(robotId) ?? new Set<WebSocket>();
    const result = new Set(targeted);
    // Sockets that never subscribed get everything (default-to-all).
    for (const s of all) if (!this.explicit.has(s)) result.add(s);
    return result;
  }
}
