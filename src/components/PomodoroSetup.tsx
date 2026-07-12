import { useState } from "react"

export function PomodoroSetup() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const handleStart = () => {
    if (focusMinutes < 1 || breakMinutes < 1) {
      return
    }
  
    window.electronAPI.startPomodoro(
      focusMinutes,
      breakMinutes
    )
  }

  const handleClose = () => {
    window.electronAPI.closePomodoroSetupWindow()
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white p-4">
      <div className="flex w-full flex-col gap-4">

        <div>
          <div className="font-mono font-bold flex justify-between">
            <div>
            Focus minutes
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
            value={focusMinutes}
            onChange={(e) =>
              setFocusMinutes(Number(e.target.value))
            }
            className="w-full border-2 border-black p-2"
          />
        </div>

        <div>
          <label className="font-mono font-bold">
            Break minutes
          </label>

          <input
            type="number"
            min={1}
            value={breakMinutes}
            onChange={(e) =>
              setBreakMinutes(Number(e.target.value))
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