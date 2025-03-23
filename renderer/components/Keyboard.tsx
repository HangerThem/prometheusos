import React, { useState, useEffect, useRef } from "react"
import { keyboardEventBus } from "../lib/keyboardEventBus"

const keyboardLayout = [
  [
    { key: "Esc", width: 1.25 },
    { key: "F1", width: 1 },
    { key: "F2", width: 1 },
    { key: "F3", width: 1 },
    { key: "F4", width: 1 },
    { key: "F5", width: 1 },
    { key: "F6", width: 1 },
    { key: "F7", width: 1 },
    { key: "F8", width: 1 },
    { key: "F9", width: 1 },
    { key: "F10", width: 1 },
    { key: "F11", width: 1 },
    { key: "F12", width: 1 },
    { key: "PrtSc", width: 1 },
    { key: "ScrLk", width: 1 },
    { key: "Pause", width: 1.25 },
  ],
  [
    { key: "`", width: 1 },
    { key: "1", width: 1 },
    { key: "2", width: 1 },
    { key: "3", width: 1 },
    { key: "4", width: 1 },
    { key: "5", width: 1 },
    { key: "6", width: 1 },
    { key: "7", width: 1 },
    { key: "8", width: 1 },
    { key: "9", width: 1 },
    { key: "0", width: 1 },
    { key: "-", width: 1 },
    { key: "=", width: 1 },
    { key: "Backspace", width: 2 },
  ],
  [
    { key: "Tab", width: 1.5 },
    { key: "Q", width: 1 },
    { key: "W", width: 1 },
    { key: "E", width: 1 },
    { key: "R", width: 1 },
    { key: "T", width: 1 },
    { key: "Y", width: 1 },
    { key: "U", width: 1 },
    { key: "I", width: 1 },
    { key: "O", width: 1 },
    { key: "P", width: 1 },
    { key: "[", width: 1 },
    { key: "]", width: 1 },
    { key: "\\", width: 1.5 },
  ],
  [
    { key: "CapsLock", width: 1.75 },
    { key: "A", width: 1 },
    { key: "S", width: 1 },
    { key: "D", width: 1 },
    { key: "F", width: 1 },
    { key: "G", width: 1 },
    { key: "H", width: 1 },
    { key: "J", width: 1 },
    { key: "K", width: 1 },
    { key: "L", width: 1 },
    { key: ";", width: 1 },
    { key: "'", width: 1 },
    { key: "Enter", width: 2.25 },
  ],
  [
    { key: "Shift", width: 2.25, variant: "left" },
    { key: "Z", width: 1 },
    { key: "X", width: 1 },
    { key: "C", width: 1 },
    { key: "V", width: 1 },
    { key: "B", width: 1 },
    { key: "N", width: 1 },
    { key: "M", width: 1 },
    { key: ",", width: 1 },
    { key: ".", width: 1 },
    { key: "/", width: 1 },
    { key: "Shift", width: 2.75, variant: "right" },
  ],
  [
    { key: "Ctrl", width: 1.25, variant: "left" },
    { key: "Win", width: 1.25 },
    { key: "Alt", width: 1.25, variant: "left" },
    { key: "Space", width: 6.25 },
    { key: "Alt", width: 1.25, variant: "right" },
    { key: "Win", width: 1.25 },
    { key: "Menu", width: 1.25 },
    { key: "Ctrl", width: 1.25, variant: "right" },
  ],
]

const keyCodeMap: Record<string, string> = {
  Escape: "Esc",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Backspace: "Backspace",
  Tab: "Tab",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  CapsLock: "CapsLock",
  Semicolon: ";",
  Quote: "'",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  Comma: ",",
  Period: ".",
  Slash: "/",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  MetaLeft: "Win",
  MetaRight: "Win",
  AltLeft: "Alt",
  AltRight: "Alt",
  Space: "Space",
  ContextMenu: "Menu",
}

interface KeyProps {
  label: string
  width: number
  pressed: boolean
  variant?: string
  baseUnit: number
  keyHeight: number
}

const Key = ({ label, width, pressed, baseUnit, keyHeight }) => {
  const specialKey = [
    "Backspace",
    "Tab",
    "CapsLock",
    "Enter",
    "Shift",
    "Ctrl",
    "Win",
    "Alt",
    "Space",
  ].includes(label)

  return (
    <div
      className={`
        flex items-center justify-center text-white border border-zinc-800
        ${pressed ? "bg-primary" : ""} 
        ${specialKey ? "text-xs" : "text-sm"}
        transition-all duration-75 ease-in-out 
				select-none font-sans relative font-bold
      `}
      style={{
        width: `${baseUnit * width}px`,
        height: `${keyHeight}px`,
      }}
    >
      {label}
    </div>
  )
}

export function Keyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const [baseKeyUnit, setBaseKeyUnit] = useState(40)
  const [keyHeight, setKeyHeight] = useState(40)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code
      setPressedKeys((prev) => {
        const updatedKeys = new Set(prev)
        updatedKeys.add(key)
        return updatedKeys
      })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.code
      setPressedKeys((prev) => {
        const updatedKeys = new Set(prev)
        updatedKeys.delete(key)
        return updatedKeys
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    keyboardEventBus.on("keydown", handleKeyDown)
    keyboardEventBus.on("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      keyboardEventBus.off("keydown", handleKeyDown)
      keyboardEventBus.off("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const calculateKeyboardSize = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      const totalWidthUnits = Math.max(
        ...keyboardLayout.map((row) =>
          row.reduce((total, key) => total + key.width, 0)
        )
      )
      const totalHeightUnits = keyboardLayout.length

      const unitByWidth = containerWidth / totalWidthUnits
      const unitByHeight = containerHeight / totalHeightUnits

      setBaseKeyUnit(Math.floor(unitByWidth))
      setKeyHeight(Math.floor(unitByHeight))
    }

    calculateKeyboardSize()

    const resizeObserver = new ResizeObserver(calculateKeyboardSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  const isKeyPressed = (keyLabel: string): boolean => {
    const keyCode = Object.entries(keyCodeMap).find(
      ([_, label]) => label === keyLabel
    )?.[0]

    if (keyLabel.length === 1 && keyLabel.match(/[A-Z]/)) {
      return pressedKeys.has(`Key${keyLabel}`)
    }

    if (keyLabel.length === 1 && keyLabel.match(/[0-9]/)) {
      return pressedKeys.has(`Digit${keyLabel}`)
    }

    if (keyLabel.match(/F[0-9]+/)) {
      return pressedKeys.has(keyLabel)
    }

    return keyCode ? pressedKeys.has(keyCode) : false
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-zinc-800"
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex justify-center w-full">
            {row.map((keyInfo) => (
              <Key
                key={`${keyInfo.key}-${keyInfo.variant || "default"}`}
                label={keyInfo.key}
                width={keyInfo.width}
                pressed={isKeyPressed(keyInfo.key)}
                baseUnit={baseKeyUnit}
                keyHeight={keyHeight}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
