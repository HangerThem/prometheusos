import { useEffect, useState } from "react"
import { CPUCard } from "./SRMCards/CPUCard"
import { RAMCard } from "./SRMCards/RAMCard"
import { DiskCard } from "./SRMCards/DiskCard"
import { NetworkCard } from "./SRMCards/NetworkCard"
import { UptimeCard } from "./SRMCards/UptimeCard"

export interface SystemInfo {
  cpu: {
    usage: string
    cores: number
  }
  ram: {
    total: string
    used: string
  }
  disk: {
    read: number
    write: number
  }
  network: {
    upload: number
    download: number
  }
  uptime: number
}

export function SRM() {
  const [info, setInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      const info = await window.ipc.systemInfo.get()
      setInfo(info)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!info) return null

  return (
    <div className="grid grid-cols-2 w-full h-full justify-center">
      <UptimeCard uptime={info.uptime} />
      <CPUCard cpu={info.cpu} />
      <RAMCard ram={info.ram} />
      <DiskCard disk={info.disk} />
      <NetworkCard network={info.network} />
    </div>
  )
}
