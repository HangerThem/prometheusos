interface FileSystemAPI {
  readDirectory: (path: string) => Promise<{
    success: boolean
    files?: Array<{
      name: string
      path: string
      isDirectory: boolean
      size: number
      lastModified: Date
    }>
    error?: string
  }>
  getHomeDir: () => Promise<string>
  readFile: (
    path: string
  ) => Promise<{ success: boolean; content?: string; error?: string }>
  isDirectory: (path: string) => Promise<boolean>
  getParentDirectory: (path: string) => Promise<string>
  writeFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>
  isTextFile: (filePath: string) => Promise<{ isText: boolean; error?: string }>
  isImageFile: (
    filePath: string
  ) => Promise<{ isImage: boolean; error?: string }>
  isPdfFile: (filePath: string) => Promise<{ isPdf: boolean; error?: string }>
}

interface TerminalAPI {
  onData: (callback: (data: string) => void) => void
  onExit: (callback: (data: number) => void) => void
  write: (input: string) => void
  resize: (cols: number, rows: number) => void
  init: () => void
}

interface IpcRenderer {
  send(channel: string, data: any): void
  on(channel: string, func: (...args: any[]) => void): void
  once(channel: string, func: (...args: any[]) => void): void
  removeAllListeners(channel: string): void
  fileSystem: FileSystemAPI
  terminal: TerminalAPI
  systemInfo: {
    get: () => Promise<any>
  }
  imageLoader: {
    loadImage: (filePath: string) => Promise<string>
  }
  pdfLoader: {
    loadPdf: (filePath: string) => Promise<string>
  }
}

declare global {
  interface Window {
    ipc: IpcRenderer
  }
}

export {}
