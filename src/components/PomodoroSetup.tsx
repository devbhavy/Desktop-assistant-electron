import { useState } from "react"

export function PomodoroSetup() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)

  const handleStart = () => {
    if (focusMinutes < 1 || breakMinutes < 1) return

    window.electronAPI.startPomodoro(
      focusMinutes,
      breakMinutes
    )
  }

  const handleClose = () => {
    window.electronAPI.closePomodoroSetupWindow()
  }

  return (
    <div className="h-screen w-screen bg-white font-mono">
      <div className="flex h-full flex-col border-[3px] border-black p-3">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">
            Pomodoro
          </h1>

          <button
            onClick={handleClose}
            className="border-[3px] border-black bg-black px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        {/* Inputs */}
        <div className="mb-4 flex gap-3">

          <div className="flex-1">
            <label className="mb-1 block text-sm font-bold">
              Focus
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={focusMinutes}
                onChange={(e) =>
                  setFocusMinutes(Number(e.target.value))
                }
                className="w-full border-[3px] border-black px-2 py-2 text-base font-bold outline-none"
              />

              <span className="text-sm font-bold">
                min
              </span>
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-bold">
              Break
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={breakMinutes}
                onChange={(e) =>
                  setBreakMinutes(Number(e.target.value))
                }
                className="w-full border-[3px] border-black px-2 py-2 text-base font-bold outline-none"
              />

              <span className="text-sm font-bold">
                min
              </span>
            </div>
          </div>

        </div>

        <div className="flex-1" />

     
        <button
          onClick={handleStart}
          className="border-[3px] border-black bg-black py-2 text-base font-bold text-white hover:bg-red-500"
        >
          Start
        </button>

      </div>
    </div>
  )
}