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

    window.electronAPI.setAlwaysOnTop(
      nextValue
    )
  }

  const handleSkinChange = (
    newSkin: CatSkin
  ) => {
    setSkin(newSkin)

    window.electronAPI.setCatSkin(
      newSkin
    )
  }

  const handleClose = () => {
    window.electronAPI.closeSettingsWindow()
  }

  return (
    <div className="h-screen w-screen bg-white p-4">
      <div className="flex h-full flex-col gap-6">

        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold">
            Settings
          </h1>

          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center border-2 border-black bg-red-500 font-mono font-bold text-white"
          >
            ×
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono font-bold">
            Always on top
          </span>

          <button
            onClick={handleAlwaysOnTop}
            className={`border-2 border-black px-4 py-1 font-mono font-bold ${
              alwaysOnTop
                ? "bg-green-400"
                : "bg-gray-200"
            }`}
          >
            {alwaysOnTop ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono font-bold">
            Cat Skin
          </span>

          <div className="flex gap-2">
            {(
              [
                "orange",
                "black",
                "white",
              ] as CatSkin[]
            ).map((item) => (
              <button
                key={item}
                onClick={() =>
                  handleSkinChange(item)
                }
                className={`border-2 border-black px-3 py-2 font-mono capitalize ${
                  skin === item
                    ? "bg-amber-300"
                    : "bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <button
            onClick={()=>{
              window.electronAPI.resetDefault()
              window.electronAPI.closeSettingsWindow()
            }}
            className="flex p-1 items-center justify-center border-2 border-black bg-black font-mono font-bold text-white hover:bg-red-500 cursor-pointer"
          >
            Reset Comnyang
          </button>
          
        </div>

      </div>
    </div>
  )
}