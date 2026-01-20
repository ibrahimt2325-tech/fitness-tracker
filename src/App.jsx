import { useState, useEffect } from 'react'
import { WeekView } from './components/WeekView'
import { PasswordGate } from './components/PasswordGate'

function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('lockedin_auth') === 'true'
  })

  const handleAuth = () => {
    sessionStorage.setItem('lockedin_auth', 'true')
    setAuthenticated(true)
  }

  if (!authenticated) {
    return <PasswordGate onSuccess={handleAuth} />
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8 md:px-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10">
        <p className="font-mono text-sm text-success tracking-widest uppercase mb-1 font-bold">// Peep Game</p>
        <h1 className="font-mono font-bold text-4xl md:text-5xl tracking-tighter text-white">
          LOCKED IN<span className="text-success animate-pulse">.</span>
        </h1>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto">
        <WeekView />
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-border">
        <div className="flex flex-wrap gap-6 text-xs text-muted font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-success" />
            <span>Goal hit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-fail" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded border border-dashed border-border" />
            <span>Future</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded border-2 border-white" />
            <span>Today</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
