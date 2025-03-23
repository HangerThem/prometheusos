import React, { useEffect, useState } from "react"
import { Folder, File, ChevronUp, RefreshCw, Home } from "lucide-react"

interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size: number
  lastModified: Date
}

interface FileExplorerProps {
  currentPath: string
  setCurrentPath: (path: string) => void
  onFileSelect?: (filePath: string) => void
  selectedFile?: string | null
}

export function FileExplorer({
  currentPath,
  setCurrentPath,
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [errorPath, setErrorPath] = useState<string | null>(null)

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024)
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const loadDirectory = async (dirPath: string) => {
    setLoading(true)
    setError(null)
    setErrorPath(null)

    try {
      const response = await window.ipc.fileSystem.readDirectory(dirPath)

      if (response.success) {
        setFiles(response.files)
        if (currentPath !== dirPath) {
          setCurrentPath(dirPath)
        }
      } else {
        setError(`Failed to access directory: ${response.error}`)
        setErrorPath(dirPath)

        if (dirPath !== "/" && dirPath !== "") {
          const parentDir = await window.ipc.fileSystem.getParentDirectory(
            dirPath
          )
          if (parentDir !== dirPath) {
            loadDirectory(parentDir)
          }
        }
      }
    } catch (error) {
      setError(`Error: ${error.message}`)

      if (!currentPath) {
        try {
          const homeDir = await window.ipc.fileSystem.getHomeDir()
          loadDirectory(homeDir)
        } catch (e) {
          setError("Critical error: Unable to access filesystem")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileClick = async (file: FileInfo) => {
    if (file.isDirectory) {
      loadDirectory(file.path)
    } else if (onFileSelect) {
      onFileSelect(file.path)
    }
  }

  const navigateToParent = async () => {
    if (currentPath) {
      const parentDir = await window.ipc.fileSystem.getParentDirectory(
        currentPath
      )
      loadDirectory(parentDir)
    }
  }

  const navigateToHome = async () => {
    const homeDir = await window.ipc.fileSystem.getHomeDir()
    loadDirectory(homeDir)
  }

  const refreshDirectory = () => {
    if (currentPath) {
      loadDirectory(currentPath)
    }
  }

  useEffect(() => {
    const initializeExplorer = async () => {
      if (currentPath === "/") {
        const homeDir = await window.ipc.fileSystem.getHomeDir()
        await loadDirectory(homeDir)
      } else {
        await loadDirectory(currentPath)
      }
    }

    initializeExplorer()
  }, [])

  useEffect(() => {
    if (currentPath && !loading) {
      const updateFilesForPath = async () => {
        setLoading(true)
        try {
          const response = await window.ipc.fileSystem.readDirectory(
            currentPath
          )
          if (response.success) {
            setFiles(response.files)
          } else {
            setError(`Failed to access directory: ${response.error}`)
            setErrorPath(currentPath)
          }
        } catch (error) {
          setError(`Error: ${error.message}`)
        } finally {
          setLoading(false)
        }
      }

      updateFilesForPath()
    }
  }, [currentPath])

  return (
    <div className="h-full flex flex-col text-gray-200 p-2">
      <div className="flex items-center gap-1">
        <button
          onClick={navigateToHome}
          className="p-2 hover:bg-primary/20"
          title="Home Directory"
        >
          <Home />
        </button>
        <button
          onClick={navigateToParent}
          className="p-2 hover:bg-primary/20"
          title="Parent Directory"
        >
          <ChevronUp />
        </button>
        <button
          onClick={refreshDirectory}
          className="p-2 hover:bg-primary/20"
          title="Refresh"
        >
          <RefreshCw />
        </button>
        <div className="truncate px-2 flex-1 text-sm py-1">{currentPath}</div>
      </div>

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 p-3 m-2 rounded">
            <p className="font-medium">Error</p>
            <p className="text-sm opacity-90">{error}</p>
            {errorPath && (
              <p className="text-xs opacity-75 mt-1">Path: {errorPath}</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xl">Loading directory</span>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4">{error}</div>
        ) : (
          <table className="w-full table-fixed">
            <thead className="sticky top-0 bg-[#0a0a0a]">
              <tr>
                <th className="w-[60%] text-left px-4 py-2">Name</th>
                <th className="w-[15%] text-center px-4 py-2">Size</th>
                <th className="w-[25%] text-right px-4 py-2">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {files
                .sort((a, b) => {
                  if (a.isDirectory && !b.isDirectory) return -1
                  if (!a.isDirectory && b.isDirectory) return 1
                  return a.name.localeCompare(b.name)
                })
                .map((file) => (
                  <tr
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={`hover:bg-primary/20 cursor-pointer ${
                      selectedFile === file.path ? "bg-gray-700" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        {file.isDirectory ? (
                          <Folder className="text-yellow-400 mr-2 flex-shrink-0" />
                        ) : (
                          <File className="text-blue-400 mr-2 flex-shrink-0" />
                        )}
                        <span className="truncate block">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {file.isDirectory ? "—" : formatSize(file.size)}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {new Date(file.lastModified).toLocaleString()}
                    </td>
                  </tr>
                ))}
              {files.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Empty directory
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
