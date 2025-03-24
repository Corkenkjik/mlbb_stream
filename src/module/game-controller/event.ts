import { EventBus } from "#lib/event-bus.ts"

export type GameControllerEvent = {
  "reset": null
  "adjust-game": null
  "start-game": null
  "pause-game": null
  "end-game": null
  "tortoise-spawn": null
  "tortoise-kill": { killer: string }
  "lord-spawn": null
  "lord-kill": { killer: string }
}

const controllerEvents = new EventBus<GameControllerEvent>()

export { controllerEvents }
