import { Cpu } from "lucide-react"
import { SystemInfo } from "../SRM"

interface CPUCardProps {
  cpu: SystemInfo["cpu"]
}

export function CPUCard({ cpu }: CPUCardProps) {
  const usage = parseFloat(cpu?.usage)

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
        <Cpu />
        <span className="w-24 text-center">{cpu.usage}</span>
        <span className="text-sm ml-1 text-zinc-500">%</span>
      </div>

      <div className="flex justify-between text-sm text-zinc-500">
        <span>
          {usage > 70 ? "High Load" : usage > 30 ? "Moderate" : "Low Load"}
        </span>
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
