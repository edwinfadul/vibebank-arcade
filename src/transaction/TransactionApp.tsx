import { useState } from "react";
import "./TransactionApp.css";
import { AccountMarioLevel } from "../components/AccountMarioLevel";
import { BankShootLevel } from "../components/BankShootLevel";
import { CoinDragLevel } from "../components/CoinDragLevel";

type Step = "account" | "coins" | "shoot" | "success" | "fail";

const BANKS = [
  "Reino Champinon Bank",
  "Banco Castillo",
  "Banco Submarino",
  "Estrella Warp Bank",
] as const;
const SOURCE_BANK = BANKS[0];

function TransactionApp() {
  const [step, setStep] = useState<Step>("account");
  const [destBank, setDestBank] = useState<string | null>(null);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState(0);

  const sameBank = destBank ? SOURCE_BANK === destBank : false;

  const stepLabel =
    step === "account"
      ? "1/3 CUENTA"
      : step === "coins"
        ? "2/3 MONTO"
        : step === "shoot"
          ? "3/3 DISPARO"
          : step === "success"
            ? "OK"
            : "FAIL";

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>VIBEBANK</h1>
        <div className="step-pill">{stepLabel}</div>
      </header>

      {step === "account" && (
        <AccountMarioLevel
          onComplete={(a) => {
            setAccount(a);
            setStep("coins");
          }}
        />
      )}

      {step === "coins" && (
        <CoinDragLevel
          onComplete={(n) => {
            setAmount(n);
            setStep("shoot");
          }}
        />
      )}

      {step === "shoot" && (
        <BankShootLevel
          banks={BANKS}
          onSelectDestBank={setDestBank}
          onSuccess={() => setStep("success")}
          onFail={() => setStep("fail")}
        />
      )}

      {step === "success" && (
        <div className="pixel-frame start-form">
          <h2 className="screen-title">Transaccion aceptada</h2>
          <p className="hint" style={{ textAlign: "left" }}>
            Origen: {SOURCE_BANK}
            <br />
            Cuenta: {account}
            <br />
            Monto: ${amount}
            <br />
            Destino: {destBank}
            <br />
            {sameBank
              ? "Tipo: misma entidad (disparo al piso)."
              : "Tipo: otro banco (disparo al cielo)."}
          </p>
          <div className="start-actions">
            <button
              type="button"
              className="pixel-btn"
              onClick={() => {
                setStep("account");
                setAccount("");
                setAmount(0);
                setDestBank(null);
              }}
            >
              Otra transferencia
            </button>
          </div>
        </div>
      )}

      {step === "fail" && (
        <div className="pixel-frame start-form">
          <h2 className="screen-title">Transaccion rechazada</h2>
          <p className="hint">
            Le diste al blanco equivocado. El banco no perdona.
          </p>
          <div className="start-actions">
            <button
              type="button"
              className="pixel-btn"
              onClick={() => setStep("shoot")}
            >
              Reintentar disparo
            </button>
            <button
              type="button"
              className="pixel-btn"
              style={{ marginLeft: 12 }}
              onClick={() => {
                setStep("account");
                setAccount("");
                setAmount(0);
                setDestBank(null);
              }}
            >
              Desde el inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionApp;
