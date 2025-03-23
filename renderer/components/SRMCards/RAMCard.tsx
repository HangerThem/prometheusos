import { MemoryStick } from "lucide-react"
import { SystemInfo } from "../SRM"

interface RAMCardProps {
  ram: SystemInfo["ram"]
}

export function RAMCard({ ram }: RAMCardProps) {
  const usage = (parseFloat(ram.used) / parseFloat(ram.total)) * 100

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
        <MemoryStick />
        <span className="w-24 text-center">{ram.used}</span>
        <span className="text-sm ml-1 text-zinc-500">GB</span>
      </div>

      <div className="flex justify-between text-sm text-zinc-500">
        <span>{ram.total} GB</span>
      </div>

      <div className="w-[80%] h-1 bg-zinc-800 mt-4">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${usage}%` }}
        />
      </div>
    </div>
  )
}
