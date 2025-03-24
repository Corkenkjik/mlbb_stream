import { EventBus } from "#lib/event-bus.ts"

export type GameControllerEvent = {
  "start-game": null
  "pause-game": null
  "end-game": null
  "tortoise-spawn": null
  "lord-spawn": null
}

const controllerEvents = new EventBus<GameControllerEvent>()

export { controllerEvents }
