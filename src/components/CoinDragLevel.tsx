import { useCallback, useState } from "react";
import "./CoinDragLevel.css";

const COIN_VALUES = [1, 5, 10, 50, 100] as const;

type Props = {
  onComplete: (amount: number) => void;
};

export function CoinDragLevel({ onComplete }: Props) {
  const [total, setTotal] = useState(0);
  const [pile, setPile] = useState<
    { id: string; v: (typeof COIN_VALUES)[number] }[]
  >([]);

  const addCoin = useCallback((v: (typeof COIN_VALUES)[number]) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTotal((t) => t + v);
    setPile((p) => [...p, { id, v }]);
  }, []);

  const handleDragStart = (
    e: React.DragEvent,
    v: (typeof COIN_VALUES)[number],
  ) => {
    e.dataTransfer.setData("text/plain", String(v));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    const v = Number(raw);
    if (Number.isFinite(v) && (COIN_VALUES as readonly number[]).includes(v)) {
      addCoin(v as (typeof COIN_VALUES)[number]);
    }
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleErase = () => {
    setTotal(0);
    setPile([]);
  };

return (
    <div className="coin-level pixel-frame">
      <h2 className="screen-title">NIVEL 2 — Monto</h2>
      {total > 0 && (
        <button type="button" className="erase-btn-top" onClick={handleErase} title="Borrar">
          ✕
        </button>
      )}
      <p className="hint confusing">
        Las fichas dorado representan el valor de tu transferencia. Arrastra cada ficha hacia la caja registradora para procesar el monto. El monto totale se muestra en la parte inferior.
      </p>

      <div className="coin-carousel-wrap">
        <div className="coin-carousel">
          {COIN_VALUES.map((v) => (
            <div
              key={v}
              className="coin-chip"
              draggable
              onDragStart={(e) => handleDragStart(e, v)}
              role="button"
              tabIndex={0}
              aria-label={`Moneda ${v} pesos`}
            >
              <span className="coin-star">★</span>
              <span className="coin-val">${v}</span>
            </div>
          ))}
          {/* duplicados para sensación de carrusel infinito */}
          {COIN_VALUES.map((v) => (
            <div
              key={`b-${v}`}
              className="coin-chip coin-chip-dim"
              draggable
              onDragStart={(e) => handleDragStart(e, v)}
            >
              <span className="coin-star">★</span>
              <span className="coin-val">${v}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="amount-vault"
        onDragOver={allowDrop}
        onDrop={handleDrop}
        role="region"
        aria-label="Zona de monto"
      >
        <div className="vault-label">MONTO</div>
        <div className="vault-number">${total}</div>
        <div className="vault-sub">Cuanto vamos a transferir</div>
      </div>

      <div className="coin-pile" aria-live="polite">
        {pile.map((c) => (
          <span key={c.id} className="pile-chip">
            ${c.v}
          </span>
        ))}
      </div>

      <div className="coin-actions">
        <button
          type="button"
          className="pixel-btn"
          disabled={total <= 0}
          onClick={() => onComplete(total)}
        >
          Confirmar monto
        </button>
      </div>
    </div>
  );
}
