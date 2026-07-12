import { useEffect, useState } from "react"

export type CatSkin =
  | "orange"
  | "black"
  | "white"

export function Settings() {
  const [alwaysOnTop, setAlwaysOnTop] =
    useState(true)

  const [skin, setSkin] =
    useState<CatSkin>("orange")

  useEffect(() => {
    const loadSettings = async () => {
      const settings =
        await window.electronAPI.getSettings()

      setAlwaysOnTop(settings.alwaysOnTop)
      setSkin(settings.skin)
    }

    loadSettings()
  }, [])

  const handleAlwaysOnTop = () => {
    const nextValue = !alwaysOnTop

    setAlwaysOnTop(nextValue)

    window.electronAPI.setAlwaysOnTop(nextValue)
  }

  const handleSkinChange = (newSkin: CatSkin) => {
    setSkin(newSkin)
    window.electronAPI.setCatSkin(newSkin)
  }

  const handleClose = () => {
    window.electronAPI.closeSettingsWindow()
  }

  return (
    <div className="h-screen w-screen">
      <div className="flex h-full flex-col border-[3px] border-black bg-white p-2 font-mono">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            Settings
          </h1>

          <button
            onClick={handleClose}
            className="border-[3px] border-black bg-black px-3 py-2 font-bold text-white hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        {/* Always on top */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">
            Always on top
          </span>

          <button
            onClick={handleAlwaysOnTop}
            className={`border-[3px] border-black px-4 py-2 font-bold ${
              alwaysOnTop
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {alwaysOnTop ? "ON" : "OFF"}
          </button>
        </div>

        {/* Cat Skin */}
        <div className="mt-4">
          <p className="mb-2 font-bold">
            Cat Skin
          </p>

          <div className="flex gap-2">
            {(["orange", "black", "white"] as CatSkin[]).map((item) => (
              <button
                key={item}
                onClick={() => handleSkinChange(item)}
                className={`flex-1 border-[3px] border-black py-2 font-bold capitalize ${
                  skin === item
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Reset */}
        <button
          onClick={() => {
            window.electronAPI.resetDefault()
            window.electronAPI.closeSettingsWindow()
          }}
          className="border-[3px] border-black bg-black py-2 font-bold text-white hover:bg-red-600"
        >
          Reset Comnyang
        </button>

      </div>
    </div>
  )
}