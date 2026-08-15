import { useTelemetry } from './useTelemetry';

export function RobotConsole({ robotId }: { robotId: string }) {
  const { battery, connected, send } = useTelemetry('ws://localhost:8080', robotId);

  function stop() {
    send({ type: 'command', robotId, action: 'stop' });
  }
  function home() {
    send({ type: 'command', robotId, action: 'home' });
  }

  return (
    <div className="console">
      <header>
        <h3>{robotId}</h3>
        <span className={connected ? 'badge live' : 'badge offline'}>
          {connected ? '● Live' : '○ Reconnecting…'}
        </span>
      </header>

      <p className="battery">
        Battery: {battery === null ? '—' : `${battery}%`}
      </p>

      <div className="controls">
        {/* Don't let an operator fire a command into a dead socket. */}
        <button onClick={stop} disabled={!connected}>Stop</button>
        <button onClick={home} disabled={!connected}>Return home</button>
      </div>
    </div>
  );
}
