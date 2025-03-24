import { EventBus } from "#lib/event-bus.ts"
import { FieldTypes } from "./types.ts"

export type RepositoryEvent = {
  "data-changed": { field: keyof FieldTypes }
}

const repositoryEvents = new EventBus<RepositoryEvent>()

export { repositoryEvents }
