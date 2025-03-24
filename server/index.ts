import { Application } from "@oak/oak"
import { logger } from "@kinbay/logger"
import { oakCors } from "@tajpouria/cors"
import gameRouter from "./routers/game-router/index.ts"
import { Singleton } from "#singleton"
import imageRouter from "./routers/image/index.ts"

const app = new Application()

app.use(oakCors())
app.use(gameRouter.routes())
app.use(gameRouter.allowedMethods())
app.use(imageRouter.routes())
app.use(imageRouter.allowedMethods())

const singleton = new Singleton()
singleton.init()

logger.log("Server is running at http://localhost:8000", "SUCCESS")
await app.listen({ port: 8000 })
