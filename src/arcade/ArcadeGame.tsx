import { useState, useEffect } from 'react'
import './ArcadeGame.css'

interface Transfer {
  amount: number
  isFraud: boolean
  timestamp: number
}

interface Particle {
  id: number
  x: number
  y: number
}

function App() {
  const [speed, setSpeed] = useState(0)
  const [isTransferring, setIsTransferring] = useState(false)
  const [turboActive, setTurboActive] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [lastTransfers, setLastTransfers] = useState<Transfer[]>([])
  const [message, setMessage] = useState('LISTO PARA TRANSFERIR')
  const [carPosition, setCarPosition] = useState(20)
  const [roadOffset, setRoadOffset] = useState(0)
  const [isFraud, setIsFraud] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [showHole, setShowHole] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFraudAlert, setShowFraudAlert] = useState(false)
  const [holeData, setHoleData] = useState({ bank: '', beneficiary: '' })
  const [selectedBank, setSelectedBank] = useState<'chase' | 'wells' | 'citi'>('chase')
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<'juan' | 'maria' | 'carlos'>('juan')
  const [exhaustParticles, setExhaustParticles] = useState<Particle[]>([])
  const [crashShake, setCrashShake] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (speed > 0) {
        setRoadOffset(prev => (prev - speed * 0.3) % 100)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [speed])

  // Posición del carro: a más velocidad, más a la derecha (más adelante).
  // Suaviza la transición para que cuando baje la velocidad, baje la posición.
  useEffect(() => {
    if (crashed || isTransferring) return
    const targetPosition = 5 + Math.min(45, (speed / 200) * 45)
    const interval = setInterval(() => {
      setCarPosition(prev => {
        const diff = targetPosition - prev
        if (Math.abs(diff) < 0.3) return targetPosition
        return prev + diff * 0.15
      })
    }, 50)
    return () => clearInterval(interval)
  }, [speed, crashed, isTransferring])

  // Decaimiento natural de la velocidad (motor en marcha lenta)
  useEffect(() => {
    if (isTransferring || crashed) return
    if (speed <= 0) return
    const idleMin = turboActive ? 80 : 0
    const decay = setInterval(() => {
      setSpeed(prev => {
        const next = Math.round(prev - 0.4)
        if (next <= idleMin) return idleMin
        return next
      })
    }, 200)
    return () => clearInterval(decay)
  }, [speed, isTransferring, crashed, turboActive])

  useEffect(() => {
    if (speed > 50 && !isTransferring) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: 10 + Math.random() * 10,
          y: 90 + Math.random() * 5,
        }
        setExhaustParticles(prev => [...prev.slice(-10), newParticle])
        setTimeout(() => {
          setExhaustParticles(prev => prev.filter(p => p.id !== newParticle.id))
        }, 300)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [speed, isTransferring])

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount)
    if (!amount || amount <= 0) {
      setMessage('INGRESA UN MONTO VÁLIDO')
      return
    }

    setIsTransferring(true)
    setMessage('TRANSFIRIENDO...')
    
    const isFraudAmount = amount > 1000
    setIsFraud(isFraudAmount)

    const newTransfer = { amount, isFraud: isFraudAmount, timestamp: Date.now() }
    const updatedHistory = [...lastTransfers, newTransfer].slice(-5)
    setLastTransfers(updatedHistory)

    setTimeout(() => {
      if (isFraudAmount) {
        const bankNames = { chase: 'CHASE', wells: 'WELLS', citi: 'CITI' }
        const beneNames = { juan: 'J.PEREZ', maria: 'M.GARCIA', carlos: 'C.LOPEZ' }
        
        setShowHole(true)
        setHoleData({ 
          bank: bankNames[selectedBank], 
          beneficiary: beneNames[selectedBeneficiary] 
        })
        
        setTimeout(() => {
          // El fraude baja la velocidad solo parcialmente, no la pone a cero.
          // Cuanto más rápido iba, más drástica es la pérdida (pero sigue rodando).
          setTurboActive(false)
          setCrashed(true)
          setShowFraudAlert(true)
          setSpeed(prev => {
            const reduction = prev > 120 ? 0.45 : prev > 60 ? 0.55 : 0.7
            return Math.max(15, Math.round(prev * reduction))
          })
          // Pequeño rebote: el carro retrocede un poco al chocar pero
          // mantiene su posición relativa según la velocidad resultante.
          setCarPosition(prev => Math.max(5, prev - 8))
          setCrashShake(1)
          setMessage(`! FRAUDE DETECTADO !`)
          setIsFraud(true)

          setTimeout(() => {
            setCrashShake(0)
            setCrashed(false)
            setShowHole(false)
            setShowFraudAlert(false)
            setMessage('RECUPERANDO...')
            setTimeout(() => {
              setMessage('LISTO PARA TRANSFERIR')
            }, 800)
          }, 2500)
        }, 500)
      } else {
        setIsFraud(false)
        setCrashed(false)
        setShowHole(false)
        const reversed = updatedHistory.slice().reverse()
        const firstFraudIndex = reversed.findIndex(t => t.isFraud)
        const consecutiveNonFraud = firstFraudIndex === -1 ? updatedHistory.length : firstFraudIndex

        if (consecutiveNonFraud >= 2) {
          setTurboActive(true)
          setSpeed(prev => Math.min(200, Math.round(prev + 40)))
          setMessage('¡TURBO ACTIVADO!')
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 1500)
        } else {
          const speedBoost = Math.min(30, Math.round(amount / 50))
          setSpeed(prev => Math.min(200, Math.round(prev + speedBoost)))
          setMessage('* TRANSFERENCIA OK *')
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 1500)
        }
      }
      
      setTimeout(() => {
        setIsTransferring(false)
        setIsFraud(false)
        setMessage('LISTO PARA TRANSFERIR')
      }, 2000)
    }, 1500)

    setTransferAmount('')
  }

  const handleTurbo = () => {
    if (!turboActive && speed > 0) {
      setTurboActive(true)
      setSpeed(prev => Math.min(200, Math.round(prev + 30)))
      setMessage('¡TURBO ACTIVADO!')
    }
  }

  const getSpeedColor = () => {
    if (speed >= 150) return '#ff0040'
    if (speed >= 100) return '#ff8800'
    return '#00ff88'
  }

  const getSpeedLabel = () => {
    if (speed >= 150) return 'MAX'
    if (speed >= 100) return 'FAST'
    if (speed >= 50) return 'NORM'
    return 'IDLE'
  }

  return (
    <div className="game-container">
      <div className="scanlines"></div>
      <div className="screen-glow"></div>
      
      <header className="game-header">
        <div className="title">
          <span className="neon-text">VIBE</span>
          <span className="neon-text accent">BANK</span>
        </div>
        <div className="subtitle">TRANSFER ARCADE</div>
      </header>

      <div className="road-container">
        <div className="road-shoulder top"></div>
        <div className="road-shoulder bottom"></div>
        <div className="road" style={{ backgroundPositionX: `${roadOffset}%` }}>
          <div className="road-line center-line" style={{ backgroundPositionY: `${roadOffset * 1.5}%` }}></div>
        </div>

        {speed >= 100 && (
          <div className="speed-lines">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="speed-line" style={{
                top: `${20 + i * 12}%`,
                animationDuration: `${0.6 - Math.min(0.4, speed / 600)}s`,
                animationDelay: `${i * 0.08}s`,
              }}></div>
            ))}
          </div>
        )}

        {showHole && (
          <div className="hole">
            <div className="hole-crack crack-1"></div>
            <div className="hole-crack crack-2"></div>
            <div className="hole-crack crack-3"></div>
            <div className="hole-crack crack-4"></div>
            <div className="hole-inner">
              <div className="hole-label">{holeData.bank}</div>
              <div className="hole-name">{holeData.beneficiary}</div>
            </div>
            <div className="hole-cross">X</div>
          </div>
        )}

        {crashShake > 0 && (
          <div className="crash-impact" style={{ left: `${carPosition + 5}%` }}>
            <div className="crash-star">*</div>
            <div className="crash-burst burst-1"></div>
            <div className="crash-burst burst-2"></div>
            <div className="crash-burst burst-3"></div>
            <div className="crash-text">BUMP!</div>
          </div>
        )}
        
        {showSuccess && (
          <div className="success-msg">
            <div className="success-text">TRANSFERIDO!</div>
            <div className="success-check">OK</div>
          </div>
        )}

        {showFraudAlert && (
          <div className="fraud-road-alert">
            <div className="fraud-road-title">🚨 FRAUDE DETECTADO</div>
            <div className="fraud-road-sub">Transferencia bloqueada por sistema</div>
            <div className="fraud-road-speed">🔻 Velocidad reducida</div>
          </div>
        )}
        
        <div className="car-container" style={{ left: `${carPosition}%` }}>
          <div className={`car ${isTransferring ? 'car-shake' : ''} ${isFraud ? 'car-fraud' : ''} ${turboActive ? 'car-turbo' : ''} ${crashed ? 'car-crashed' : ''}`}>
            <div className="car-body">
              <div className="car-top"></div>
              <div className="car-front"></div>
              <div className="car-window"></div>
              <div className="car-wheel front"></div>
              <div className="car-wheel back"></div>
              {turboActive && (
                <div className="turbo-flame"></div>
              )}
            </div>
            {exhaustParticles.map(p => (
              <div key={p.id} className="exhaust-particle" style={{ left: `${p.x}%`, top: `${p.y}%` }}></div>
            ))}
          </div>
          
          {isTransferring && (
            <div className="transfer-effect">
              <div className="money-flow"></div>
            </div>
          )}
        </div>

        <div className={`sky ${isFraud ? 'sky-fraud' : ''}`}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="cloud" style={{ left: `${20 + i * 20}%`, animationDelay: `${i * 0.5}s` }}></div>
          ))}
        </div>
      </div>

      <div className="dashboard">
        <div className="speedometer">
          <div className="speed-dial">
            <div className="speed-needle" style={{ transform: `rotate(${-90 + (speed / 200) * 180}deg)` }}></div>
          </div>
          <div className="speed-value">
            <span className="speed-number" style={{ color: getSpeedColor() }}>{Math.round(speed)}</span>
            <span className="speed-unit">KM/H</span>
          </div>
          <div className="speed-label" style={{ color: getSpeedColor() }}>{getSpeedLabel()}</div>
        </div>

        <div className="turbo-indicator">
          <div className={`turbo-button ${turboActive ? 'active' : ''}`} onClick={handleTurbo}>
            <span>TURBO</span>
            <div className="turbo-bar">
              <div className={`turbo-fill ${turboActive ? 'filling' : ''}`}></div>
            </div>
          </div>
          {turboActive && <div className="turbo-label">TURBO!</div>}
        </div>

        <div className="transfer-panel">
          <div className="select-row">
            <div className="select-group">
              <span className="display-label">BANCO</span>
              <select 
                value={selectedBank} 
                onChange={(e) => setSelectedBank(e.target.value as 'chase' | 'wells' | 'citi')}
                className="retro-select"
                disabled={isTransferring}
              >
                <option value="chase">CHASE BANK</option>
                <option value="wells">WELLS FARGO</option>
                <option value="citi">CITIBANK</option>
              </select>
            </div>
            <div className="select-group">
              <span className="display-label">DESTINO</span>
              <select 
                value={selectedBeneficiary} 
                onChange={(e) => setSelectedBeneficiary(e.target.value as 'juan' | 'maria' | 'carlos')}
                className="retro-select"
                disabled={isTransferring}
              >
                <option value="juan">JUAN PEREZ</option>
                <option value="maria">MARIA GARCIA</option>
                <option value="carlos">CARLOS LOPEZ</option>
              </select>
            </div>
          </div>
          
          <div className="transfer-display">
            <span className="display-label">MONTO</span>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              className="amount-input"
              disabled={isTransferring}
            />
            <span className="currency">USD</span>
          </div>

          <button 
            className={`transfer-button ${isTransferring ? 'transferring' : ''}`}
            onClick={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? 'TRANSFIRIENDO...' : 'TRANSFERIR'}
          </button>
        </div>

        <div className="status-display">
          <div className={`message-box ${isFraud ? 'fraud' : ''} ${turboActive ? 'turbo' : ''}`}>
            {message}
          </div>
        </div>
      </div>

      <div className="transfer-history">
        <div className="history-title">HISTORIAL</div>
        <div className="history-items">
          {lastTransfers.map((t, i) => (
            <div key={i} className={`history-item ${t.isFraud ? 'fraud' : 'ok'}`}>
              <span className="history-amount">${t.amount.toFixed(2)}</span>
              <span className="history-status">{t.isFraud ? 'FRAUD' : 'OK'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-hint">
        <div className="hint-card">
          <span className="hint-icon">💵</span>
          <span className="hint-text">Ingresa un monto y presiona <strong>TRANSFERIR</strong> para acelerar</span>
        </div>
        <div className="hint-card turbo-hint">
          <span className="hint-icon">🔥</span>
          <span className="hint-text"><strong>2 transferencias OK seguidas</strong> = Modo TURBO activado</span>
        </div>
        <div className="hint-card fraud-hint">
          <span className="hint-icon">🚨</span>
          <span className="hint-text">Montos <strong>mayores a $1,000</strong> = FRAUDE detectado (velocidad cae)</span>
        </div>
      </div>
    </div>
  )
}

export default App
