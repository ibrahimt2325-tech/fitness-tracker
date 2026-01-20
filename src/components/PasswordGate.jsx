import { useState } from 'react'

const CORRECT_PASSWORD = 'IceMan18'

export function PasswordGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showFTP, setShowFTP] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setShowFTP(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } else {
      setError(true)
      setTimeout(() => setError(false), 500)
    }
  }

  if (showFTP) {
    return (
      <div className="fixed inset-0 bg-bears-navy flex items-center justify-center z-50">
        <div className="ftp-reveal">
          <span className="font-mono font-bold text-[12rem] md:text-[20rem] tracking-tighter text-bears-orange drop-shadow-[0_0_60px_rgba(200,56,3,0.5)]">
            FTP
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <p className="font-mono text-xs text-muted tracking-widest uppercase mb-1">Peep Game</p>
          <h1 className="font-mono font-bold text-4xl tracking-tighter text-white">
            LOCKED IN<span className="text-success animate-pulse">.</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`
              w-full bg-card border rounded-lg px-4 py-3 font-mono text-center text-lg
              focus:outline-none transition-all
              ${error
                ? 'border-fail shake'
                : 'border-border focus:border-success'}
            `}
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-success text-bg font-heading font-semibold rounded-lg
                       hover:bg-success/90 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
