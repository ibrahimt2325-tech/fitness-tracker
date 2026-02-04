import { useState, useEffect } from 'react'
import { formatDate } from '../lib/dates'
import { GOALS } from '../types'
import { computePagesRead, readingGoalMet } from '../lib/pages'

export function LogModal({ date, currentLog, onSave, onClose, currentBook, previousPage }) {
  const [steps, setSteps] = useState('')
  const [currentPage, setCurrentPage] = useState('')
  const [stretched, setStretched] = useState(false)
  const [lifted, setLifted] = useState(false)
  const [learned, setLearned] = useState('')

  useEffect(() => {
    if (currentLog) {
      setSteps(currentLog.steps?.toString() || '')
      setCurrentPage(currentLog.current_page?.toString() || '')
      setStretched(currentLog.stretched || false)
      setLifted(currentLog.lifted || false)
      setLearned(currentLog.learned || '')
    }
  }, [currentLog])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      steps: steps ? parseInt(steps, 10) : null,
      current_page: currentPage ? parseInt(currentPage, 10) : null,
      stretched,
      lifted,
      learned: learned.trim() || null,
    })
    onClose()
  }

  const stepsNum = parseInt(steps, 10) || 0
  const pageNum = parseInt(currentPage, 10) || 0
  const pagesRead = computePagesRead(
    currentPage ? pageNum : null,
    previousPage
  )
  const pagesHit = readingGoalMet(pagesRead)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-bold text-xl">
            Log for {formatDate(date, 'EEEE, MMM d')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Current book display */}
        {currentBook && (
          <div className="mb-5 px-3 py-2 bg-bg rounded-lg border border-border">
            <span className="text-xs text-muted font-mono">Currently reading</span>
            <div className="font-heading text-sm mt-0.5">{currentBook}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Steps */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="font-heading text-sm">
                Steps
                <span className="text-muted ml-2 text-xs">min {GOALS.steps.toLocaleString()}</span>
              </span>
              {steps && (
                <span className={`text-xs font-mono ${stepsNum >= GOALS.steps ? 'text-success' : 'text-fail'}`}>
                  {stepsNum >= GOALS.steps ? 'Goal hit!' : `${(GOALS.steps - stepsNum).toLocaleString()} to go`}
                </span>
              )}
            </label>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="0"
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 font-mono text-lg
                         focus:outline-none focus:border-success transition-colors"
            />
          </div>

          {/* Current Page */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="font-heading text-sm">
                Current page
                <span className="text-muted ml-2 text-xs">min {GOALS.pages} pg/day</span>
              </span>
              {currentPage && (
                <span className={`text-xs font-mono ${pagesHit ? 'text-success' : 'text-fail'}`}>
                  {pagesRead != null
                    ? (pagesHit ? `+${pagesRead} pg — Goal hit!` : `+${pagesRead} pg — ${GOALS.pages - pagesRead} to go`)
                    : 'New book?'
                  }
                </span>
              )}
            </label>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              placeholder="Page #"
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 font-mono text-lg
                         focus:outline-none focus:border-success transition-colors"
            />
            {previousPage != null && (
              <div className="mt-1.5 text-xs text-muted font-mono">
                Yesterday: pg {previousPage}
                {pagesRead != null && pagesRead >= 0 && (
                  <span className="ml-2">| Read: {pagesRead} pages</span>
                )}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStretched(!stretched)}
              className={`
                flex-1 py-3 rounded-lg border font-heading text-sm
                transition-all
                ${stretched
                  ? 'bg-success/20 border-success text-success'
                  : 'bg-bg border-border text-muted hover:border-muted'}
              `}
            >
              Stretched {stretched ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setLifted(!lifted)}
              className={`
                flex-1 py-3 rounded-lg border font-heading text-sm
                transition-all
                ${lifted
                  ? 'bg-success/20 border-success text-success'
                  : 'bg-bg border-border text-muted hover:border-muted'}
              `}
            >
              Lifted {lifted ? '✓' : ''}
            </button>
          </div>

          {/* Learned */}
          <div>
            <label className="block font-heading text-sm mb-2">
              What'd you learn today?
            </label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="One thing I learned..."
              rows={2}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 font-mono text-sm
                         focus:outline-none focus:border-success transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-success text-bg font-heading font-semibold rounded-lg
                       hover:bg-success/90 transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
