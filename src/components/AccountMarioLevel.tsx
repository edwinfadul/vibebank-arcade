import { useCallback, useEffect, useRef, useState } from 'react'
import './AccountMarioLevel.css'

const DIGIT_COUNT = 8
const COLS = DIGIT_COUNT
const ARENA_W = 560
const ARENA_H = 260
const GROUND_Y = 200
const MARIO_W = 28
const MARIO_H = 36
const BLOCK_H = 40
const BLOCK_Y = 28
const GRAVITY = 0.55
const JUMP_V = -11.2
const MOVE_SPEED = 2.4

type Props = {
  onComplete: (account: string) => void
}

export function AccountMarioLevel({ onComplete }: Props) {
  const [digits, setDigits] = useState(() => Array(COLS).fill(0))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const marioRef = useRef({
    x: ARENA_W / 2 - MARIO_W / 2,
    y: GROUND_Y - MARIO_H,
    vx: 0,
    vy: 0,
    onGround: true,
  })
  const keysRef = useRef<Set<string>>(new Set())
  const bumpLockRef = useRef<number | null>(null)
  const [, tick] = useState(0)

  const colWidth = ARENA_W / COLS

  const bumpColumn = useCallback((col: number) => {
    setDigits((prev) => {
      const next = [...prev]
      next[col] = (next[col] + 1) % 10
      return next
    })
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    let id: number
    const loop = () => {
      const m = marioRef.current
      const keys = keysRef.current

      m.vx = 0
      if (keys.has('ArrowLeft') || keys.has('KeyA')) m.vx = -MOVE_SPEED
      if (keys.has('ArrowRight') || keys.has('KeyD')) m.vx = MOVE_SPEED

      if ((keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')) && m.onGround) {
        m.vy = JUMP_V
        m.onGround = false
      }

      m.vy += GRAVITY
      m.x += m.vx
      m.y += m.vy

      if (m.x < 0) m.x = 0
      if (m.x > ARENA_W - MARIO_W) m.x = ARENA_W - MARIO_W

      const ground = GROUND_Y - MARIO_H
      if (m.y >= ground) {
        m.y = ground
        m.vy = 0
        m.onGround = true
      }

      const marioCenterX = m.x + MARIO_W / 2
      const col = Math.floor(marioCenterX / colWidth)
      const clampedCol = Math.max(0, Math.min(COLS - 1, col))

      const blockBottom = BLOCK_Y + BLOCK_H
      const marioTop = m.y

      if (m.vy < 0 && marioTop <= blockBottom + 6 && marioTop >= BLOCK_Y - 10) {
        const colLeft = clampedCol * colWidth
        const colRight = colLeft + colWidth
        const mx1 = m.x + 4
        const mx2 = m.x + MARIO_W - 4
        if (mx2 > colLeft && mx1 < colRight) {
          if (bumpLockRef.current !== clampedCol) {
            bumpLockRef.current = clampedCol
            bumpColumn(clampedCol)
            m.vy = 2
            m.y = blockBottom + 2
          }
        }
      } else {
        bumpLockRef.current = null
      }

      tick((n) => (n + 1) % 10000)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [bumpColumn, colWidth])

  const accountStr = digits.join('')
  const isAllZeros = digits.every(d => d === 0)

  const handleConfirm = () => {
    if (isAllZeros) {
      const msgs = [
        "El fontanero necesita más impulso",
        "Los bloques no han sido golpeados lo suficiente",
        "Falta activación de los signos de interrogación",
        "El castle espera más acción del jugador",
      ]
      setErrorMsg(msgs[Math.floor(Math.random() * msgs.length)])
    } else {
      setErrorMsg(null)
      onComplete(accountStr)
    }
  }

  return (
    <div className="account-level pixel-frame">
      <h2 className="screen-title">NIVEL 1 — Cuenta</h2>
      <p className="hint confusing">
        Usa las flechas direccionales o las teclas W/A/S/D para moverte. El objetivo es alcanzar el final del nivel. Los bloques flotantes contienen potenciadores. El contaador superior refleja tu progreso.
      </p>

      <div
        className="account-arena"
        style={{ width: ARENA_W, height: ARENA_H }}
        role="application"
        aria-label="Minijuego cuenta bancaria"
      >
        <div className="account-sky" />
        {Array.from({ length: COLS }).map((_, c) => (
          <div
            key={c}
            className="question-block"
            style={{
              left: c * colWidth + (colWidth - 44) / 2,
              top: BLOCK_Y,
              width: 44,
              height: BLOCK_H,
            }}
          >
            <span className="qb-mark">?</span>
            <span className="qb-digit">{digits[c]}</span>
          </div>
        ))}
        <div
          className="mario-sprite"
          style={{
            transform: `translate(${marioRef.current.x}px, ${marioRef.current.y}px)`,
          }}
        />
        <div className="account-ground" style={{ top: GROUND_Y }} />
      </div>

      <div className="account-readout">
        <span className="readout-label">Número de cuenta</span>
        <span className="readout-digits">{accountStr}</span>
      </div>

      {errorMsg && <p className="hint error-msg">{errorMsg}</p>}

      <div className="account-actions">
        <button type="button" className="pixel-btn" onClick={handleConfirm}>
          Confirmar cuenta
        </button>
      </div>
    </div>
  )
}
