import { createContext, ReactNode, useContext, useState } from "react"

export interface Pin {
  id: string
  lat: number
  lon: number
  color?: string
  radius?: number
}

interface PinsContextValue {
  pins: Pin[]
  homePin: Pin | null
  setHomePin: (pin: Pin | null) => void
  addPin: (pin: Omit<Pin, "id">) => Pin
  updatePin: (pin: Pin) => void
  removePin: (id: string) => void
  selectedPinId: string | null
  selectPin: (id: string | null) => void
}

const PinsContext = createContext<PinsContextValue | undefined>(undefined)

interface PinsProviderProps {
  children: ReactNode
}

export function PinsProvider({ children }: PinsProviderProps) {
  const [pins, setPins] = useState<Pin[]>([])
  const [homePin, setHomePin] = useState<Pin | null>(null)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)

  function addPin(pin: Omit<Pin, "id">) {
    const id = crypto.randomUUID()
    setPins((pins) => [...pins, { ...pin, id }])
    return pins.find((p) => p.id === id)!
  }

  function updatePin(pin: Pin) {
    setPins((pins) => pins.map((p) => (p.id === pin.id ? pin : p)))
  }

  function removePin(id: string) {
    if (selectedPinId === id) {
      setSelectedPinId(null)
    }
    setPins((pins) => pins.filter((pin) => pin.id !== id))
  }

  function selectPin(id: string | null) {
    setSelectedPinId(id)
  }

  return (
    <PinsContext.Provider
      value={{
        pins,
        homePin,
        setHomePin,
        addPin,
        updatePin,
        removePin,
        selectedPinId,
        selectPin,
      }}
    >
      {children}
    </PinsContext.Provider>
  )
}

export function usePins() {
  const context = useContext(PinsContext)
  if (!context) {
    throw new Error("usePins must be used within a PinsProvider")
  }
  return context
}
