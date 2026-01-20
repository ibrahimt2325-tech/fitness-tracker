import { useState, useEffect } from 'react'
import { formatDate } from '../lib/dates'
import { GOALS } from '../types'

export function LogModal({ date, currentLog, onSave, onClose }) {
  const [steps, setSteps] = useState('')
  const [pages, setPages] = useState('')
  const [stretched, setStretched] = useState(false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    if (currentLog) {
      setSteps(currentLog.steps?.toString() || '')
      setPages(currentLog.pages?.toString() || '')
      setStretched(currentLog.stretched || false)
      setLifted(currentLog.lifted || false)
    }
  }, [currentLog])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      steps: steps ? parseInt(steps, 10) : null,
      pages: pages ? parseInt(pages, 10) : null,
      stretched,
      lifted,
    })
    onClose()
  }

  const stepsNum = parseInt(steps, 10) || 0
  const pagesNum = parseInt(pages, 10) || 0

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Steps */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="font-heading text-sm">
                👟 Steps
                <span className="text-muted ml-2 text-xs">min {GOALS.steps.toLocaleString()}</span>
              </span>
              {steps && (
                <span className={`text-xs font-mono ${stepsNum >= GOALS.steps ? 'text-success' : 'text-fail'}`}>
                  {stepsNum >= GOALS.steps ? '✓ Goal hit!' : `${(GOALS.steps - stepsNum).toLocaleString()} to go`}
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

          {/* Pages */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="font-heading text-sm">
                📖 Pages read
                <span className="text-muted ml-2 text-xs">min {GOALS.pages}</span>
              </span>
              {pages && (
                <span className={`text-xs font-mono ${pagesNum >= GOALS.pages ? 'text-success' : 'text-fail'}`}>
                  {pagesNum >= GOALS.pages ? '✓ Goal hit!' : `${GOALS.pages - pagesNum} to go`}
                </span>
              )}
            </label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="0"
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 font-mono text-lg
                         focus:outline-none focus:border-success transition-colors"
            />
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
              🧘 Stretched {stretched ? '✓' : ''}
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
              💪 Lifted {lifted ? '✓' : ''}
            </button>
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
