import { useState } from "react"

export function BreakStretchSetup() {
  const [minutes, setMinutes] = useState(30)

  const handleStart = () => {
    if (minutes < 1) return

    window.electronAPI.startBreakStretch(minutes)
  }

  const handleClose = () => {
    window.electronAPI.closeStretchBreakSetupWindow()
  }

  return (
    <div className="h-screen w-screen">
      <div className="flex h-full flex-col border-[3px] border-black p-3 font-mono rounded-lg">

        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-base font-bold">
            Stretch Break
          </h1>

          <button
            onClick={handleClose}
            className="border-[3px] border-black bg-black px-2 py-0.5 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

   
        <label className="mb-0.5 text-sm font-bold">
          Remind me every
        </label>

        <div className="mb-2 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full border-[3px] border-black px-2 py-0.5 text-sm font-bold outline-none"
            />

            <span className="text-sm font-bold">
              min(s)
            </span>
          </div>

        <button
          onClick={handleStart}
          className="w-full border-[3px] border-black bg-black py-1 text-sm font-bold text-white hover:bg-neutral-800"
        >
          Start
        </button>

      </div>
    </div>
  )
}