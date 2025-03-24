import { VMIX_SERVER } from "#lib/env.ts"
import { EventRegistries, EventRegistry } from "../types.ts"
import { VmixPlugin } from "./index.ts"

export class ClockPlugin extends VmixPlugin {
  override eventsRegistered: EventRegistries = {
    state: ["init", "play"],
    data: ["teams"],
  }

  protected override createUrls(event: EventRegistry): string[] {
    if (event.state === "init") {
      return [this.resetClock()]
    }
    return []
  }

  public startClock() {
    return `${VMIX_SERVER}/?Function=StartCountdown&Input=${this.blockId}`
  }
  public pauseClock() {
    return ""
  }
  public resetClock() {
    // TODO: Change the function according to vmix docs
    return `${VMIX_SERVER}/?Function=ResetCountdown&Input=${this.blockId}`
  }
}
