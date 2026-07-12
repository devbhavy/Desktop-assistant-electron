import { useEffect, useState } from "react"

type PomodoroPhase = "focus" | "break"

export function Pomodoro() {
    const [secondsLeft, setSecondsLeft] = useState(0)
    const [phase, setPhase] =
    useState<PomodoroPhase>("focus")
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null
        let currentEndTime: number | null = null
        let isSwitchingPhase = false
        let isActive = true
      
        const updateTimer = async () => {
          if (!isActive || !currentEndTime) return
      
          const remaining = Math.max(
            0,
            Math.ceil((currentEndTime - Date.now()) / 1000)
          )
      
          setSecondsLeft(remaining)
      
          if (remaining === 0 && !isSwitchingPhase) {
            isSwitchingPhase = true
      
            const nextState =
              await window.electronAPI.completePomodoroPhase()
      
            if (!isActive) return
      
            if (!nextState) {
              isSwitchingPhase = false
              return
            }
      
            currentEndTime = nextState.endTime
            setPhase(nextState.phase)
      
            const nextRemaining = Math.max(
              0,
              Math.ceil(
                (nextState.endTime - Date.now()) / 1000
              )
            )
      
            setSecondsLeft(nextRemaining)
            isSwitchingPhase = false
          }
        }
      
        const startTimer = async () => {
          const state =
            await window.electronAPI.getPomodoroState()
      
          
          if (!isActive) return
      
          if (!state.endTime) return
      
          currentEndTime = state.endTime
          setPhase(state.phase)
      
          await updateTimer()
      
          if (!isActive) return
      
          intervalId = setInterval(updateTimer, 1000)
        }
      
        startTimer()
      
        return () => {
          isActive = false
      
          if (intervalId) {
            clearInterval(intervalId)
          }
        }
      }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`

  return (
    <div className="h-screen w-screen p-2">
      <div
            className={`flex text-white h-full w-full flex-col items-center justify-center border-[3px] border-black ${
                phase === "focus"
                ? "bg-red-600"
                : "bg-green-600"
            }`}
            >
        <p className="font-mono text-xs font-bold uppercase">
          {phase}
        </p>

        <p className="font-mono text-xl font-bold">
          {formattedTime}
        </p>
      </div>
    </div>
  )
}