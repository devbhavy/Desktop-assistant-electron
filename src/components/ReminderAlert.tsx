import { useEffect, useRef, useState } from "react"
import meowSoundCat from "../assets/audio/meow-alert.m4a"

type ReminderData = {
  id: string
  message: string
  time: string
  repeat: string
  date: string
  days: string[]
}

export function ReminderAlert() {
  const meowSound = useRef(new Audio(meowSoundCat));

  const [reminder, setReminder] =
    useState<ReminderData | null>(null)
  
  useEffect(() => {
      const audio = meowSound.current;
      audio.loop = false;
      audio.volume = 0.25;
      audio.currentTime = 0;

      audio.play().catch(() => {});

      return () => {
          audio.pause();
          audio.currentTime = 0;
      };
  }, []);
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
    <div className="h-screen w-screen p-2 flex justify-center items-center">
      <div className="border-[3px] border-black bg-red-500 text-white p-3 font-mono font-bold">
        
        {reminder.message}
        
      </div>
    </div>
  )
}