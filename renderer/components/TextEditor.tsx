import React, { useState, useEffect, useRef } from "react"
import { Save, X, Edit, Eye } from "lucide-react"
import hljs from "highlight.js"
import "highlight.js/styles/monokai.css"

interface TextEditorProps {
  filePath: string | null
  onClose: () => void
}

export function TextEditor({ filePath, onClose }: TextEditorProps) {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<boolean>(true)
  const [language, setLanguage] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<boolean>(true)
  const highlightedCodeRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const loadFile = async () => {
      if (!filePath) return

      setLoading(true)
      setError(null)

      try {
        const response = await window.ipc.fileSystem.readFile(filePath)

        if (response.success) {
          setContent(response.content)
          setSaved(true)

          const pathParts = filePath.split(/[/\\]/)
          const name = pathParts[pathParts.length - 1]

          const extension = name.split(".").pop()?.toLowerCase()
          const detectedLanguage = getLanguageFromExtension(extension)
          setLanguage(detectedLanguage)
        } else {
          setError(`Failed to load file: ${response.error}`)
        }
      } catch (err) {
        setError(`Error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadFile()
  }, [filePath])

  useEffect(() => {
    if (!isEditMode && highlightedCodeRef.current && content) {
      const highlightedCode = hljs.highlightAuto(
        content,
        language ? [language] : undefined
      ).value
      highlightedCodeRef.current.innerHTML = highlightedCode
    }
  }, [content, isEditMode, language])

  const getLanguageFromExtension = (extension: string | undefined): string => {
    if (!extension) return ""

    const extensionMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c",
      cpp: "cpp",
      h: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
      sh: "bash",
      bash: "bash",
      sql: "sql",
      xml: "xml",
    }

    return extensionMap[extension] || ""
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setSaved(false)
  }

  const saveFile = async () => {
    if (!filePath) return

    setLoading(true)
    setError(null)

    try {
      const response = await window.ipc.fileSystem.writeFile(filePath, content)

      if (response.success) {
        setSaved(true)
      } else {
        setError(`Failed to save file: ${response.error}`)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No file selected
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center">
          <h2 className="text-sm text-white font-medium truncate max-w-md">
            {filePath} {!saved && "*"}
          </h2>
          {loading && (
            <div className="ml-3">
              <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          )}
          {language && (
            <div className="ml-2 px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">
              {language}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={toggleEditMode}
            className="p-1.5 rounded mr-2 hover:bg-primary/20 text-gray-400"
            title={isEditMode ? "View mode" : "Edit mode"}
          >
            {isEditMode ? <Eye size={16} /> : <Edit size={16} />}
          </button>
          <button
            onClick={saveFile}
            disabled={saved || loading || !isEditMode}
            className={`p-1.5 rounded mr-2 ${
              saved || !isEditMode
                ? "text-gray-500"
                : "hover:bg-primary/20 text-primary"
            }`}
            title="Save"
          >
            <Save size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-primary/20 text-gray-400"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-300 p-3 m-2 rounded">
          {error}
        </div>
      )}

      {isEditMode ? (
        <textarea
          value={content}
          onChange={handleContentChange}
          className="flex-1 bg-[#0a0a0a] text-gray-200 p-2 pb-0 mb-2 resize-none outline-none font-mono"
          spellCheck={false}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#27272a #0a0a0a",
          }}
        />
      ) : (
        <pre
          ref={highlightedCodeRef}
          className="flex-1 bg-[#0a0a0a] text-gray-200 p-2 pb-0 mb-2 overflow-auto font-mono whitespace-pre-wrap"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#27272a #0a0a0a",
          }}
        />
      )}
    </div>
  )
}
