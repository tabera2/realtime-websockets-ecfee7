import { useEffect, useRef, useState } from 'react';
import { ClientMessage, isTelemetry } from './protocol';
import { parseServerMessage } from './parse';

export function useTelemetry(url: string, robotId?: string) {
  const [battery, setBattery] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let closed = false;
    let retry = 500;

    function connect() {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onmessage = (e) => {
        const msg = parseServerMessage(e.data);
        if (msg && isTelemetry(msg)) setBattery(msg.battery);
      };

      ws.onopen = () => {
        retry = 500; // reset backoff on success
        setConnected(true);
        // Subscribe to one robot if asked; otherwise we get the whole fleet.
        if (robotId) ws.send(JSON.stringify({ type: 'subscribe', robotId }));
      };

      ws.onclose = () => {
        setConnected(false);
        if (closed) return;
        setTimeout(connect, retry);
        retry = Math.min(retry * 2, 5000);
      };
    }

    connect();
    return () => {
      closed = true;
      socketRef.current?.close();
    };
  }, [url, robotId]);

  function send(msg: ClientMessage) {
    socketRef.current?.send(JSON.stringify(msg));
  }

  return { battery, connected, send };
}
