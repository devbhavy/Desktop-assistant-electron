import { useState } from "react"

export function BreakStretchSetup() {
  const [minutes, setMinutes] = useState(30)

  const handleStart = () => {
    if (minutes < 1) return

    window.electronAPI.startBreakStretch(
      minutes
    )
  }
  const handleClose = () => {
    window.electronAPI.closeStretchBreakSetupWindow()
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white p-4">
      <div className="flex w-full flex-col gap-4">
        <div>
          <div className="font-mono font-bold flex justify-between">
            <div>
            Remind Me Every
            </div>
            <div>
              <button onClick={handleClose} className="text-lg hover:cursor-pointer">
                ×
              </button>
            </div>
            
          </div>

          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) =>
              setMinutes(Number(e.target.value))
            }
            className="w-full border-2 border-black p-2"
          />
        </div>

        <button
          onClick={handleStart}
          className="border-2 border-black bg-red-500 p-2 font-mono font-bold text-white"
        >
          Start
        </button>
      </div>
    </div>
  )
}