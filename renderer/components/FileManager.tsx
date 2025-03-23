import React, { useState } from "react"
import { FileExplorer } from "./FileExplorer"
import { TextEditor } from "./TextEditor"
import { ImageViewer } from "./ImageViewer"

export function FileManager() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string>("/")
  const [fileType, setFileType] = useState<"text" | "image" | null>(null)

  const handleFileSelect = async (filePath: string) => {
    try {
      const { isText } = await window.ipc.fileSystem.isTextFile(filePath)
      const { isImage } = await window.ipc.fileSystem.isImageFile(filePath)

      console.log("isText", isText)
      console.log("isImage", isImage)

      if (isText) {
        setSelectedFile(filePath)
        setFileType("text")
      } else if (isImage) {
        setSelectedFile(filePath)
        setFileType("image")
      } else {
        alert("This file type is not supported for viewing or editing.")
      }
    } catch (err) {
      console.error("Failed to check file type:", err)
    }
  }

  const handleFileClose = () => {
    setSelectedFile(null)
    setFileType(null)
  }

  if (selectedFile) {
    if (fileType === "text") {
      return <TextEditor filePath={selectedFile} onClose={handleFileClose} />
    } else if (fileType === "image") {
      return <ImageViewer filePath={selectedFile} onClose={handleFileClose} />
    }
  }

  return (
    <FileExplorer
      onFileSelect={handleFileSelect}
      selectedFile={selectedFile}
      setCurrentPath={setCurrentPath}
      currentPath={currentPath}
    />
  )
}
