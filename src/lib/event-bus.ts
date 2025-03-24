// import { EventEmitter } from "eventemitter3"

// type EventMap = {
//   [eventName: string]: (...args: any[]) => any
// }

// export class EventBus<T extends EventMap> {
//   private emitter = new EventEmitter()

//   on<K extends keyof T>(event: K, listener: T[K]): this {
//     this.emitter.on(event as string, listener)
//     return this
//   }

//   off<K extends keyof T>(event: K, listener: T[K]): this {
//     this.emitter.off(event as string, listener)
//     return this
//   }

//   once<K extends keyof T>(event: K, listener: T[K]): this {
//     this.emitter.once(event as string, listener)
//     return this
//   }

//   emit<K extends keyof T>(
//     event: K,
//     ...args: Parameters<T[K]>
//   ): ReturnType<T[K]>[] {
//     const listeners = this.emitter.listeners(event as string) as T[K][]
//     return listeners.map((listener) => listener(...args))
//   }
// }

export class EventBus<T> {
  private handlers: {
    [eventName in keyof T]?: ((value: T[eventName]) => void)[]
  }

  constructor() {
    this.handlers = {}
  }

  emit<K extends keyof T>(event: K, value: T[K]): void {
    this.handlers[event]?.forEach((h) => h(value))
  }

  on<K extends keyof T>(
    event: K,
    handler: (value: T[K]) => void,
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [handler]
    } else {
      this.handlers[event].push(handler)
    }
  }
}
