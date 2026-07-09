import { useState } from "react"

export function Reminder() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  const [repeat, setRepeat] = useState("once")
  const [message, setMessage] = useState("")
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [showDays, setShowDays] = useState(false)

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    async function handleSave() {
      if (!message.trim()) {
        console.log("Reminder message is required")
        return
      }
    
      if (!time) {
        console.log("Reminder time is required")
        return
      }
    
      if (repeat === "once" && !date) {
        console.log("Date is required for one-time reminders")
        return
      }
    
      if (repeat === "weekly" && selectedDays.length === 0) {
        console.log("Select at least one day")
        return
      }
    
      const reminder = {
        message: message.trim(),
        time,
        repeat,
        date,
        days: selectedDays,
      }
    
      const success =
        await window.electronAPI.saveReminder(reminder)
    
      if (success) {
        handleReset()
        window.electronAPI.closeReminderWindow()
      }
    }

    function handleReset() {
        setTime("")
        setDate("")
        setRepeat("once")
        setMessage("")
        setSelectedDays([])
        setShowDays(false)
      }

  function toggleDay(day: string) {
    setSelectedDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day]
    )
  }

  return (
    <div className="h-screen w-screen p-2">
      <div className="h-full w-full border-[3px] border-black bg-white p-2">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-lg font-bold">
            Reminder
          </h1>

          <button
              onClick={() =>
                window.electronAPI.closeReminderWindow()
              }
              className="bg-black px-3 py-2 font-mono font-bold text-white"
            >
              Close
            </button>
        </div>

        {/* Reminder options */}
        <div className="mt-3 flex items-center gap-2">
        <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-[125px] shrink-0 border-[3px] border-black bg-white px-2 py-2 font-mono font-bold outline-none"
        />

        <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="shrink-0 border-[3px] border-black bg-white px-2 py-2 font-mono font-bold outline-none"
        >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
        </select>

        {repeat === "once" && (
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-w-0 flex-1 border-[3px] border-black bg-white px-2 py-2 font-mono font-bold outline-none"
            />
        )}

        {repeat === "weekly" && (
        <div className="relative min-w-0 flex-1">
            <button
            type="button"
            onClick={() => setShowDays((current) => !current)}
            className="w-full border-[3px] border-black bg-white px-2 py-2 font-mono font-bold"
            >
            {selectedDays.length === 0
                ? "Choose days"
                : selectedDays.join(", ")}
            </button>

            {showDays && (
            <div className="absolute right-0 top-full z-50 mt-1 flex gap-1 border-[3px] border-black bg-white p-2">
                {days.map((day) => (
                <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`border-2 border-black px-2 py-1 font-mono text-sm font-bold ${
                    selectedDays.includes(day)
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                >
                    {day}
                </button>
                ))}
            </div>
            )}
        </div>
        )}
        </div>

        {/* Reminder message */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reminder text..."
            className="min-w-0 flex-1 border-[3px] border-black bg-white px-2 py-2 font-mono font-bold outline-none"
          />

          <button
            onClick={handleReset}
            className="border-[3px] border-black bg-white px-3 py-2 font-mono font-bold"
          >
            Reset
          </button>

          <button
              onClick={handleSave}
              className="bg-black px-3 py-2 font-mono font-bold text-white"
            >
              Save
            </button>
        </div>

        <p className="mt-2 font-mono text-xs text-gray-500">
          Pick a time and type what you want me to remind you about.
        </p>
      </div>
    </div>
  )
}