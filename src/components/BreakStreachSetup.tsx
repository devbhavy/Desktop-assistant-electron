import { useState } from "react"

export function BreakStretchSetup() {
  const [minutes, setMinutes] = useState(30)

  const handleStart = () => {
    if (minutes < 1) return

    window.electronAPI.startBreakStretch(
      minutes
    )
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white p-4">
      <div className="flex w-full flex-col gap-4">
        <div>
          <label className="font-mono font-bold">
            Remind me every
          </label>

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