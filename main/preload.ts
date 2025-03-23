import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"

const handler = {
  once(channel: string, callback: (...args: unknown[]) => void) {
    ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    )
  },
  send: (channel: string, data: any) => {
    const validChannels = ["terminal-init", "terminal-input", "terminal-resize"]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ["terminal-output", "terminal-exit"]
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel)
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  removeAllListeners: (channel: string) => {
    const validChannels = ["terminal-output", "terminal-exit"]
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel)
    }
  },
  fileSystem: {
    readDirectory: async (path: string) => {
      try {
        return await ipcRenderer.invoke("read-directory", path)
      } catch (error) {
        return {
          success: false,
          error: error.message || "Unknown error occurred",
          path,
        }
      }
    },
    getHomeDir: () => ipcRenderer.invoke("get-home-dir"),
    readFile: (path: string) => ipcRenderer.invoke("read-file", path),
    isDirectory: (path: string) => ipcRenderer.invoke("is-directory", path),
    getParentDirectory: (path: string) =>
      ipcRenderer.invoke("get-parent-directory", path),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke("write-file", filePath, content),
    isTextFile: (filePath: string) =>
      ipcRenderer.invoke("is-text-file", filePath),
    isImageFile: (filePath: string) =>
      ipcRenderer.invoke("is-image-file", filePath),
    isPdfFile: (filePath: string) =>
      ipcRenderer.invoke("is-pdf-file", filePath),
  },
  terminal: {
    init: () => ipcRenderer.send("terminal-init"),
    write: (input: string) => ipcRenderer.send("terminal-input", { input }),
    resize: (cols: number, rows: number) =>
      ipcRenderer.send("terminal-resize", { cols, rows }),
    onData: (callback: (data: string) => void) =>
      ipcRenderer.on("terminal-output", (_, data) => callback(data)),
    onExit: (callback: (data: number) => void) =>
      ipcRenderer.on("terminal-exit", (_, data) => callback(data)),
  },
  imageLoader: {
    loadImage: (filePath: string) => ipcRenderer.invoke("load-image", filePath),
  },
  systemInfo: {
    get: () => ipcRenderer.invoke("get-system-info"),
  },
  pdfLoader: {
    loadPdf: (filePath: string) => ipcRenderer.invoke("load-pdf", filePath),
  },
}

contextBridge.exposeInMainWorld("ipc", handler)

export type IpcHandler = typeof handler
