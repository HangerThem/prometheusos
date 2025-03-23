import { SystemInfo } from "../SRM"

interface UptimeCardProps {
  uptime: SystemInfo["uptime"]
}

export function UptimeCard({ uptime }: UptimeCardProps) {
  const days = Math.floor(uptime / (3600 * 24))
  const hours = Math.floor((uptime % (3600 * 24)) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)

  const formatUptime = () => {
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const startDate = new Date(Date.now() - uptime * 1000)
  const formattedDate = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = startDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col w-full h-full items-center justify-center col-span-2">
      <div className="text-3xl font-bold text-white mb-3">{formatUptime()}</div>

      <div className="text-sm">
        <span className="text-zinc-500">
          {formattedDate} {formattedTime}
        </span>
      </div>
    </div>
  )
}
