/**
 * Simple event bus for sharing keyboard events between components
 */
class KeyboardEventBus {
  private listeners: {
    [eventName: string]: ((event: KeyboardEvent) => void)[]
  } = {}

  /**
   * Emits a keyboard event to all listeners
   */
  emit(eventName: "keydown" | "keyup", event: KeyboardEvent): void {
    if (!this.listeners[eventName]) return

    this.listeners[eventName].forEach((callback) => {
      callback(event)
    })
  }

  /**
   * Registers a listener for a keyboard event
   */
  on(
    eventName: "keydown" | "keyup",
    callback: (event: KeyboardEvent) => void
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = []
    }

    this.listeners[eventName].push(callback)
  }

  /**
   * Removes a listener for a keyboard event
   */
  off(
    eventName: "keydown" | "keyup",
    callback: (event: KeyboardEvent) => void
  ): void {
    if (!this.listeners[eventName]) return

    this.listeners[eventName] = this.listeners[eventName].filter(
      (cb) => cb !== callback
    )
  }
}

export const keyboardEventBus = new KeyboardEventBus()
