import path from "path"
import { app, ipcMain } from "electron"
import serve from "electron-serve"
import { createWindow } from "./helpers"
import si from "systeminformation"
import os from "os"
import * as pty from "node-pty"
import fs from "fs"

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
  serve({ directory: "app" })
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`)
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow("main", {
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  })

  if (isProd) {
    await mainWindow.loadURL("app://./home")
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on("window-all-closed", () => {
  app.quit()
})

let ptyProcess: any = null

ipcMain.on("terminal-init", (event) => {
  if (ptyProcess) {
    ptyProcess.kill()
    ptyProcess = null
  }

  const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash"
  const args = process.platform === "win32" ? [] : ["-l"]

  try {
    ptyProcess = pty.spawn(shell, args, {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: os.homedir(),
      env: {
        ...process.env,
        TERM: "xterm-256color",
        FORCE_COLOR: "1",
        COLORTERM: "truecolor",
      },
    })

    ptyProcess.onData((data: any) => {
      event.sender.send("terminal-output", { output: data })
    })

    ptyProcess.onExit(({ exitCode, signal }) => {
      event.sender.send("terminal-exit", { code: exitCode })
      ptyProcess = null
    })
  } catch (error) {
    event.sender.send("terminal-output", {
      output: `\r\nError initializing terminal: ${error.message}\r\n`,
    })
  }
})

ipcMain.on("terminal-input", (event, { input }) => {
  if (!ptyProcess) {
    ipcMain.emit("terminal-init", event)
    setTimeout(() => {
      if (ptyProcess) {
        ptyProcess.write(input)
      }
    }, 100)
    return
  }

  try {
    ptyProcess.write(input)
  } catch (error) {
    event.sender.send("terminal-output", {
      output: "\r\nError writing to terminal\r\n",
    })
  }
})

ipcMain.on("terminal-resize", (event, { cols, rows }) => {
  if (ptyProcess) {
    try {
      ptyProcess.resize(cols, rows)
    } catch (error) {
      console.error("Failed to resize terminal:", error)
    }
  }
})

app.on("before-quit", () => {
  if (ptyProcess) {
    ptyProcess.kill()
  }
})

async function getSystemInfo() {
  const cpu = await si.currentLoad()
  const mem = await si.mem()
  const disk = await si.fsStats()
  const net = await si.networkStats()

  return {
    cpu: { usage: cpu.currentLoad.toFixed(2), cores: os.cpus().length },
    ram: {
      total: (mem.total / 1e9).toFixed(2),
      used: (mem.used / 1e9).toFixed(2),
    },
    disk: { read: disk.rx_sec, write: disk.wx_sec },
    network: { upload: net[0].tx_sec, download: net[0].rx_sec },
    uptime: os.uptime(),
  }
}

ipcMain.handle("get-system-info", async () => {
  return await getSystemInfo()
})

ipcMain.handle("read-directory", async (_, dirPath) => {
  try {
    const stats = await fs.promises.stat(dirPath)
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: `Path is not a directory: ${dirPath}`,
      }
    }

    const files = await fs.promises.readdir(dirPath)
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(dirPath, file)
          const stats = await fs.promises.stat(filePath)
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            lastModified: stats.mtime,
            error: null,
          }
        } catch (error) {
          return {
            name: file,
            path: path.join(dirPath, file),
            isDirectory: false,
            size: 0,
            lastModified: new Date(),
            error: error.code || "ERROR",
          }
        }
      })
    )

    const accessibleFiles = fileDetails.filter((file) => !file.error)

    return { success: true, files: accessibleFiles }
  } catch (error) {
    console.error("Failed to read directory:", error)
    return {
      success: false,
      error: `${error.message} (${error.code})`,
      path: dirPath,
    }
  }
})

ipcMain.handle("get-home-dir", async () => {
  return os.homedir()
})

ipcMain.handle("read-file", async (_, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, "utf8")
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("is-directory", async (_, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath)
    return stats.isDirectory()
  } catch (error) {
    return false
  }
})

ipcMain.handle("get-parent-directory", (_, currentPath) => {
  return path.dirname(currentPath)
})

ipcMain.handle("write-file", async (_, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content, "utf8")
    return { success: true }
  } catch (error) {
    console.error("Failed to write file:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("is-text-file", async (_, filePath) => {
  try {
    const stat = await fs.promises.stat(filePath)

    if (stat.size > 10 * 1024 * 1024) {
      return { isText: false, reason: "File too large" }
    }

    const ext = path.extname(filePath).toLowerCase()

    const binaryExtensions = [
      ".exe",
      ".dll",
      ".obj",
      ".bin",
      ".dat",
      ".mp3",
      ".mp4",
      ".mov",
      ".avi",
      ".zip",
      ".tar",
      ".gz",
      ".rar",
      ".7z",
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
    ]

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".tiff",
      ".ico",
    ]

    if (binaryExtensions.includes(ext) || imageExtensions.includes(ext)) {
      return { isText: false }
    }

    const buffer = Buffer.alloc(4096)
    const fd = await fs.promises.open(filePath, "r")
    const { bytesRead } = await fd.read(buffer, 0, 4096, 0)
    await fd.close()

    for (let i = 0; i < bytesRead; i++) {
      const byte = buffer[i]
      if (
        (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) ||
        byte === 0
      ) {
        return { isText: false }
      }
    }

    return { isText: true }
  } catch (error) {
    console.error("Failed to check if file is text:", error)
    return { isText: false, error: error.message }
  }
})

ipcMain.handle("is-image-file", async (_, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase()
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".tiff",
      ".ico",
    ]

    if (!imageExtensions.includes(ext)) {
      return { isImage: false }
    }

    const buffer = Buffer.alloc(8)
    const fd = await fs.promises.open(filePath, "r")
    await fd.read(buffer, 0, 8, 0)
    await fd.close()

    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]
    const jpgSignature = [255, 216]

    let isImage = false
    if (ext === ".png") {
      isImage = pngSignature.every((byte, index) => buffer[index] === byte)
    } else if (ext === ".jpg" || ext === ".jpeg") {
      isImage = jpgSignature.every((byte, index) => buffer[index] === byte)
    }

    return { isImage }
  } catch (error) {
    console.error("Failed to check if file is an image:", error)
    return { isImage: false, error: error.message }
  }
})

ipcMain.handle("is-pdf-file", async (_, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase()

    if (ext !== ".pdf") {
      return { isPdf: false }
    }

    // Check file signature for PDF
    const buffer = Buffer.alloc(5)
    const fd = await fs.promises.open(filePath, "r")
    await fd.read(buffer, 0, 5, 0)
    await fd.close()

    // PDF signature is "%PDF-"
    const isPdf = buffer.toString().startsWith("%PDF-")

    return { isPdf }
  } catch (error) {
    console.error("Failed to check if file is a PDF:", error)
    return { isPdf: false, error: error.message }
  }
})

ipcMain.handle("load-pdf", async (_, filePath) => {
  try {
    return await loadPdf(filePath)
  } catch (error) {
    console.error("Error loading PDF:", error)
    throw error
  }
})

async function loadPdf(path: string): Promise<string> {
  try {
    const buffer = await fs.promises.readFile(path)
    const base64 = buffer.toString("base64")
    return `data:application/pdf;base64,${base64}`
  } catch (error) {
    console.error("Error loading PDF:", error)
    throw error
  }
}

ipcMain.handle("load-image", async (_, filePath) => {
  try {
    return await loadImage(filePath)
  } catch (error) {
    return null
  }
})

async function loadImage(path: string): Promise<string> {
  try {
    const buffer = await fs.promises.readFile(path)
    const base64 = buffer.toString("base64")
    const extension = path.split(".").pop()?.toLowerCase()
    let mimeType = "image/jpeg"

    if (extension === "png") mimeType = "image/png"
    else if (extension === "gif") mimeType = "image/gif"
    else if (extension === "svg") mimeType = "image/svg+xml"
    else if (extension === "webp") mimeType = "image/webp"

    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error("Error loading image:", error)
    throw error
  }
}
