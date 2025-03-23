import { useEffect, useState } from "react"

interface PublicData {
  ip: string
  aso: string
  asn: number
  type: string
  continent: string
  cc: string
  country: string
  city: string
  latitude: number
  longitude: number
  tz: string
  weather: string
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [publicData, setPublicData] = useState<PublicData>(null)

  useEffect(() => {
    if (!isOnline) {
      setPublicData(null)
      return
    }

    fetch("https://v4.ident.me/json")
      .then((res) => res.json())
      .then((data) => {
        setPublicData(data)
      })
      .catch((error) => {
        console.error("Failed to fetch public IP data:", error)
      })
  }, [isOnline])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, publicData }
}
