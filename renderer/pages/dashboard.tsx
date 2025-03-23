import { useEffect, useState } from "react"
import { usePins } from "../context/usePins"
import { Earth } from "../components/Earth"
import { Terminal } from "../components/Terminal"
import { Keyboard } from "../components/Keyboard"
import { SRM } from "../components/SRM"
import { useOnlineStatus } from "../hooks/useOnlineStatus"
import { FileManager } from "../components/FileManager"

export default function DashboardPage() {
  const { addPin, removePin, setHomePin, homePin } = usePins()
  const { isOnline, publicData } = useOnlineStatus()

  useEffect(() => {
    if (!isOnline) {
      if (homePin) setHomePin(null)
      return
    }
    if (!publicData) return

    const pin = addPin({
      lat: publicData.latitude,
      lon: publicData.longitude,
    })
    setHomePin(pin)

    return () => removePin(pin.id)
  }, [isOnline, publicData])

  return (
    <div className="grid grid-cols-4 grid-rows-3 h-screen">
      <div className="border border-zinc-800 col-span-2 row-span-2 p-2">
        <Terminal className="h-full w-full" />
      </div>
      <div className="border border-zinc-800 col-span-2 row-span-2 overflow-hidden">
        <FileManager />
      </div>
      <div className="border border-zinc-800">
        <Earth />
      </div>
      <div className="border border-zinc-800 col-span-2">
        <Keyboard />
      </div>
      <div className="border border-zinc-800">
        <SRM />
      </div>
    </div>
  )
}
