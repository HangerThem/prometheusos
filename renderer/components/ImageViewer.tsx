import React, { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ImageViewerProps {
  filePath: string
  onClose: () => void
}

export function ImageViewer({ filePath, onClose }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setError(null)
        const dataUrl = await window.ipc.imageLoader.loadImage(filePath)
        setImageUrl(dataUrl)
      } catch (err) {
        console.error("Failed to load image:", err)
        setError("Failed to load image")
      }
    }

    loadImage()
  }, [filePath])

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center">
          <h2 className="text-sm text-white font-medium truncate max-w-md">
            {filePath}
          </h2>
          {/* {loading && (
            <div className="ml-3">
              <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          )}
          {language && (
            <div className="ml-2 px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">
              {language}
            </div>
          )} */}
        </div>
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-primary/20 text-gray-400"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-white bg-red-500 p-4 rounded-md">{error}</div>
      ) : imageUrl ? (
        <div className="w-full h-full overflow-auto flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Image preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="text-white">Loading image...</div>
      )}
    </div>
  )
}
