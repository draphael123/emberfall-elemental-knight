"use client";

export default function ErrorScreen({ reset }: { reset: () => void }) {
  return (
    <main className="game-error">
      <p className="eyebrow">THE CHRONICLE FALTERED</p>
      <h1>The gate did not open.</h1>
      <p>Your campaign record remains on this device. Relight the scene to continue.</p>
      <button className="primary" onClick={reset}>Relight Emberfall</button>
    </main>
  );
}
