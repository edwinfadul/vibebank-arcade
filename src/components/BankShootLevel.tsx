import { useCallback, useEffect, useRef, useState } from 'react'
import './BankShootLevel.css'

type Props = {
  banks: readonly string[]
  onSelectDestBank: (bank: string) => void
  onSuccess: () => void
  onFail: () => void
}

type Shot = { id: number; x: number; y: number; tx: number; ty: number; t0: number }

const ARENA_W = 800
const ARENA_H = 450
const DURATION_MS = 380

export function BankShootLevel({ banks, onSelectDestBank, onSuccess, onFail }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const resolvedRef = useRef(false)
  const [shots, setShots] = useState<Shot[]>([])
  const [locked, setLocked] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const shotId = useRef(0)
  const [, frame] = useState(0)

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank)
    onSelectDestBank(bank)
  }

  useEffect(() => {
    resolvedRef.current = false
  }, [])

  const playerX = ARENA_W / 2
  const playerY = ARENA_H - 36

  useEffect(() => {
    if (shots.length === 0) return
    let id: number
    const loop = () => {
      const now = performance.now()
      setShots((prev) => prev.filter((s) => now - s.t0 < DURATION_MS))
      frame((n) => n + 1)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [shots.length])

  const resolveHit = useCallback(
    (clientX: number, clientY: number) => {
      if (resolvedRef.current) return
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
      const target = el?.closest?.('[data-hit]') as HTMLElement | undefined
      if (!target) return
      const kind = target.dataset.hit as 'correct' | 'wrong' | undefined
      if (kind !== 'correct' && kind !== 'wrong') return
      resolvedRef.current = true
      setLocked(true)
      if (kind === 'correct') onSuccess()
      else onFail()
    },
    [onFail, onSuccess],
  )

  const fire = useCallback(
    (clientX: number, clientY: number) => {
      if (locked) return
      const root = arenaRef.current
      if (!root) return
      const r = root.getBoundingClientRect()
      const tx = clientX - r.left
      const ty = clientY - r.top
      const idn = ++shotId.current
      setShots((s) => [...s, { id: idn, x: playerX, y: playerY, tx, ty, t0: performance.now() }])
      window.setTimeout(() => resolveHit(clientX, clientY), DURATION_MS)
    },
    [locked, resolveHit],
  )

  const onArenaClick = (e: React.MouseEvent) => {
    if (locked) return
    fire(e.clientX, e.clientY)
  }

  return (
    <div className="shoot-level pixel-frame">
      <h2 className="screen-title">NIVEL 3 — Validación</h2>
      
      <p className="hint confusing">Selecciona el banco de destino:</p>
      
      <div className="bank-select-wide">
        <div className="bank-options-wide">
          {banks.map((b) => (
            <button
              key={b}
              type="button"
              className={`pixel-btn bank-btn-wide ${selectedBank === b ? 'selected' : ''}`}
              onClick={() => handleSelectBank(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {selectedBank && (
        <>
          <p className="hint">
            Dispara hacia <strong>{selectedBank}</strong> en el cielo. El piso y otros carteles no cuentan.
          </p>

          <div
            ref={arenaRef}
            className="shoot-arena"
            style={{ width: ARENA_W, height: ARENA_H }}
            onClick={onArenaClick}
            role="application"
            aria-label="Disparar al destino"
          >
            <div className="shoot-sky" />

            {/* Bancos en el cielo */}
            {banks.map((b, i) => (
              <div
                key={b}
                className="bank-target"
                data-hit={selectedBank === b ? 'correct' : 'wrong'}
                style={{ 
                  left: 60 + (i * 180), 
                  top: i % 2 === 0 ? 40 : 130 
                }}
              >
                <span className="bank-roof" />
                <span className="bank-name">{b}</span>
              </div>
            ))}

            {/* Zona piso / tubería */}
            <div
              className="pipe-target"
              data-hit="wrong"
              style={{ left: ARENA_W / 2 - 40, top: ARENA_H - 110 }}
            >
              <div className="pipe-body" />
              <div className="pipe-lip" />
            </div>

            <div className="shoot-ground" />

            <div className="shooter" style={{ left: playerX - 20, top: playerY }} />

            {shots.map((s) => {
              const now = performance.now()
              const p = Math.min(1, (now - s.t0) / DURATION_MS)
              const x = s.x + (s.tx - s.x) * p
              const y = s.y + (s.ty - s.y) * p
              return (
                <div
                  key={s.id}
                  className="fireball"
                  style={{ left: x - 6, top: y - 6 }}
                />
              )
            })}
          </div>

          <p className="hint shoot-foot">Clic en el escenario: sale una bola de fuego hacia ese punto.</p>
        </>
      )}
    </div>
  )
}
