import { SystemInfo } from "../SRM"
import { ArrowUp, ArrowDown } from "lucide-react"

interface NetworkCardProps {
  network: SystemInfo["network"]
}

export function NetworkCard({ network }: NetworkCardProps) {
  const formatToHighestUnit = (
    value: number | undefined
  ): { value: string; unit: string } => {
    if (!value) return { value: "0.00", unit: "KB/s" }

    if (value >= 1024 * 1024) {
      return { value: (value / (1024 * 1024)).toFixed(2), unit: "GB/s" }
    } else if (value >= 1024) {
      return { value: (value / 1024).toFixed(2), unit: "MB/s" }
    } else {
      return { value: value.toFixed(2), unit: "KB/s" }
    }
  }

  const uploadData = formatToHighestUnit(network.upload)
  const downloadData = formatToHighestUnit(network.download)

  const uploadAmount = uploadData.value
  const downloadAmount = downloadData.value
  const uploadUnit = uploadData.unit
  const downloadUnit = downloadData.unit

  return (
    <div className="flex w-full h-full items-center justify-center col-span-2">
      <div className="text-2xl font-bold text-white flex items-center justify-center w-1/2">
        <ArrowUp />
        <span className="w-32 text-center">{uploadAmount}</span>
        <span className="text-sm ml-1 text-zinc-500">{uploadUnit}</span>
      </div>
      <div className="text-2xl font-bold text-white flex items-center justify-center w-1/2">
        <ArrowDown />
        <span className="w-32 text-center">{downloadAmount}</span>
        <span className="text-sm ml-1 text-zinc-500">{downloadUnit}</span>
      </div>
    </div>
  )
}
