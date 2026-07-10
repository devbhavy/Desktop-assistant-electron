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
      let timeoutId: ReturnType<typeof setTimeout> | null = null
    
      const cleanup = window.electronAPI.onReminderTriggered(
        (incomingReminder) => {
          setReminder(incomingReminder)
    
          timeoutId = setTimeout(() => {
            window.electronAPI.dismissReminderAlert()
          }, 5000)
        }
      )
    
      return () => {
        cleanup()
    
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }, [])

  if (!reminder) return null

  return (
    <div className="h-screen w-screen p-2">
      <div className="flex h-full w-full flex-col justify-between border-[3px] border-black bg-red-500 text-white p-3">
        <p className="font-mono font-bold">
          {reminder.message}
        </p>
      </div>
    </div>
  )
}