import { Application, Router } from "@oak/oak"
import { logger } from "@kinbay/logger"
import { oakCors } from "@tajpouria/cors"

const app = new Application()

const router = new Router()

router.get("/battle-data", async (ctx) => {
  ctx.response.body = {
    "a": new Date(),
    "b": 2,
    "c": 3,
  }
})
app.use(router.routes())
app.use(router.allowedMethods())
app.use(oakCors())

logger.log("Server is running at http://localhost:8001", "SUCCESS")
await app.listen({ port: 8001 })
