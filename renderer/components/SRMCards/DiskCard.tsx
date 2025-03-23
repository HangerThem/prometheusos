import { HardDriveDownload, HardDriveUpload } from "lucide-react"
import { SystemInfo } from "../SRM"

interface DiskCardProps {
  disk: SystemInfo["disk"]
}

export function DiskCard({ disk }: DiskCardProps) {
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

  const readData = formatToHighestUnit(disk.read)
  const writeData = formatToHighestUnit(disk.write)

  const readAmount = readData.value
  const writeAmount = writeData.value
  const readUnit = readData.unit
  const writeUnit = writeData.unit

  return (
    <div className="flex w-full h-full items-center justify-center col-span-2">
      <div className="text-2xl font-bold text-white flex items-center justify-center w-1/2">
        <HardDriveUpload />
        <span className="w-32 text-center">{readAmount}</span>
        <span className="text-sm ml-1 text-zinc-500">{readUnit}</span>
      </div>
      <div className="text-2xl font-bold text-white flex items-center justify-center w-1/2">
        <HardDriveDownload />
        <span className="w-32 text-center">{writeAmount}</span>
        <span className="text-sm ml-1 text-zinc-500">{writeUnit}</span>
      </div>
    </div>
  )
}
