import "@xterm/xterm/css/xterm.css"
import { Terminal as XTerm } from "@xterm/xterm"
// import { FitAddon } from "@xterm/addon-fit"
// import { WebLinksAddon } from "@xterm/addon-web-links"
import { useEffect, useRef, useState } from "react"
import { keyboardEventBus } from "../lib/keyboardEventBus"

interface TerminalProps {
  className?: string
}

export function Terminal({ className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  // const fitAddonRef = useRef<FitAddon | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!terminalRef.current) return

    // const fitAddon = new FitAddon()
    // const webLinksAddon = new WebLinksAddon()

    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#0a0a0a",
        foreground: "#f0f0f0",
        cursor: "#ffffff",
        cursorAccent: "#000000",
      },
      scrollback: 10000,
      convertEol: true,
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      allowTransparency: true,
      disableStdin: false,
    })

    xtermRef.current = terminal
    // terminal.loadAddon(fitAddon)
    // terminal.loadAddon(webLinksAddon)
    terminal.open(terminalRef.current)
    // fitAddon.fit()

    terminal.focus()

    if (typeof window.ipc !== "undefined") {
      const handleTerminalOutput = (data: { output: string }) => {
        if (terminal && data.output) {
          terminal.write(data.output)
          if (!isConnected) {
            setIsConnected(true)
          }
        }
      }

      const handleTerminalExit = (data: { code: number | null }) => {
        terminal.write(`\r\nProcess exited with code ${data.code || 0}\r\n`)
        terminal.write("Reconnecting...\r\n")
        setIsConnected(false)
        setTimeout(() => {
          window.ipc.send("terminal-init", {})
        }, 1000)
      }

      window.ipc.on("terminal-output", handleTerminalOutput)
      window.ipc.on("terminal-exit", handleTerminalExit)

      window.ipc.send("terminal-init", {})

      terminal.onData((data) => {
        window.ipc.send("terminal-input", { input: data })
      })

      terminalRef.current.addEventListener("click", () => {
        terminal.focus()
      })

      terminal.onKey((e) => {
        const ev = e.domEvent

        const clonedEvent = new KeyboardEvent(ev.type, {
          key: ev.key,
          code: ev.code,
          shiftKey: ev.shiftKey,
          altKey: ev.altKey,
          ctrlKey: ev.ctrlKey,
          metaKey: ev.metaKey,
          repeat: ev.repeat,
          bubbles: true,
          cancelable: true,
        })

        keyboardEventBus.emit(ev.type as "keydown" | "keyup", clonedEvent)
      })
    } else {
      terminal.write("Terminal IPC not available in this environment\r\n")
    }

    const handleResize = () => {
      // if (fitAddonRef.current && terminal) {
      //   fitAddonRef.current.fit()
      //   if (terminal.cols && terminal.rows) {
      //     window.ipc?.send("terminal-resize", {
      //       cols: terminal.cols,
      //       rows: terminal.rows,
      //     })
      //   }
      // }
    }

    window.addEventListener("resize", handleResize)
    setTimeout(handleResize, 100)

    const visibilityChange = () => {
      if (!document.hidden) {
        setTimeout(handleResize, 100)
      }
    }
    document.addEventListener("visibilitychange", visibilityChange)

    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", visibilityChange)
      if (typeof window.ipc !== "undefined") {
        window.ipc.removeAllListeners("terminal-output")
        window.ipc.removeAllListeners("terminal-exit")
      }
      terminal.dispose()
    }
  }, [])

  const handleClick = () => {
    if (xtermRef.current) {
      xtermRef.current.focus()
    }
  }

  return (
    <div ref={terminalRef} className={className} onClick={handleClick}></div>
  )
}
