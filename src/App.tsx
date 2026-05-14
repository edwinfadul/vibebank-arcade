import { useState } from "react";
import "./App.css";
import ArcadeGame from "./arcade/ArcadeGame";
import TransactionApp from "./transaction/TransactionApp";

type GameMode = "arcade" | "transaction";

function App() {
  const [mode, setMode] = useState<GameMode>("arcade");

  return (
    <div className="dual-app-wrapper">
      <nav className="game-tabs">
        <button
          className={`game-tab ${mode === "arcade" ? "active" : ""}`}
          onClick={() => setMode("arcade")}
        >
          <span className="tab-icon">🕹️</span>
          <span className="tab-label">VibeBank Arcade</span>
        </button>
        <button
          className={`game-tab ${mode === "transaction" ? "active" : ""}`}
          onClick={() => setMode("transaction")}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">VibeBank Transaction</span>
        </button>
      </nav>

      <div className="game-viewport">
        {mode === "arcade" && (
          <div className="arcade-container">
            <ArcadeGame />
          </div>
        )}
        {mode === "transaction" && (
          <div className="transaction-container">
            <TransactionApp />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
