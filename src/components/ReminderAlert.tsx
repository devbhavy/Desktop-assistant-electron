import { useEffect, useState } from "react"

type ReminderData = {
  id: string
  message: string
  time: string
  repeat: string
  date: string
  days: string[]
}

export function ReminderAlert() {
  const [reminder, setReminder] =
    useState<ReminderData | null>(null)

  useEffect(() => {
    const cleanup =
      window.electronAPI.onReminderTriggered(
        (incomingReminder) => {
          setReminder(incomingReminder)
        }
      )

    return cleanup
  }, [])

  if (!reminder) return null

  return (
    <div className="h-screen w-screen p-2">
      <div className="flex h-full w-full flex-col justify-between border-[3px] border-black bg-white p-3">
        <p className="font-mono font-bold">
          {reminder.message}
        </p>

        <div className="flex justify-end">
          <button
            onClick={() =>
              window.electronAPI.dismissReminderAlert()
            }
            className="bg-black px-3 py-2 font-mono font-bold text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}